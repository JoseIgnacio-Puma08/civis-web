import { redirect } from 'next/navigation'
import { esAdmin } from '@/lib/admin'
import { sql } from '@/lib/db'
import AdminDrop, { type Pedido, type Variante } from '@/components/admin-drop'

export const dynamic = 'force-dynamic'

export default async function Admin() {
  if (!(await esAdmin())) redirect('/admin/login')

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

  // Numero dentro del drop: el pedido mas antiguo es el #1
  const porId = [...pedidos].sort((a, b) => a.id - b.id)
  const orden = new Map(porId.map((p, i) => [p.id, i + 1]))
  pedidos = pedidos.map(p => ({ ...p, numero: orden.get(p.id) ?? p.id }))

  const pendientes = pedidos.filter(p => p.estado === 'pendiente').length
  const pagados = pedidos.filter(p => p.estado === 'pagado').length
  const stock = variantes.reduce((a, v) => a + v.stock, 0)

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
    </main>
  )
}
