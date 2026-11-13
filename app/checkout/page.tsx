import { redirect } from 'next/navigation'
import { sql, getConfig } from '@/lib/db'
import CheckoutForm from '@/components/checkout-form'

export const dynamic = 'force-dynamic'

export default async function Checkout({
  searchParams,
}: {
  searchParams: Promise<{ v?: string }>
}) {
  const { v } = await searchParams
  const varianteId = Number(v)
  if (!varianteId) redirect('/drop')

  const filas = (await sql`
    select v.id, v.talla, v.stock, d.precio_cent, d.estado
    from variantes v join drops d on d.id = v.drop_id
    where v.id = ${varianteId}
  `) as any[]

  const va = filas[0]
  if (!va || va.estado !== 'activo' || va.stock <= 0) redirect('/drop')

  const cfg = await getConfig()

  return (
    <main className="min-h-screen">
      <CheckoutForm
        varianteId={va.id}
        talla={va.talla}
        precioCent={va.precio_cent}
        ciudadesGratis={(cfg.ciudades_sin_envio ?? '').split(',').map(c => c.trim()).filter(Boolean)}
        envioNacionalCent={Number(cfg.envio_nacional_cent ?? 700)}
        cfg={cfg as any}
      />
    </main>
  )
}