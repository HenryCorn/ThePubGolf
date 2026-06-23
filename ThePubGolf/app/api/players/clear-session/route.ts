import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { PLAYER_COOKIE } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  cookieStore.delete(PLAYER_COOKIE)
  return NextResponse.redirect(new URL('/', req.url))
}
