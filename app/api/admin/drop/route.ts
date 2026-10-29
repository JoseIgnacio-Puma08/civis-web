import { NextResponse } from 'next/server'
import { esAdmin } from '@/lib/admin'
import { sql } from '@/lib/db'

const ESTADOS = ['borrador', 'proximamente', 'activo', 'cerrado']

export async function POST(req: Request) {
  try {
    if (!(await esAdmin())) {
      return NextResponse.json({ error: 'no autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const accion = String(body.accion ?? '')
    const dropId = Number(body.dropId)

    if (!dropId) {
      return NextResponse.json({ error: 'falta drop' }, { status: 400 })
    }

    if (accion === 'tallas') {
      const lista = Array.isArray(body.tallas) ? body.tallas : []
      const limpias = lista
        .map((t: any) => ({
          talla: String(t.talla ?? '').trim().toUpperCase(),
          stock: Math.max(0, Math.floor(Number(t.stock) || 0)),
        }))
        .filter((t: any) => t.talla.length > 0)

      if (limpias.length === 0) {
        return NextResponse.json({ error: 'sin tallas' }, { status: 400 })
      }

      for (const t of limpias) {
        const ya = (await sql`
          select id from variantes where drop_id = ${dropId} and talla = ${t.talla}
        `) as any[]
        if (ya.length > 0) {
          await sql`update variantes set stock = ${t.stock} where id = ${ya[0].id}`
        } else {
          await sql`
            insert into variantes (drop_id, talla, stock)
            values (${dropId}, ${t.talla}, ${t.stock})
          `
        }
      }

      const total = limpias.reduce((a: number, t: any) => a + t.stock, 0)
      await sql`update drops set unidades = ${total} where id = ${dropId}`

      return NextResponse.json({ ok: true, unidades: total })
    }

    if (accion === 'estado') {
      const estado = String(body.estado ?? '')
      if (!ESTADOS.includes(estado)) {
        return NextResponse.json({ error: 'estado invalido' }, { status: 400 })
      }
      await sql`update drops set estado = ${estado} where id = ${dropId}`
      return NextResponse.json({ ok: true })
    }

    if (accion === 'precio') {
      const cent = Math.max(0, Math.floor(Number(body.precioCent) || 0))
      await sql`update drops set precio_cent = ${cent} where id = ${dropId}`
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'accion invalida' }, { status: 400 })
  } catch (e: any) {
    console.error('ERROR /api/admin/drop:', e?.message)
    return NextResponse.json({ error: 'servidor' }, { status: 500 })
  }
}
