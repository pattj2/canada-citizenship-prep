import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export default async function middleware(req: Request & { nextUrl: URL }) {
  const token = await getToken({ req: req as never, secret: process.env.NEXTAUTH_SECRET })
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')

  if (!token) {
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAdminRoute && token.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/study/:path*',
    '/leaders/:path*',
    '/admin/:path*',
  ],
}
