import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'
import { sql, getConfig } from '@/lib/db'

const VOTO_COOKIE = 'civis_voto'

async function resultados() {
  return (await sql`
    select c.id, c.numero, c.nombre, c.foto_url,
           count(v.id)::int as votos
    from candidatos c
    left join votos v on v.candidato_id = c.id
    where c.activo = true
    group by c.id
    order by c.orden
  `) as any[]
}

export async function POST(req: Request) {
  try {
    const cfg = await getConfig()
    if (cfg.votacion_activa !== '1') {
      return NextResponse.json({ error: 'cerrada' }, { status: 403 })
    }

    const body = await req.json()
    const candidatoId = Number(body.candidatoId)
    if (!candidatoId) {
      return NextResponse.json({ error: 'falta candidato' }, { status: 400 })
    }

    const jar = await cookies()
    const existente = jar.get(VOTO_COOKIE)?.value
    const votante = existente || randomUUID()

    const ya = (await sql`select id from votos where votante = ${votante}`) as any[]
    if (ya.length > 0) {
      return NextResponse.json({ error: 'ya votaste', resultados: await resultados() }, { status: 409 })
    }

    await sql`insert into votos (candidato_id, votante) values (${candidatoId}, ${votante})`

    const res = NextResponse.json({ ok: true, resultados: await resultados() })
    res.cookies.set(VOTO_COOKIE, votante, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 120,
      path: '/',
    })
    return res
  } catch (e: any) {
    console.error('ERROR /api/voto:', e?.message)
    return NextResponse.json({ error: 'servidor' }, { status: 500 })
  }
}