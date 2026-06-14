export interface Point { x: number; y: number }

const FACE_SIZE = 56
const PADDING = 8

export function generateFacePositions(
  count: number,
  width: number,
  height: number,
  safeTop = 60,
  safeBottom = 80
): Point[] {
  const minX = PADDING
  const maxX = width - FACE_SIZE - PADDING
  const minY = safeTop + PADDING
  const maxY = height - safeBottom - FACE_SIZE - PADDING
  const radius = FACE_SIZE / 2 + 4

  const positions: Point[] = []
  let attempts = 0
  const maxAttempts = count * 200

  while (positions.length < count && attempts < maxAttempts) {
    attempts++
    const x = Math.random() * (maxX - minX) + minX
    const y = Math.random() * (maxY - minY) + minY

    const cx = x + FACE_SIZE / 2
    const cy = y + FACE_SIZE / 2

    const overlaps = positions.some((p) => {
      const dx = cx - (p.x + FACE_SIZE / 2)
      const dy = cy - (p.y + FACE_SIZE / 2)
      return Math.sqrt(dx * dx + dy * dy) < radius * 2
    })

    if (!overlaps) {
      positions.push({ x, y })
    }
  }

  return positions
}
