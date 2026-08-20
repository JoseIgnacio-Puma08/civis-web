import { redirect } from 'next/navigation'
import { esAdmin } from '@/lib/admin'
import { sql } from '@/lib/db'
import BotonAceptar from '@/components/boton-aceptar'

export const dynamic = 'force-dynamic'

export default async function Admin() {
  if (!(await esAdmin())) redirect('/admin/login')

  const espera = (await sql`
    select id, contacto, estado, creado_en
    from lista_espera order by id desc limit 100
  `) as any[]

  const pendientes = espera.filter(e => e.estado === 'pendiente').length

  return (
    <main className="min-h-screen px-6 py-16 max-w-2xl mx-auto">
      <p className="tracked text-ash">Panel Civis</p>

      <h1 className="mt-10 text-3xl">
        {pendientes} <span className="text-ash text-lg">pendientes</span>
      </h1>
      <p className="text-ash text-sm mt-1">{espera.length} en total</p>

      <div className="mt-12 border-t border-line">
        {espera.map(p => (
          <div key={p.id} className="flex items-center justify-between py-4 border-b border-line">
            <div>
              <p className="text-sm">{p.contacto}</p>
              <p className="text-ash text-xs mt-1">
                {new Date(p.creado_en).toLocaleDateString('es-EC')}
              </p>
            </div>
            {p.estado === 'pendiente'
              ? <BotonAceptar id={p.id} />
              : <span className="tracked text-ash">{p.estado}</span>}          </div>
        ))}
        {espera.length === 0 && (
          <p className="text-ash text-sm py-8">Nadie se ha registrado todavía.</p>
        )}
      </div>
    </main>
  )
}