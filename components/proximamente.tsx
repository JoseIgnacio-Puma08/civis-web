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

function Hora({ hora, label, delay }: { hora: string; label: string; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, delay, ease: EASE }} className="text-center">
      <p className="text-4xl md:text-6xl tracking-tight tabular-nums">{hora}</p>
      <p className="tracked text-ash mt-3">{label}</p>
    </motion.div>
  )
}

export default function Proximamente({
  numero, teaser, candidatos, yaVoto, votacionActiva, votacionTitulo, votacionBajada,
  aviso = null, avisoTitulo = '', horaGanador = '', horaPreventa = '',
}: {
  numero: string
  teaser: string | null
  desde?: string
  candidatos: Candidato[]
  yaVoto: boolean
  votacionActiva: boolean
  votacionTitulo: string
  votacionBajada: string
  aviso?: string | null
  avisoTitulo?: string
  horaGanador?: string
  horaPreventa?: string
}) {
  const hayVotacion = votacionActiva && candidatos.length > 0
  const sep = 'text-4xl md:text-5xl text-line leading-[1.1] select-none'
  const modoAviso = !!aviso

  return (
    <main className="relative min-h-screen overflow-hidden">
      {teaser && (
        <motion.div initial={{ opacity: 0, scale: 1.15 }} animate={{ opacity: modoAviso ? 0.3 : 0.6, scale: 1 }} transition={{ duration: 2.4, ease: EASE }} className="fixed inset-0 pointer-events-none">
          <img src={teaser} alt="" className="w-full h-full object-contain blur-[24px] scale-75 brightness-[1.9]" />
        </motion.div>
      )}

      {modoAviso && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE }}
          className="relative z-20 border-b border-line bg-noir/80 backdrop-blur px-6 py-3 text-center"
        >
          <p className="tracked">{aviso}</p>
        </motion.div>
      )}

      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-20">
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.6, ease: EASE }} className="w-20 md:w-24">
          <img src="/civis-dog.svg" alt="" className="w-full h-auto" />
        </motion.div>

        {modoAviso ? (
          <>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, delay: 0.6, ease: EASE }} className="tracked text-ash mt-14">Esta noche</motion.p>

            <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.3, delay: 0.85, ease: EASE }} className="mt-4 text-5xl md:text-8xl tracking-tight leading-[0.95] uppercase text-center">{avisoTitulo}</motion.h1>

            <div className="mt-16 flex items-start gap-12 md:gap-20">
              <Hora hora={horaGanador} label="Ganador" delay={1.15} />
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.1, delay: 1.25 }} className={sep}>·</motion.span>
              <Hora hora={horaPreventa} label="Preventa" delay={1.4} />
            </div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.1, delay: 1.8 }} className="mt-16 text-center text-ash text-sm max-w-sm leading-relaxed">
              El drop mas votado vuelve en edicion aniversario. Solo 25 unidades, por preventa.
            </motion.p>
          </>
        ) : (
          <>
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
          </>
        )}

        {hayVotacion && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.1, delay: 2.2 }} className="tracked text-ash mt-20">
            {modoAviso ? 'Vota abajo' : 'Baja'}
          </motion.p>
        )}
      </section>

      {hayVotacion && (
        <div className="relative z-10 pt-10">
          <Votacion candidatos={candidatos} yaVoto={yaVoto} titulo={votacionTitulo} bajada={votacionBajada} />
        </div>
      )}

      {modoAviso && (
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: EASE }}
          className="relative z-10 border-t border-line px-6 py-20 text-center"
        >
          <p className="tracked text-ash">Proximamente</p>
          <p className="mt-3 text-3xl md:text-4xl tracking-tight">Drop {numero}</p>
          <p className="mt-4 text-ash text-xs">25 unidades. Sin fecha todavia.</p>
        </motion.section>
      )}
    </main>
  )
}
