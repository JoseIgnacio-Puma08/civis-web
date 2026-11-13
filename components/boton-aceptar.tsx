'use client'

import { useState } from 'react'

export default function BotonAceptar({ id }: { id: number }) {
  const [estado, setEstado] = useState<'idle' | 'cargando' | 'listo'>('idle')
  const [link, setLink] = useState('')

  async function aceptar() {
    setEstado('cargando')
    const r = await fetch('/api/admin/aceptar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (!r.ok) return setEstado('idle')

    const { codigo } = await r.json()
    const url = `${window.location.origin}/i/${codigo}`
    setLink(url)
    try { await navigator.clipboard.writeText(url) } catch {}
    setEstado('listo')
  }

  if (estado === 'listo') {
    return (
      <button
        onClick={() => navigator.clipboard.writeText(link)}
        className="tracked text-bone text-right"
      >
        Copiado
        <span className="block text-ash normal-case tracking-normal text-xs mt-1">
          {link.replace(/^https?:\/\//, '')}
        </span>
      </button>
    )
  }

  return (
    <button
      onClick={aceptar}
      disabled={estado === 'cargando'}
      className="tracked hover:text-ash transition-colors disabled:opacity-40"
    >
      {estado === 'cargando' ? '...' : 'Aceptar'}
    </button>
  )
}