import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sql, getConfig } from '@/lib/db'
import { verificarAcceso, COOKIE } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const jar = await cookies()
    const mid = await verificarAcceso(jar.get(COOKIE)?.value)

    const body = await req.json()
    const varianteId = Number(body.varianteId)
    const nombre = String(body.nombre ?? '').trim()
    const contacto = String(body.contacto ?? '').trim()
    const ciudad = String(body.ciudad ?? '').trim()
    const direccion = String(body.direccion ?? '').trim()

    if (!varianteId || !nombre || !contacto || !ciudad) {
      return NextResponse.json({ error: 'faltan datos' }, { status: 400 })
    }

    const cfg = await getConfig()
    const gratis = String(cfg.ciudades_sin_envio ?? '')
      .split(',')
      .map(c => c.trim().toLowerCase())
      .filter(Boolean)

    const envioCent = gratis.includes(ciudad.toLowerCase())
      ? 0
      : Number(cfg.envio_nacional_cent ?? 700)

    const bajadas = (await sql`
      update variantes set stock = stock - 1
      where id = ${varianteId} and stock > 0
      returning drop_id, talla
    `) as any[]

    if (bajadas.length === 0) {
      return NextResponse.json({ error: 'agotado' }, { status: 409 })
    }

    const dropId = bajadas[0].drop_id

    const precios = (await sql`
      select precio_cent from drops where id = ${dropId}
    `) as any[]

    const total = Number(precios[0].precio_cent) + envioCent

    let miembroId: number | null = null
    if (mid) {
      const existe = (await sql`select id from miembros where id = ${mid}`) as any[]
      if (existe.length > 0) miembroId = mid
    }

    const pedidos = (await sql`
      insert into pedidos (drop_id, variante_id, miembro_id, nombre, contacto, ciudad, direccion, envio_cent, total_cent, estado, origen)
      values (${dropId}, ${varianteId}, ${miembroId}, ${nombre}, ${contacto}, ${ciudad}, ${direccion || null}, ${envioCent}, ${total}, 'pendiente', 'web')
      returning id
    `) as any[]

    return NextResponse.json({
      ok: true,
      pedidoId: pedidos[0].id,
      talla: bajadas[0].talla,
      envioCent,
      totalCent: total,
    })
  } catch (e: any) {
    console.error('ERROR /api/pedido:', e?.message, e)
    return NextResponse.json({ error: 'servidor', detalle: e?.message }, { status: 500 })
  }
}