import { NextResponse } from 'next/server'
import { sql, getConfig } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const cfg = await getConfig()
    const body = await req.json()

    const varianteId = Number(body.varianteId)
    const nombre = String(body.nombre ?? '').trim()
    const telefono = String(body.telefono ?? '').replace(/\D/g, '')

    if (!varianteId || nombre.length < 3 || telefono.length < 9) {
      return NextResponse.json({ error: 'faltan datos' }, { status: 400 })
    }

    const filas = (await sql`
      select v.id, v.talla, v.drop_id, d.estado, d.precio_cent
      from variantes v
      join drops d on d.id = v.drop_id
      where v.id = ${varianteId}
    `) as any[]

    const va = filas[0]
    if (!va || va.estado !== 'activo') {
      return NextResponse.json({ error: 'cerrada' }, { status: 409 })
    }

    const previas = (await sql`
      select count(*)::int as n from pedidos
      where drop_id = ${va.drop_id} and estado <> 'cancelado'
    `) as any[]

    const posicion = previas[0].n + 1
    const limite = Number(cfg.preventa_envio_gratis_hasta ?? 5)
    const envioGratis = posicion <= limite
    const nota = 'Preventa #' + posicion + (envioGratis ? ' · envio gratis' : '')

    const ins = (await sql`
      insert into pedidos
        (drop_id, variante_id, nombre, contacto, ciudad, envio_cent, total_cent, estado, origen, nota)
      values
        (${va.drop_id}, ${varianteId}, ${nombre}, ${telefono}, null, 0, ${va.precio_cent}, 'pendiente', 'preventa', ${nota})
      returning id
    `) as any[]

    return NextResponse.json({
      ok: true,
      pedidoId: ins[0].id,
      talla: va.talla,
      posicion,
      envioGratis,
      totalCent: va.precio_cent,
    })
  } catch (e: any) {
    console.error('ERROR /api/preventa:', e?.message)
    return NextResponse.json({ error: 'servidor' }, { status: 500 })
  }
}
