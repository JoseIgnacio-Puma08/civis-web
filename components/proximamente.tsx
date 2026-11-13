'use client'

import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

const EASE = [0.16, 1, 0.3, 1] as const

function dos(n: number) {
  return String(Math.max(0, n)).padStart(2, '0')
}

function Bloque({ valor, label, delay }: { valor: string; label: string; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, delay, ease: EASE }} className="text-center">
      <p className="text-5xl md:text-6xl tracking-tight tabular-nums select-none">{valor}</p>
      <p className="tracked text-ash mt-3">{label}</p>
    </motion.div>
  )
}

export default function Proximamente({
  numero, teaser, soldOut = null, objetivoMs = null, nota = '25 unidades. Nadie sabe cuando, ni nosotros.',
}: {
  numero: string
  teaser: string | null
  soldOut?: string | null
  objetivoMs?: number | null
  nota?: string
}) {
  const sep = 'text-4xl md:text-5xl text-line leading-[1.1] select-none'

  const [t, setT] = useState<{ d: string; h: string; m: string } | null>(null)
  const primera = useRef(true)

  useEffect(() => {
    if (!objetivoMs) return
    let vivo = true

    const calcular = () => {
      if (!vivo) return
      const falta = objetivoMs - Date.now()

      if (falta <= 0) {
        setT({ d: '00', h: '00', m: '00' })
        // Si la hora se cumple con la pagina abierta, recargamos una vez
        // para que entre el drop ya activo.
        if (!primera.current) {
          vivo = false
          window.location.reload()
        }
        primera.current = false
        return
      }

      const min = Math.floor(falta / 60000)
      setT({
        d: dos(Math.floor(min / 1440)),
        h: dos(Math.floor((min % 1440) / 60)),
        m: dos(min % 60),
      })
      primera.current = false
    }

    calcular()
    const id = setInterval(calcular, 1000)
    return () => { vivo = false; clearInterval(id) }
  }, [objetivoMs])

  return (
    <main className="relative min-h-screen overflow-hidden">
      {teaser && (
        <motion.div initial={{ opacity: 0, scale: 1.15 }} animate={{ opacity: 0.6, scale: 1 }} transition={{ duration: 2.4, ease: EASE }} className="fixed inset-0 pointer-events-none">
          <img src={teaser} alt="" className="w-full h-full object-contain blur-[24px] scale-75 brightness-[1.9]" />
        </motion.div>
      )}

      {soldOut && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE }}
          className="relative z-20 border-b border-line bg-noir/80 backdrop-blur px-6 py-3 text-center"
        >
          <p className="tracked text-ash">{soldOut}</p>
        </motion.div>
      )}

      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-20">
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.6, ease: EASE }} className="w-20 md:w-24">
          <img src="/civis-dog.svg" alt="" className="w-full h-auto" />
        </motion.div>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, delay: 0.6, ease: EASE }} className="tracked text-ash mt-14">Proximamente</motion.p>

        <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.85, ease: EASE }} className="mt-4 text-5xl md:text-7xl tracking-tight">Drop {numero}</motion.h1>

        <div className="mt-16 flex items-start gap-8 md:gap-12">
          <Bloque valor={t ? t.d : '??'} label="Dias" delay={1.15} />
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.1, delay: 1.25 }} className={sep}>:</motion.span>
          <Bloque valor={t ? t.h : '??'} label="Horas" delay={1.3} />
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.1, delay: 1.4 }} className={sep}>:</motion.span>
          <Bloque valor={t ? t.m : '??'} label="Min" delay={1.45} />
        </div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.1, delay: 1.8 }} className="mt-16 text-center text-ash text-sm max-w-xs leading-relaxed">{nota}</motion.p>
      </section>
    </main>
  )
}
