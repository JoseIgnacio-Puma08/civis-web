'use client'

import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import Votacion, { type Candidato } from '@/components/votacion'

const EASE = [0.16, 1, 0.3, 1] as const

function Bloque({ label, delay }: { label: string; delay: number }) {
  const [txt, setTxt] = useState('??')
  useEffect(() => {
    let vivo = true
    const tick = () => {
      if (!vivo) return
      setTimeout(() => {
        if (!vivo) return
        const d = String(Math.floor(Math.random() * 10))
        setTxt(Math.random() < 0.5 ? d + '?' : '?' + d)
        setTimeout(() => { if (vivo) setTxt('??') }, 110)
        tick()
      }, 2200 + Math.random() * 4000)
    }
    tick()
    return () => { vivo = false }
  }, [])
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, delay, ease: EASE }} className="text-center">
      <p className="text-5xl md:text-6xl tracking-tight tabular-nums select-none">{txt}</p>
      <p className="tracked text-ash mt-3">{label}</p>
    </motion.div>
  )
}

export default function Proximamente({
  numero, teaser, candidatos, yaVoto, votacionActiva, votacionTitulo, votacionBajada,
}: {
  numero: string
  teaser: string | null
  desde?: string
  candidatos: Candidato[]
  yaVoto: boolean
  votacionActiva: boolean
  votacionTitulo: string
  votacionBajada: string
}) {
  const hayVotacion = votacionActiva && candidatos.length > 0
  const sep = 'text-4xl md:text-5xl text-line leading-[1.1] select-none'

  return (
    <main className="relative min-h-screen overflow-hidden">
      {teaser && (
        <motion.div initial={{ opacity: 0, scale: 1.15 }} animate={{ opacity: 0.6, scale: 1 }} transition={{ duration: 2.4, ease: EASE }} className="fixed inset-0 pointer-events-none">
          <img src={teaser} alt="" className="w-full h-full object-contain blur-[24px] scale-75 brightness-[1.9]" />
        </motion.div>
      )}

      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.6, ease: EASE }} className="w-20 md:w-24">
          <img src="/civis-dog.svg" alt="" className="w-full h-auto" />
        </motion.div>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, delay: 0.6, ease: EASE }} className="tracked text-ash mt-14">Proximamente</motion.p>

        <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.85, ease: EASE }} className="mt-4 text-5xl md:text-7xl tracking-tight">Drop {numero}</motion.h1>

        <div className="mt-16 flex items-start gap-8 md:gap-12">
          <Bloque label="Dias" delay={1.15} />
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.1, delay: 1.25 }} className={sep}>:</motion.span>
          <Bloque label="Horas" delay={1.3} />
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.1, delay: 1.4 }} className={sep}>:</motion.span>
          <Bloque label="Min" delay={1.45} />
        </div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.1, delay: 1.8 }} className="mt-16 text-center text-ash text-sm max-w-xs leading-relaxed">25 unidades. Nadie sabe cuando, ni nosotros.</motion.p>

        {hayVotacion && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.1, delay: 2.2 }} className="tracked text-ash mt-20">Baja</motion.p>
        )}
      </section>

      {hayVotacion && (
        <div className="relative z-10 pt-10">
          <Votacion candidatos={candidatos} yaVoto={yaVoto} titulo={votacionTitulo} bajada={votacionBajada} />
        </div>
      )}
    </main>
  )
}