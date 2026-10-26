import { cookies } from 'next/headers'
import { sql, getConfig } from '@/lib/db'
import Aniversario from '@/components/aniversario'
import Proximamente from '@/components/proximamente'
import DropActivo from '@/components/drop-activo'

export const dynamic = 'force-dynamic'

export default async function Drop() {
  const cfg = await getConfig()

  const anivs = (await sql`
    select id, numero, nombre, estado, precio_cent, unidades
    from drops where numero = 'ANIV' limit 1
  `) as any[]

  const aniv = anivs[0]

  // ---------- preventa aniversario ----------
  if (aniv && (aniv.estado === 'activo' || aniv.estado === 'proximamente')) {
    const fotosRows = (await sql`
      select url from fotos where drop_id = ${aniv.id} order by orden
    `) as any[]

    let fotos = fotosRows.map(f => f.url as string)

    if (fotos.length === 0) {
      const ganador = String(cfg.aniversario_ganador ?? '').trim()
      if (ganador) {
        const c = (await sql`
          select foto_url from candidatos where numero = ${ganador} limit 1
        `) as any[]
        if (c[0]?.foto_url) fotos = [c[0].foto_url]
      }
    }

    const variantes = (await sql`
      select id, talla from variantes where drop_id = ${aniv.id} order by id
    `) as any[]

    const conf = (await sql`
      select count(*)::int as n from pedidos
      where drop_id = ${aniv.id} and estado = 'pagado'
    `) as any[]

    const dropVs = (await sql`
      select numero, teaser_url from drops where numero = 'V' limit 1
    `) as any[]

    return (
      <Aniversario
        titulo={cfg.preventa_titulo ?? 'Edicion Aniversario'}
        bajada={
          cfg.preventa_bajada ??
          'Un ano de Civis. El drop que ustedes eligieron, vuelve.'
        }
        fotos={fotos}
        variantes={variantes}
        precioCent={aniv.precio_cent}
        unidades={aniv.unidades}
        confirmadas={conf[0].n}
        envioGratisHasta={Number(cfg.preventa_envio_gratis_hasta ?? 5)}
        activa={aniv.estado === 'activo'}
        abre={cfg.preventa_abre ?? 'Pronto'}
        cfg={cfg as any}
        dropV={dropVs[0]?.numero ?? null}
        teaserV={dropVs[0]?.teaser_url ?? null}
      />
    )
  }

  // ---------- comportamiento anterior ----------
  const drops = (await sql`
    select id, numero, nombre, estado, teaser_url, precio_cent, unidades, specs
    from drops
    where estado in ('proximamente', 'activo')
    order by id desc limit 1
  `) as any[]

  const drop = drops[0]

  if (!drop || drop.estado === 'proximamente') {
    const candidatos = (await sql`
      select c.id, c.numero, c.nombre, c.foto_url, count(v.id)::int as votos
      from candidatos c
      left join votos v on v.candidato_id = c.id
      where c.activo = true
      group by c.id
      order by c.orden
    `) as any[]

    const jar = await cookies()
    const token = jar.get('civis_voto')?.value
    let yaVoto = false
    if (token) {
      const r = (await sql`select id from votos where votante = ${token}`) as any[]
      yaVoto = r.length > 0
    }

    return (
      <Proximamente
        numero={drop?.numero ?? 'V'}
        teaser={drop?.teaser_url ?? null}
        candidatos={candidatos}
        yaVoto={yaVoto}
        votacionActiva={cfg.votacion_activa === '1'}
        votacionTitulo={cfg.votacion_titulo ?? 'Un ano de Civis'}
        votacionBajada={cfg.votacion_bajada ?? 'Relanzamos uno. Vota cual.'}
      />
    )
  }

  const fotos = (await sql`
    select url from fotos where drop_id = ${drop.id} order by orden
  `) as any[]

  const variantes = (await sql`
    select id, talla, stock from variantes where drop_id = ${drop.id} order by id
  `) as any[]

  const ciudades = (cfg.ciudades_sin_envio ?? '').split(',').join(' y ')
  const envio = Number(cfg.envio_nacional_cent ?? 700) / 100

  return (
    <DropActivo
      numero={drop.numero}
      nombre={drop.nombre}
      precioCent={drop.precio_cent}
      unidades={drop.unidades}
      fotos={fotos}
      variantes={variantes}
      specs={(drop.specs ?? '').split('|').filter(Boolean)}
      envioTexto={`Envio gratis en ${ciudades}. $${envio.toFixed(0)} al resto del pais. Pago por transferencia, coordinamos por WhatsApp.`}
    />
  )
}
