import { expect, test } from 'vitest'
import { tc, tcatch, tryCatch } from '../src'

test('returns a value tuple synchronously', () => {
  expect(tcatch(() => 42)).toEqual([42, null])
})

test('returns an error tuple synchronously', () => {
  const error = new Error('nope')

  expect(tcatch(() => { throw error })).toEqual([null, error])
})

test('returns a promise tuple for an async callback', async () => {
  await expect(tcatch(async () => 'done')).resolves.toEqual(['done', null])
})

test('catches an async rejection', async () => {
  const error = new Error('nope')

  await expect(tcatch(() => Promise.reject(error))).resolves.toEqual([null, error])
})

test('exports short aliases', () => {
  expect(tc(() => 'thenable')).toEqual(['thenable', null])
  expect(tryCatch(() => true)).toEqual([true, null])
})
