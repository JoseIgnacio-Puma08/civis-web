import { NextResponse, type NextRequest } from 'next/server'
import { verificarAcceso, COOKIE } from '@/lib/auth'

export async function middleware(req: NextRequest) {
  const mid = await verificarAcceso(req.cookies.get(COOKIE)?.value)
  if (!mid) {
    return NextResponse.redirect(new URL('/', req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/drop/:path*', '/checkout/:path*'],
}