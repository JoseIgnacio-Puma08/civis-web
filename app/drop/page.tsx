import { sql, getConfig } from '@/lib/db'
import Proximamente from '@/components/proximamente'

export const dynamic = 'force-dynamic'

export default async function Drop() {
  const drops = (await sql`
    select numero, nombre, estado, teaser_url
    from drops
    where estado in ('proximamente', 'activo')
    order by id desc limit 1
  `) as any[]

  const drop = drops[0]
  const cfg = await getConfig()

  if (!drop || drop.estado === 'proximamente') {
    return (
      <Proximamente
        numero={drop?.numero ?? 'V'}
        teaser={drop?.teaser_url ?? null}
        texto={cfg.proximamente}
      />
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="tracked">Drop activo — pendiente</p>
    </main>
  )
}