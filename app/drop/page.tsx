import { sql, getConfig } from '@/lib/db'
import Proximamente from '@/components/proximamente'
import DropActivo from '@/components/drop-activo'

export const dynamic = 'force-dynamic'

export default async function Drop() {
  const cfg = await getConfig()

  const drops = (await sql`
    select id, numero, nombre, estado, teaser_url, precio_cent, unidades, specs
    from drops
    where estado in ('proximamente', 'activo')
      and numero <> 'ANIV'
    order by id desc limit 1
  `) as any[]

  const drop = drops[0]
  const soldOut = (cfg.sold_out_aviso ?? '').trim() || null

  if (!drop || drop.estado === 'proximamente') {
    return (
      <Proximamente
        numero={drop?.numero ?? 'V'}
        teaser={drop?.teaser_url ?? null}
        soldOut={soldOut}
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
  const envio = Number(cfg.envio_nacional_cent ?? 600) / 100

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
