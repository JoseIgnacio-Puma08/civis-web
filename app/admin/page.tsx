import { redirect } from 'next/navigation'
import { esAdmin } from '@/lib/admin'
import { sql, getConfig } from '@/lib/db'
import AdminPreventa, { type Preventa } from '@/components/admin-preventa'

export const dynamic = 'force-dynamic'

export default async function Admin() {
  if (!(await esAdmin())) redirect('/admin/login')

  const cfg = await getConfig()
  const limite = Number(cfg.preventa_envio_gratis_hasta ?? 5)

  const anivs = (await sql`
    select id, nombre, estado, unidades, precio_cent
    from drops where numero = 'ANIV' limit 1
  `) as any[]
  const aniv = anivs[0]

  let pedidos: Preventa[] = []
  let variantes: any[] = []
  let confirmadas = 0
  let pendientes = 0

  if (aniv) {
    variantes = (await sql`
      select id, talla from variantes where drop_id = ${aniv.id} order by id
    `) as any[]

    const filas = (await sql`
      select p.id, p.nombre, p.contacto, p.estado, p.origen, v.talla
      from pedidos p
      left join variantes v on v.id = p.variante_id
      where p.drop_id = ${aniv.id}
      order by p.id asc
    `) as any[]

    let n = 0
    const conPos = filas.map(f => {
      let posicion: number | null = null
      if (f.estado !== 'cancelado') {
        n += 1
        posicion = n
      }
      return {
        ...f,
        posicion,
        envio_gratis: posicion !== null && posicion <= limite,
      } as Preventa
    })

    pedidos = conPos.reverse()
    confirmadas = filas.filter(f => f.estado === 'pagado').length
    pendientes = filas.filter(f => f.estado === 'pendiente').length
  }

  const votos = (await sql`
    select c.numero, c.nombre, count(v.id)::int as votos
    from candidatos c
    left join votos v on v.candidato_id = c.id
    where c.activo = true
    group by c.id
    order by votos desc, c.orden
  `) as any[]

  const totalVotos = votos.reduce((a, v) => a + v.votos, 0)
  const maxVotos = Math.max(...votos.map(v => v.votos), 0)

  return (
    <main className="min-h-screen px-6 py-16 max-w-2xl mx-auto">
      <p className="tracked text-ash">Panel Civis</p>

      {aniv ? (
        <div className="mt-12">
          <div className="flex items-baseline justify-between">
            <p className="tracked text-ash">{aniv.nombre}</p>
            <p className="tracked text-ash">{aniv.estado}</p>
          </div>

          <div className="mt-8 flex gap-12">
            <div>
              <p className="text-3xl tabular-nums">{pendientes}</p>
              <p className="tracked text-ash mt-1">Por cobrar</p>
            </div>
            <div>
              <p className="text-3xl tabular-nums">{confirmadas}</p>
              <p className="tracked text-ash mt-1">Confirmadas</p>
            </div>
            <div>
              <p className="text-3xl tabular-nums">
                {Math.max(0, aniv.unidades - confirmadas)}
              </p>
              <p className="tracked text-ash mt-1">Quedan</p>
            </div>
          </div>

          <p className="text-ash text-xs mt-6 leading-relaxed">
            Las primeras {limite} preventas llevan envio gratis. El contador publico
            sube cuando confirmas el pago.
          </p>

          <AdminPreventa pedidos={pedidos} variantes={variantes} />
        </div>
      ) : (
        <p className="text-ash text-sm mt-12">
          Todavia no existe el drop ANIV. Corre el script db/preventa.sql.
        </p>
      )}

      <div className="mt-20 border-t border-line pt-10">
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
    </main>
  )
}
