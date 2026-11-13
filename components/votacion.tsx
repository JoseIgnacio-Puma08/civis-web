'use client'

import { motion } from 'motion/react'
import { useState } from 'react'

const EASE = [0.16, 1, 0.3, 1] as const

export type Candidato = {
  id: number
  numero: string
  nombre: string | null
  foto_url: string | null
  votos: number
}

export default function Votacion({
  candidatos, yaVoto, titulo, bajada,
}: {
  candidatos: Candidato[]
  yaVoto: boolean
  titulo: string
  bajada: string
}) {
  const [lista, setLista] = useState(candidatos)
  const [votado, setVotado] = useState(yaVoto)
  const [cargando, setCargando] = useState(0)

  const total = lista.reduce((a, c) => a + c.votos, 0)
  const maximo = Math.max(...lista.map(c => c.votos), 0)

  async function votar(id: number) {
    if (votado || cargando) return
    setCargando(id)
    try {
      const r = await fetch('/api/voto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidatoId: id }),
      })
      let data: any = null
      try { data = await r.json() } catch {}
      if (data?.resultados) setLista(data.resultados)
      if (r.ok || data?.error === 'ya votaste') setVotado(true)
    } catch {}
    finally { setCargando(0) }
  }

  return (
    <section className="w-full max-w-2xl mx-auto px-6 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: EASE }}
        className="text-center"
      >
        <p className="tracked text-ash">{titulo}</p>
        <h2 className="mt-4 text-3xl md:text-4xl tracking-tight leading-snug">{bajada}</h2>
        <p className="mt-5 text-ash text-sm leading-relaxed max-w-sm mx-auto">
          {votado
            ? 'Ya votaste. El más votado vuelve en edición aniversario.'
            : 'Un voto por persona. El más votado vuelve en edición aniversario.'}
        </p>
      </motion.div>

      <div className="mt-14 grid grid-cols-2 gap-4 md:gap-6">
        {lista.map((c, i) => {
          const pct = total > 0 ? Math.round((c.votos / total) * 100) : 0
          const lider = votado && c.votos > 0 && c.votos === maximo
          return (
            <motion.button
              key={c.id}
              disabled={votado || cargando !== 0}
              onClick={() => votar(c.id)}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.08 * i, ease: EASE }}
              className={`group text-left border transition-colors duration-500 ${lider ? 'border-bone' : 'border-line hover:border-bone'} disabled:hover:border-line`}
            >
              <div className="relative aspect-square overflow-hidden bg-line/30">
                {c.foto_url && (
                  <img src={c.foto_url} alt="" className={`w-full h-full object-cover transition-all duration-700 ${votado ? 'grayscale-[0.35]' : 'group-hover:scale-105'}`} />
                )}

                {votado && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="absolute inset-0 flex items-center justify-center bg-noir/55"
                  >
                    <span className="text-4xl md:text-5xl tabular-nums">{pct}%</span>
                  </motion.div>
                )}

                {cargando === c.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-noir/70">
                    <span className="tracked">···</span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <p className="text-sm leading-snug">{c.nombre ?? `Drop ${c.numero}`}</p>
                <p className="tracked text-ash mt-2">
                  {votado ? `${c.votos} ${c.votos === 1 ? 'voto' : 'votos'}` : 'Votar'}
                </p>
              </div>

              {votado && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1.4, delay: 0.3, ease: EASE }}
                  className={`h-px ${lider ? 'bg-bone' : 'bg-ash/40'}`}
                />
              )}
            </motion.button>
          )
        })}
      </div>

      {votado && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-10 tracked text-ash text-center"
        >
          {total} {total === 1 ? 'voto' : 'votos'} en total
        </motion.p>
      )}
    </section>
  )
}