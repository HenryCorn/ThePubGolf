import { describe, it, expect } from 'vitest'
import { generateFacePositions } from '@/lib/utils/placement'

const FACE_SIZE = 56
const VIEWPORT_W = 375
const VIEWPORT_H = 667
const SAFE_TOP = 60
const SAFE_BOTTOM = 80

describe('generateFacePositions', () => {
  it('returns the requested number of positions', () => {
    const positions = generateFacePositions(9, VIEWPORT_W, VIEWPORT_H)
    expect(positions).toHaveLength(9)
  })

  it('all faces are within viewport bounds', () => {
    const positions = generateFacePositions(9, VIEWPORT_W, VIEWPORT_H, SAFE_TOP, SAFE_BOTTOM)
    positions.forEach(({ x, y }) => {
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x + FACE_SIZE).toBeLessThanOrEqual(VIEWPORT_W)
      expect(y).toBeGreaterThanOrEqual(SAFE_TOP)
      expect(y + FACE_SIZE).toBeLessThanOrEqual(VIEWPORT_H - SAFE_BOTTOM)
    })
  })

  it('no two faces overlap', () => {
    const positions = generateFacePositions(9, VIEWPORT_W, VIEWPORT_H)
    const minDist = FACE_SIZE + 8

    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const dx = (positions[i].x + FACE_SIZE / 2) - (positions[j].x + FACE_SIZE / 2)
        const dy = (positions[i].y + FACE_SIZE / 2) - (positions[j].y + FACE_SIZE / 2)
        const dist = Math.sqrt(dx * dx + dy * dy)
        expect(dist).toBeGreaterThanOrEqual(minDist - 1)
      }
    }
  })
})
