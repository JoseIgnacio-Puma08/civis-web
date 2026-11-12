import { redirect } from 'next/navigation'
import { esAdmin } from '@/lib/admin'
import { sql } from '@/lib/db'
import AdminDrop, { type Pedido, type Variante } from '@/components/admin-drop'

export const dynamic = 'force-dynamic'

type Historico = {
  id: number
  nombre: string
  contacto: string
  ciudad: string | null
  talla: string | null
  estado: string
  origen: string
  envio_cent: number
  total_cent: number
  creado_en: string
}

export default async function Admin() {
  if (!(await esAdmin())) redirect('/admin/login')

  // ---------- Drop V ----------
  const drops = (await sql`
    select id, numero, nombre, estado, precio_cent, unidades
    from drops where numero = 'V' limit 1
  `) as any[]

  const drop = drops[0]

  let variantes: Variante[] = []
  let pedidos: Pedido[] = []

  if (drop) {
    variantes = (await sql`
      select id, talla, stock from variantes where drop_id = ${drop.id} order by id
    `) as any[]

    pedidos = (await sql`
      select p.id, p.nombre, p.contacto, p.ciudad, p.estado, p.origen,
             p.total_cent, v.talla
      from pedidos p
      left join variantes v on v.id = p.variante_id
      where p.drop_id = ${drop.id}
      order by p.id desc
    `) as any[]
  }

  const pendientes = pedidos.filter(p => p.estado === 'pendiente').length
  const pagados = pedidos.filter(p => p.estado === 'pagado').length
  const stock = variantes.reduce((a, v) => a + v.stock, 0)

  // ---------- Edicion Aniversario (historico) ----------
  const aniv = (await sql`
    select p.id, p.nombre, p.contacto, p.ciudad, p.estado, p.origen,
           p.envio_cent, p.total_cent, p.creado_en, v.talla
    from pedidos p
    left join variantes v on v.id = p.variante_id
    join drops d on d.id = p.drop_id
    where d.numero = 'ANIV'
    order by p.id asc
  `) as unknown as Historico[]

  const anivPagados = aniv.filter(p => p.estado === 'pagado')
  const anivPendientes = aniv.filter(p => p.estado === 'pendiente')
  const anivCancelados = aniv.filter(p => p.estado === 'cancelado')

  const porTalla: Record<string, number> = {}
  anivPagados.forEach(p => {
    const t = p.talla ?? '?'
    porTalla[t] = (porTalla[t] ?? 0) + 1
  })

  const recaudado = anivPagados.reduce((a, p) => a + p.total_cent, 0)

  function wa(tel: string) {
    const n = String(tel ?? '').replace(/\D/g, '').replace(/^0+/, '')
    return 'https://wa.me/593' + n
  }

  return (
    <main className="min-h-screen px-6 py-16 max-w-2xl mx-auto">
      <p className="tracked text-ash">Panel Civis</p>

      {drop ? (
        <>
          <div className="mt-10 flex items-baseline justify-between">
            <h1 className="text-3xl tracking-tight">
              {drop.nombre ?? `Drop ${drop.numero}`}
            </h1>
            <p className="tracked text-ash">{drop.estado}</p>
          </div>

          <div className="mt-8 flex gap-12">
            <div>
              <p className="text-3xl tabular-nums">{pendientes}</p>
              <p className="tracked text-ash mt-1">Por cobrar</p>
            </div>
            <div>
              <p className="text-3xl tabular-nums">{pagados}</p>
              <p className="tracked text-ash mt-1">Pagados</p>
            </div>
            <div>
              <p className="text-3xl tabular-nums">{stock}</p>
              <p className="tracked text-ash mt-1">En stock</p>
            </div>
          </div>

          <AdminDrop
            dropId={drop.id}
            estado={drop.estado}
            precioCent={drop.precio_cent}
            variantes={variantes}
            pedidos={pedidos}
          />
        </>
      ) : (
        <p className="text-ash text-sm mt-12">No existe el Drop V en la base.</p>
      )}

      {/* ---------- Edicion Aniversario ---------- */}
      <section className="mt-24 border-t border-line pt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl tracking-tight">Edicion Aniversario</h2>
          <p className="tracked text-ash">Cerrado</p>
        </div>

        {aniv.length === 0 ? (
          <p className="text-ash text-sm mt-8">Sin pedidos registrados.</p>
        ) : (
          <>
            <div className="mt-8 flex gap-12">
              <div>
                <p className="text-3xl tabular-nums">{anivPagados.length}</p>
                <p className="tracked text-ash mt-1">Pagados</p>
              </div>
              <div>
                <p className="text-3xl tabular-nums">{anivPendientes.length}</p>
                <p className="tracked text-ash mt-1">Pendientes</p>
              </div>
              <div>
                <p className="text-3xl tabular-nums">
                  ${(recaudado / 100).toFixed(0)}
                </p>
                <p className="tracked text-ash mt-1">Recaudado</p>
              </div>
            </div>

            <div className="mt-8 flex gap-8 text-sm">
              {Object.keys(porTalla)
                .sort()
                .map(t => (
                  <span key={t}>
                    {t} <span className="text-ash tabular-nums">{porTalla[t]}</span>
                  </span>
                ))}
              {anivCancelados.length > 0 && (
                <span className="text-ash">
                  {anivCancelados.length} cancelados
                </span>
              )}
            </div>
            <p className="text-ash text-xs mt-3">Tallas de los pagados</p>

            <div className="mt-10 border-t border-line">
              {aniv.map((p, i) => (
                <div key={p.id} className="py-5 border-b border-line">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm">
                        #{i + 1} · {p.nombre}
                        {p.origen === 'manual' && (
                          <span className="text-ash"> · directa</span>
                        )}
                      </p>
                      <p className="text-ash text-xs mt-1">
                        Talla <span className="text-bone">{p.talla ?? '—'}</span> ·{' '}
                        {p.ciudad ?? 'sin ciudad'} · $
                        {(p.total_cent / 100).toFixed(2)}
                        {p.envio_cent === 0
                          ? ' · envio gratis'
                          : ' · envio $' + (p.envio_cent / 100).toFixed(2)}
                      </p>
                      <a
                        href={wa(p.contacto)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-ash text-xs mt-1 block hover:text-bone transition-colors"
                      >
                        {p.contacto}
                      </a>
                    </div>
                    <span className="tracked text-ash shrink-0">{p.estado}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  )
}
