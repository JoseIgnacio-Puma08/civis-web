'use client'

import { motion } from 'motion/react'

const L = 'tracked text-ash hover:text-bone transition-colors duration-300'
const EASE = [0.16, 1, 0.3, 1] as const

export default function Home() {
  const fade = (d: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1.1, delay: d, ease: EASE },
  })

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.6, ease: EASE }} className="w-28 md:w-36">
        <img src="/civis-dog.svg" alt="cIvIs brAnd" className="w-full h-auto" />
      </motion.div>

      <motion.div {...fade(0.5)} className="mt-10 w-56 md:w-72">
        <img src="/civis-wordmark.svg" alt="cIvIs brAnd" width={2093} height={649} className="w-full h-auto block" />
      </motion.div>

      <motion.p {...fade(0.9)} className="mt-12 text-center text-xl md:text-2xl leading-snug max-w-md">
        La conocen muchos,<br />la visten pocos.
      </motion.p>

      <motion.p {...fade(1.2)} className="mt-8 text-center text-ash text-sm max-w-sm leading-relaxed">
        Drops de 25 unidades. Cuando se acaban, se acaban.
      </motion.p>

      <motion.a {...fade(1.5)} href="/drop" className="mt-12 px-16 py-5 bg-bone text-noir tracked">
        Entrar
      </motion.a>

      <motion.div {...fade(1.8)} className="mt-16 flex gap-8">
        <a href="https://instagram.com/civis_brand_" target="_blank" rel="noopener noreferrer" className={L}>Instagram</a>
        <a href="https://tiktok.com/@civisbrand_" target="_blank" rel="noopener noreferrer" className={L}>TikTok</a>
      </motion.div>

      <motion.p {...fade(2.1)} className="mt-20 tracked text-ash">Ecuador · Quito</motion.p>
    </main>
  )
}