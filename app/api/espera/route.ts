import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { contacto } = await req.json()
    const limpio = String(contacto ?? '').trim().slice(0, 120)

    if (limpio.length < 3) {
      return NextResponse.json({ error: 'Contacto muy corto' }, { status: 400 })
    }

    const existe = (await sql`
      select id from lista_espera where lower(contacto) = lower(${limpio}) limit 1
    `) as any[]

    if (existe.length === 0) {
      await sql`insert into lista_espera (contacto) values (${limpio})`
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}