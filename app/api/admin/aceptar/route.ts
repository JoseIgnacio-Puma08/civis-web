import { NextResponse } from 'next/server'
import { esAdmin } from '@/lib/admin'
import { sql } from '@/lib/db'

const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function generarCodigo() {
  return Array.from({ length: 6 }, () =>
    ALFABETO[Math.floor(Math.random() * ALFABETO.length)]
  ).join('')
}

export async function POST(req: Request) {
  if (!(await esAdmin())) {
    return NextResponse.json({ error: 'no autorizado' }, { status: 401 })
  }

  const { id } = await req.json()

  const filas = (await sql`
    select contacto, estado from lista_espera where id = ${id}
  `) as any[]

  if (!filas[0]) {
    return NextResponse.json({ error: 'no existe' }, { status: 404 })
  }

  let codigo = ''
  for (let i = 0; i < 5; i++) {
    codigo = generarCodigo()
    const dup = (await sql`select id from invitaciones where codigo = ${codigo}`) as any[]
    if (dup.length === 0) break
  }

  await sql`
    insert into invitaciones (codigo, max_usos, canal, nota)
    values (${codigo}, 10, 'lista_espera', ${filas[0].contacto})
  `

  await sql`update lista_espera set estado = 'aceptado' where id = ${id}`

  return NextResponse.json({ ok: true, codigo })
}