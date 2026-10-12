import { cookies } from 'next/headers'
import { sql, getConfig } from '@/lib/db'
import Proximamente from '@/components/proximamente'
import DropActivo from '@/components/drop-activo'

export const dynamic = 'force-dynamic'

export default async function Drop() {
  const drops = (await sql`
    select id, numero, nombre, estado, teaser_url, precio_cent, unidades, specs
    from drops
    where estado in ('proximamente', 'activo')
    order by id desc limit 1
  `) as any[]

  const drop = drops[0]
  const cfg = await getConfig()

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
        votacionTitulo={cfg.votacion_titulo ?? 'Un año de Civis'}
        votacionBajada={cfg.votacion_bajada ?? 'Relanzamos uno. Vota cuál.'}
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
      envioTexto={`Envío gratis en ${ciudades}. $${envio.toFixed(0)} al resto del país. Pago por transferencia — coordinamos por WhatsApp.`}
    />
  )
}