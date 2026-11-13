import { NextResponse } from 'next/server'
import { firmarAdmin, ADMIN_COOKIE } from '@/lib/admin'

export async function POST(req: Request) {
  const { pass } = await req.json()

  if (!process.env.ADMIN_PASSWORD || pass !== process.env.ADMIN_PASSWORD) {
    await new Promise(r => setTimeout(r, 600))
    return NextResponse.json({ error: 'no' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_COOKIE, await firmarAdmin(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
  return res
}