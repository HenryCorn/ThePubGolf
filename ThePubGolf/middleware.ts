import { NextRequest, NextResponse } from 'next/server'

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

async function verifySignedCookie<T>(value: string): Promise<T | null> {
  const dotIdx = value.lastIndexOf('.')
  if (dotIdx === -1) return null
  const b64 = value.slice(0, dotIdx)
  const sig = value.slice(dotIdx + 1)
  try {
    const expected = await hmacHex(process.env.AUTH_SECRET!, b64)
    if (sig !== expected) return null
    return JSON.parse(decodeURIComponent(atob(b64))) as T
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes — no auth required
  if (pathname === '/' || pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Admin routes require admin cookie
  if (pathname.startsWith('/admin')) {
    const adminCookie = request.cookies.get('admin')?.value
    if (!adminCookie) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    const payload = await verifySignedCookie<{ admin: boolean }>(adminCookie)
    if (!payload?.admin) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return NextResponse.next()
  }

  // All other routes require a valid player session
  const playerCookie = request.cookies.get('player_id')?.value
  if (!playerCookie) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  const payload = await verifySignedCookie<{ player_id: string }>(playerCookie)
  if (!payload?.player_id) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Match all routes except Next.js internals and API routes
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|api/).*)'],
}
