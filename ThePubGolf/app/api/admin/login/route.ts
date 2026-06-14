import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createSignedCookie, ADMIN_COOKIE, COOKIE_OPTIONS } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { passcode } = await req.json()

  if (!passcode || passcode !== process.env.ADMIN_PASSCODE) {
    return NextResponse.json({ error: 'Wrong passcode' }, { status: 401 })
  }

  const cookieValue = await createSignedCookie({ admin: true })
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_COOKIE, cookieValue, { ...COOKIE_OPTIONS, maxAge: 60 * 60 * 12 })

  return NextResponse.json({ ok: true })
}
