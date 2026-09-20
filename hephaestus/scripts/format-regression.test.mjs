import assert from 'node:assert/strict'
import { test } from 'node:test'
import { configureMoneyFormat, dollarsToCents, formatNzd, formatHourlyRate } from '../src/utils/format.ts'

test('decimal money input rounds exactly and retains large cent values', () => {
  assert.equal(dollarsToCents('1.005'), '101')
  assert.equal(dollarsToCents('2.675'), '268')
  assert.equal(dollarsToCents('-1.005'), '-101')
  assert.equal(dollarsToCents('90,071,992,547,409.93'), '9007199254740993')
  assert.equal(dollarsToCents('.50'), '50')
  assert.equal(dollarsToCents('invalid'), '')
})

test('currency display preserves sign and cents beyond Number precision', () => {
  assert.equal(formatNzd('-12345'), '-$123.45')
  assert.equal(formatNzd(-123.45), '-$123.45')
  assert.equal(formatNzd('12345', { signed: true }), '+$123.45')
  assert.equal(formatNzd('9007199254740993'), '$90,071,992,547,409.93')
  assert.equal(formatNzd('0'), '$0.00')
})

test('hourly estimate includes all supplied work minutes, including unsettled work', () => {
  assert.equal(formatHourlyRate('120000', 600), '$120.00/h')
  assert.equal(formatHourlyRate('0', 600), '$0.00/h')
  assert.equal(formatHourlyRate('120000', 0), '—')
  assert.equal(formatHourlyRate(null, 600), '—')
})

test('display currency changes reactively without applying a hidden exchange rate', () => {
  configureMoneyFormat('EUR', 'ja')
  assert.equal(formatNzd('12345'), '€123.45')
  configureMoneyFormat('NZD', 'en')
  assert.equal(formatNzd('12345'), '$123.45')
})
