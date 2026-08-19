import { NextResponse, type NextRequest } from 'next/server'
import { sql } from '@/lib/db'
import { firmarAcceso, COOKIE } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ codigo: string }> }
) {
  const { codigo } = await params
  const home = new URL('/', req.url)

  const filas = (await sql`
    select id, max_usos, usos, activo, expira_en
    from invitaciones
    where upper(codigo) = upper(${codigo})
    limit 1
  `) as any[]

  const inv = filas[0]
  const vencida = inv?.expira_en && new Date(inv.expira_en) < new Date()

  if (!inv || !inv.activo || vencida || inv.usos >= inv.max_usos) {
    home.searchParams.set('codigo', 'invalido')
    return NextResponse.redirect(home)
  }

  const nuevos = (await sql`
    insert into miembros (invitacion_id) values (${inv.id}) returning id
  `) as any[]

  await sql`update invitaciones set usos = usos + 1 where id = ${inv.id}`

  const res = NextResponse.redirect(new URL('/drop', req.url))
  res.cookies.set(COOKIE, await firmarAcceso(nuevos[0].id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  })
  return res
}