import { redirect } from 'next/navigation'
import { esAdmin } from '@/lib/admin'
import { sql } from '@/lib/db'
import BotonAceptar from '@/components/boton-aceptar'
import AdminPedidos from '@/components/admin-pedidos'

export const dynamic = 'force-dynamic'

export default async function Admin() {
  if (!(await esAdmin())) redirect('/admin/login')

  const espera = (await sql`
    select id, contacto, estado, creado_en
    from lista_espera order by id desc limit 100
  `) as any[]

  const pedidos = (await sql`
    select p.id, p.nombre, p.contacto, p.ciudad, p.total_cent, p.estado, p.origen, p.creado_en, v.talla
    from pedidos p left join variantes v on v.id = p.variante_id
    order by p.id desc limit 100
  `) as any[]

  const variantes = (await sql`
    select v.id, v.talla, v.stock from variantes v
    join drops d on d.id = v.drop_id
    where d.estado in ('activo','proximamente')
    order by v.id
  `) as any[]

  const pendientes = espera.filter(e => e.estado === 'pendiente').length
  const porCobrar = pedidos.filter(p => p.estado === 'pendiente').length

  return (
    <main className="min-h-screen px-6 py-16 max-w-2xl mx-auto">
      <p className="tracked text-ash">Panel Civis</p>

      <div className="mt-10 flex gap-12">
        <div>
          <p className="text-3xl">{porCobrar}</p>
          <p className="tracked text-ash mt-1">Por cobrar</p>
        </div>
        <div>
          <p className="text-3xl">{pendientes}</p>
          <p className="tracked text-ash mt-1">En espera</p>
        </div>
      </div>

      <AdminPedidos
        pedidos={pedidos.map(p => ({ ...p, creado_en: String(p.creado_en) }))}
        variantes={variantes}
      />

      <p className="tracked text-ash mt-20">Lista de espera</p>
      <div className="mt-6 border-t border-line">
        {espera.map(p => (
          <div key={p.id} className="flex items-center justify-between py-4 border-b border-line">
            <div>
              <p className="text-sm">{p.contacto}</p>
              <p className="text-ash text-xs mt-1">{new Date(p.creado_en).toLocaleDateString('es-EC')}</p>
            </div>
            {p.estado === 'pendiente'
              ? <BotonAceptar id={p.id} />
              : <span className="tracked text-ash">{p.estado}</span>}
          </div>
        ))}
        {espera.length === 0 && <p className="text-ash text-sm py-8">Nadie se ha registrado todavía.</p>}
      </div>
    </main>
  )
}