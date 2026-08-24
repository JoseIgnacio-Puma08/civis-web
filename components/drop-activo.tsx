'use client'

import { motion } from 'motion/react'
import { useEffect, useState } from 'react'

const EASE = [0.16, 1, 0.3, 1] as const

type Variante = { id: number; talla: string; stock: number }

function Contador({ vendidas, total }: { vendidas: number; total: number }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    let i = 0
    const paso = Math.max(1, Math.ceil(vendidas / 25))
    const t = setInterval(() => {
      i += paso
      if (i >= vendidas) { setN(vendidas); clearInterval(t) } else setN(i)
    }, 40)
    return () => clearInterval(t)
  }, [vendidas])
  return (
    <span className="tabular-nums">{String(n).padStart(2, '0')}<span className="text-ash"> / {total}</span></span>
  )
}

export default function DropActivo({
  numero, nombre, precioCent, unidades, fotos, variantes, specs, envioTexto,
}: {
  numero: string
  nombre: string | null
  precioCent: number
  unidades: number
  fotos: { url: string }[]
  variantes: Variante[]
  specs: string[]
  envioTexto: string
}) {
  const [talla, setTalla] = useState<Variante | null>(null)
  const disponibles = variantes.reduce((a, v) => a + v.stock, 0)
  const vendidas = unidades - disponibles
  const agotado = disponibles === 0

  return (
    <main className="min-h-screen">
      {fotos.map((f, i) => (
        <motion.div key={i} initial={{ opacity: 0, scale: 1.15 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 1.5, ease: EASE }} className="w-full overflow-hidden">
          <img src={f.url} alt="" className="w-full h-auto block" />
        </motion.div>
      ))}

      <div className="px-6 py-20 max-w-md mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: EASE }}>
          <h1 className="text-4xl tracking-tight">{nombre ?? `Drop ${numero}`}</h1>
          <p className="mt-3 text-2xl">${(precioCent / 100).toFixed(0)}</p>
          <p className="mt-10 text-5xl tracking-tight"><Contador vendidas={vendidas} total={unidades} /></p>
          <p className="tracked text-ash mt-2">{agotado ? 'Agotado' : 'Vendidas'}</p>
        </motion.div>

        {!agotado && (
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.1, delay: 0.15, ease: EASE }} className="mt-14">
            <p className="tracked text-ash mb-4">Talla</p>
            <div className="flex gap-3">
              {variantes.map(v => {
                const sin = v.stock === 0
                const sel = talla?.id === v.id
                const cls = sel ? 'border-bone bg-bone text-noir' : sin ? 'border-line text-line line-through' : 'border-line hover:border-bone'
                return (
                  <button key={v.id} disabled={sin} onClick={() => setTalla(v)} className={`flex-1 py-4 border text-sm transition-colors duration-300 ${cls}`}>{v.talla}</button>
                )
              })}
            </div>
            {talla && talla.stock <= 3 && (
              <p className="text-ash text-xs mt-3">Quedan {talla.stock} en {talla.talla}.</p>
            )}
            <p className="text-ash text-xs mt-6 leading-relaxed">El corte es boxy. Si dudas entre dos tallas, la menor te queda bien. Este drop va de S a L.</p>
            <a href={talla ? `/checkout?v=${talla.id}` : undefined} className={`block text-center mt-10 py-5 tracked transition-colors duration-300 ${talla ? 'bg-bone text-noir' : 'border border-line text-line pointer-events-none'}`}>{talla ? 'Comprar' : 'Elige una talla'}</a>
          </motion.div>
        )}

        <motion.ul initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.1, delay: 0.3, ease: EASE }} className="mt-20 space-y-2">
          {specs.map((s, i) => (<li key={i} className="text-ash text-sm">+ {s}</li>))}
        </motion.ul>

        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.1, delay: 0.45 }} className="mt-10 text-ash text-xs leading-relaxed">{envioTexto}</motion.p>
      </div>
    </main>
  )
}