import { describe, it, expect } from 'vitest'
import { isValidReactionTime, average } from '@/lib/utils/minigame'

describe('isValidReactionTime', () => {
  it('accepts values in range', () => {
    expect(isValidReactionTime(80)).toBe(true)
    expect(isValidReactionTime(500)).toBe(true)
    expect(isValidReactionTime(10_000)).toBe(true)
  })

  it('rejects values out of range', () => {
    expect(isValidReactionTime(79)).toBe(false)
    expect(isValidReactionTime(10_001)).toBe(false)
    expect(isValidReactionTime(0)).toBe(false)
    expect(isValidReactionTime(-1)).toBe(false)
  })
})

describe('average', () => {
  it('computes rounded average', () => {
    expect(average([300, 400, 500])).toBe(400)
    expect(average([301, 302, 303])).toBe(302)
  })

  it('rounds correctly', () => {
    expect(average([100, 101])).toBe(101) // 100.5 → rounds to 101
  })

  it('returns 0 for empty array', () => {
    expect(average([])).toBe(0)
  })
})
