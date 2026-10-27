import { NextResponse } from 'next/server'
import { sql, getConfig } from '@/lib/db'

function normal(s: string) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase()
}

export async function POST(req: Request) {
  try {
    const cfg = await getConfig()
    const body = await req.json()

    const varianteId = Number(body.varianteId)
    const nombre = String(body.nombre ?? '').trim()
    const telefono = String(body.telefono ?? '').replace(/\D/g, '')
    const ciudad = String(body.ciudad ?? '').trim()

    if (!varianteId || nombre.length < 3 || telefono.length < 9 || ciudad.length < 3) {
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

    const gratis = String(cfg.preventa_ciudades_gratis ?? 'Quito,Riobamba')
      .split(',')
      .map(c => normal(c))
      .filter(Boolean)

    const envioCent = gratis.includes(normal(ciudad))
      ? 0
      : Number(cfg.preventa_envio_cent ?? 600)

    const total = Number(va.precio_cent) + envioCent

    const previas = (await sql`
      select count(*)::int as n from pedidos
      where drop_id = ${va.drop_id} and estado <> 'cancelado'
    `) as any[]

    const posicion = previas[0].n + 1
    const nota =
      'Preventa #' + posicion + (envioCent === 0 ? ' · envio gratis' : ' · envio $' + (envioCent / 100).toFixed(2))

    const ins = (await sql`
      insert into pedidos
        (drop_id, variante_id, nombre, contacto, ciudad, envio_cent, total_cent, estado, origen, nota)
      values
        (${va.drop_id}, ${varianteId}, ${nombre}, ${telefono}, ${ciudad}, ${envioCent}, ${total}, 'pendiente', 'preventa', ${nota})
      returning id
    `) as any[]

    return NextResponse.json({
      ok: true,
      pedidoId: ins[0].id,
      talla: va.talla,
      posicion,
      ciudad,
      envioCent,
      precioCent: va.precio_cent,
      totalCent: total,
    })
  } catch (e: any) {
    console.error('ERROR /api/preventa:', e?.message)
    return NextResponse.json({ error: 'servidor' }, { status: 500 })
  }
}
