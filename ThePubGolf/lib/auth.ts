// Edge-compatible cookie signing (Web Crypto only — no Node.js Buffer)

const encoder = new TextEncoder()

async function hmacHex(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function toBase64(str: string): string {
  return btoa(encodeURIComponent(str))
}

function fromBase64(str: string): string {
  return decodeURIComponent(atob(str))
}

export async function createSignedCookie(payload: object): Promise<string> {
  const b64 = toBase64(JSON.stringify(payload))
  const sig = await hmacHex(process.env.AUTH_SECRET!, b64)
  return `${b64}.${sig}`
}

export async function verifySignedCookie<T>(value: string): Promise<T | null> {
  const dotIdx = value.lastIndexOf('.')
  if (dotIdx === -1) return null
  const b64 = value.slice(0, dotIdx)
  const sig = value.slice(dotIdx + 1)
  try {
    const expected = await hmacHex(process.env.AUTH_SECRET!, b64)
    if (sig !== expected) return null
    return JSON.parse(fromBase64(b64)) as T
  } catch {
    return null
  }
}

export const PLAYER_COOKIE = 'player_id'
export const ADMIN_COOKIE = 'admin'

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
}
