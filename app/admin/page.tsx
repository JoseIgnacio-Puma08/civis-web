import { redirect } from 'next/navigation'
import { esAdmin } from '@/lib/admin'
import { sql } from '@/lib/db'
import AdminPedidos from '@/components/admin-pedidos'

export const dynamic = 'force-dynamic'

export default async function Admin() {
  if (!(await esAdmin())) redirect('/admin/login')

  const votos = (await sql`
    select c.numero, c.nombre, count(v.id)::int as votos
    from candidatos c
    left join votos v on v.candidato_id = c.id
    where c.activo = true
    group by c.id
    order by votos desc, c.orden
  `) as any[]

  const drops = (await sql`
    select id, numero, nombre, estado, unidades
    from drops
    where estado in ('activo', 'proximamente')
    order by id desc limit 1
  `) as any[]

  const drop = drops[0]

  let variantes: any[] = []
  let pedidos: any[] = []

  if (drop) {
    variantes = (await sql`
      select id, talla, stock from variantes where drop_id = ${drop.id} order by id
    `) as any[]

    pedidos = (await sql`
      select p.id, p.nombre, p.contacto, p.ciudad, p.total_cent, p.estado, p.origen, p.creado_en, v.talla
      from pedidos p
      left join variantes v on v.id = p.variante_id
      where p.drop_id = ${drop.id}
      order by p.id desc
    `) as any[]
  }

  const totalVotos = votos.reduce((a, v) => a + v.votos, 0)
  const maxVotos = Math.max(...votos.map(v => v.votos), 0)
  const porCobrar = pedidos.filter(p => p.estado === 'pendiente').length
  const pagados = pedidos.filter(p => p.estado === 'pagado').length

  return (
    <main className="min-h-screen px-6 py-16 max-w-2xl mx-auto">
      <p className="tracked text-ash">Panel Civis</p>

      <div className="mt-12">
        <div className="flex items-baseline justify-between">
          <p className="tracked text-ash">Votacion aniversario</p>
          <p className="text-2xl tabular-nums">{totalVotos}</p>
        </div>

        <div className="mt-8 space-y-6">
          {votos.map(v => {
            const pct = totalVotos > 0 ? Math.round((v.votos / totalVotos) * 100) : 0
            const lider = v.votos > 0 && v.votos === maxVotos
            return (
              <div key={v.numero}>
                <div className="flex items-baseline justify-between gap-4">
                  <p className={`text-sm ${lider ? 'text-bone' : 'text-ash'}`}>
                    {v.nombre ?? `Drop ${v.numero}`}
                  </p>
                  <p className="text-sm tabular-nums shrink-0">
                    {v.votos} <span className="text-ash">· {pct}%</span>
                  </p>
                </div>
                <div className="mt-2 h-px bg-line">
                  <div
                    style={{ width: `${pct}%` }}
                    className={`h-px ${lider ? 'bg-bone' : 'bg-ash/50'}`}
                  />
                </div>
              </div>
            )
          })}
          {votos.length === 0 && (
            <p className="text-ash text-sm">Sin candidatos cargados.</p>
          )}
        </div>
      </div>

      <div className="mt-20 border-t border-line pt-10">
        {drop ? (
          <>
            <div className="flex items-baseline justify-between">
              <p className="tracked text-ash">
                {drop.nombre ?? `Drop ${drop.numero}`}
              </p>
              <p className="tracked text-ash">{drop.estado}</p>
            </div>

            <div className="mt-8 flex gap-12">
              <div>
                <p className="text-3xl tabular-nums">{porCobrar}</p>
                <p className="tracked text-ash mt-1">Por cobrar</p>
              </div>
              <div>
                <p className="text-3xl tabular-nums">{pagados}</p>
                <p className="tracked text-ash mt-1">Pagados</p>
              </div>
              <div>
                <p className="text-3xl tabular-nums">{drop.unidades}</p>
                <p className="tracked text-ash mt-1">Unidades</p>
              </div>
            </div>

            {variantes.length === 0 ? (
              <p className="text-ash text-sm mt-12 leading-relaxed">
                Este drop todavia no tiene tallas cargadas. Cuando las cargues
                aparecen aqui el stock y el boton de venta manual.
              </p>
            ) : (
              <AdminPedidos
                pedidos={pedidos.map(p => ({ ...p, creado_en: String(p.creado_en) }))}
                variantes={variantes}
              />
            )}
          </>
        ) : (
          <p className="text-ash text-sm">No hay drop activo ni proximo.</p>
        )}
      </div>
    </main>
  )
}