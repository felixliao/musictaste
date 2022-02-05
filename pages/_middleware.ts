import { getToken } from 'next-auth/jwt'
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest, ev: NextFetchEvent) {
  const token = await getToken({ req, secret: process.env.JWT_SECRET })
  const { pathname } = req.nextUrl

  if (pathname.includes('api/auth') || token) {
    return NextResponse.next()
  }

  if (!token) {
    const url = req.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.rewrite(url)
  }
}

