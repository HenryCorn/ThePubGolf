export const MIN_REACTION_MS = 80
export const MAX_REACTION_MS = 10_000
export const RANDOM_DELAY_MIN = 300
export const RANDOM_DELAY_MAX = 1500
export const NUM_ROUNDS = 3
export const NUM_FACES = 9
export const TARGET_FACE = '🫠'

export const FUN_FACES = [
  '😀', '😂', '🥹', '😍', '🤩', '😎', '🤓', '🤪', '😏',
  '😤', '🤯', '😱', '🥸', '😜', '🤗', '😒', '🙄', '😬',
  '🤭', '🥴', '😵', '😶', '🤐', '😑', '😴', '🤤', '🤢',
]

export function randomDelay(): number {
  return RANDOM_DELAY_MIN + Math.random() * (RANDOM_DELAY_MAX - RANDOM_DELAY_MIN)
}

export function isValidReactionTime(ms: number): boolean {
  return ms >= MIN_REACTION_MS && ms <= MAX_REACTION_MS
}

export function average(nums: number[]): number {
  if (nums.length === 0) return 0
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)
}
