import assert from 'node:assert/strict'
import { test } from 'node:test'
import { formatApolloPersonName, parseApolloDisplayName } from '../src/utils/personName.ts'

const name = { givenName: 'Taro', middleName: '', familyName: 'Yamada' }

test('name order follows Apollo for each supported interface language', () => {
  assert.equal(formatApolloPersonName(name, 'en'), 'Taro Yamada')
  assert.equal(formatApolloPersonName(name, 'zh'), 'YamadaTaro')
  assert.equal(formatApolloPersonName(name, 'ja'), 'YamadaTaro')
  assert.equal(formatApolloPersonName(name, 'ko'), 'YamadaTaro')
})

test('middle names use Apollo spacing and order', () => {
  const full = { givenName: 'Taro', middleName: 'Ken', familyName: 'Yamada' }
  assert.equal(formatApolloPersonName(full, 'en'), 'Taro Ken Yamada')
  assert.equal(formatApolloPersonName(full, 'ja'), 'Yamada Ken Taro')
})

test('legacy spaced display names can be reordered after a language change', () => {
  const parsed = parseApolloDisplayName('Taro Ken Yamada', 'en')
  assert.ok(parsed)
  assert.equal(formatApolloPersonName(parsed, 'zh'), 'Yamada Ken Taro')
})
