import { NextRequest, NextResponse } from 'next/server'
import { verifySignedCookie } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminCookie = request.cookies.get('admin')?.value
    if (!adminCookie) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    const payload = await verifySignedCookie<{ admin: boolean }>(adminCookie)
    if (!payload?.admin) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
