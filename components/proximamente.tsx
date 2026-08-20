'use client'

import { motion } from 'motion/react'

const EASE = [0.16, 1, 0.3, 1] as const

export default function Proximamente({
  numero,
  teaser,
  texto,
}: {
  numero: string
  teaser: string | null
  texto?: string
}) {
  return (
    <main className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center px-6">
      {teaser && (
        <motion.div
          initial={{ opacity: 0, scale: 1.15 }}
          animate={{ opacity: 0.75, scale: 1 }}
          transition={{ duration: 2.4, ease: EASE }}
          className="absolute inset-0"
        >
          <img
            src={teaser}
            alt=""
            className="w-full h-full object-contain blur-[26px] scale-90 brightness-[1.6]"
          />
        </motion.div>
      )}

      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease: EASE }}
          className="w-20 md:w-24"
        >
          <img src="/civis-dog.svg" alt="" className="w-full h-auto" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.6, ease: EASE }}
          className="tracked text-ash mt-14"
        >
          Próximamente
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.85, ease: EASE }}
          className="mt-4 text-5xl md:text-7xl tracking-tight"
        >
          Drop {numero}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 1.15, ease: EASE }}
          className="mt-8 text-center text-ash text-sm max-w-xs leading-relaxed"
        >
          25 unidades. Ya estás adentro — cuando salga, lo ves aquí primero.
        </motion.p>
      </div>
    </main>
  )
}