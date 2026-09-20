import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = fileURLToPath(new URL('../src', import.meta.url))
const flatten = (value, prefix = '') => Object.fromEntries(Object.entries(value).flatMap(([key, item]) => typeof item === 'object' ? Object.entries(flatten(item, `${prefix}${key}.`)) : [[`${prefix}${key}`, item]]))
const catalogs = Object.fromEntries(['en', 'zh', 'ja', 'ko'].map(locale => [locale, flatten(JSON.parse(readFileSync(path.join(root, 'locales', locale, 'common.json'), 'utf8')))]))
const placeholders = value => [...value.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort()

test('every language defines all keys and preserves interpolation parameters', () => {
  const keys = Object.keys(catalogs.en).sort()
  for (const [locale, messages] of Object.entries(catalogs)) {
    assert.deepEqual(Object.keys(messages).sort(), keys, `${locale} keys`)
    for (const key of keys) {
      assert.ok(messages[key].trim(), `${locale}.${key} is empty`)
      assert.deepEqual(placeholders(messages[key]), placeholders(catalogs.en[key]), `${locale}.${key} placeholders`)
    }
  }
})

test('literal translation references resolve without fallback', () => {
  function scan(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name)
      if (entry.isDirectory()) scan(file)
      else if (/\.(vue|ts)$/.test(entry.name)) {
        const source = readFileSync(file, 'utf8')
        for (const match of source.matchAll(/\bt\(['"]([\w.]+)['"]/g)) {
          assert.ok(catalogs.en[match[1]], `${path.relative(root, file)}: ${match[1]}`)
        }
      }
    }
  }
  scan(root)
})
