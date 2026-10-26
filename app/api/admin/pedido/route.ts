import { NextResponse } from 'next/server'
import { esAdmin } from '@/lib/admin'
import { sql } from '@/lib/db'

export async function POST(req: Request) {
  try {
    if (!(await esAdmin())) {
      return NextResponse.json({ error: 'no autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const accion = String(body.accion ?? '')

    if (accion === 'confirmar') {
      const filas = (await sql`
        update pedidos set estado = 'pagado', pagado_en = now()
        where id = ${Number(body.id)} and estado = 'pendiente'
        returning id
      `) as any[]
      if (filas.length === 0) {
        return NextResponse.json({ error: 'no aplica' }, { status: 409 })
      }
      return NextResponse.json({ ok: true })
    }

    if (accion === 'cancelar') {
      const filas = (await sql`
        update pedidos set estado = 'cancelado'
        where id = ${Number(body.id)} and estado in ('pendiente', 'pagado')
        returning variante_id, origen
      `) as any[]
      if (filas.length === 0) {
        return NextResponse.json({ error: 'no aplica' }, { status: 409 })
      }
      // en la preventa no se descuenta stock, asi que tampoco se devuelve
      if (filas[0].origen !== 'preventa' && filas[0].variante_id) {
        await sql`update variantes set stock = stock + 1 where id = ${filas[0].variante_id}`
      }
      return NextResponse.json({ ok: true })
    }

    if (accion === 'manual') {
      const varianteId = Number(body.varianteId)
      const nombre = String(body.nombre ?? '').trim() || 'Venta directa'

      const bajadas = (await sql`
        update variantes set stock = stock - 1
        where id = ${varianteId} and stock > 0
        returning drop_id
      `) as any[]
      if (bajadas.length === 0) {
        return NextResponse.json({ error: 'agotado' }, { status: 409 })
      }

      const precios = (await sql`
        select precio_cent from drops where id = ${bajadas[0].drop_id}
      `) as any[]

      await sql`
        insert into pedidos (drop_id, variante_id, nombre, contacto, ciudad, envio_cent, total_cent, estado, origen, pagado_en)
        values (${bajadas[0].drop_id}, ${varianteId}, ${nombre}, ${String(body.contacto ?? '').trim()}, ${String(body.ciudad ?? '').trim()}, 0, ${precios[0].precio_cent}, 'pagado', 'manual', now())
      `
      return NextResponse.json({ ok: true })
    }

    if (accion === 'manual_preventa') {
      const varianteId = Number(body.varianteId)
      const nombre = String(body.nombre ?? '').trim() || 'Venta directa'
      const contacto = String(body.contacto ?? '').replace(/\D/g, '')

      const filas = (await sql`
        select v.drop_id, d.precio_cent from variantes v
        join drops d on d.id = v.drop_id
        where v.id = ${varianteId}
      `) as any[]
      if (filas.length === 0) {
        return NextResponse.json({ error: 'no existe' }, { status: 404 })
      }

      const previas = (await sql`
        select count(*)::int as n from pedidos
        where drop_id = ${filas[0].drop_id} and estado <> 'cancelado'
      `) as any[]
      const posicion = previas[0].n + 1

      await sql`
        insert into pedidos (drop_id, variante_id, nombre, contacto, ciudad, envio_cent, total_cent, estado, origen, nota, pagado_en)
        values (${filas[0].drop_id}, ${varianteId}, ${nombre}, ${contacto}, null, 0, ${filas[0].precio_cent}, 'pagado', 'manual', ${'Preventa #' + posicion}, now())
      `
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'accion invalida' }, { status: 400 })
  } catch (e: any) {
    console.error('ERROR /api/admin/pedido:', e?.message)
    return NextResponse.json({ error: 'servidor' }, { status: 500 })
  }
}
