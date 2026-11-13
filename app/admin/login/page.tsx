'use client'

import { useState } from 'react'

export default function Login() {
  const [pass, setPass] = useState('')
  const [error, setError] = useState(false)

  async function entrar() {
    const r = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pass }),
    })
    if (r.ok) window.location.href = '/admin'
    else setError(true)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <p className="tracked text-ash mb-6">Panel Civis</p>
      <input
        type="password"
        value={pass}
        onChange={(e) => { setPass(e.target.value); setError(false) }}
        onKeyDown={(e) => e.key === 'Enter' && entrar()}
        placeholder="contraseña"
        className="w-full max-w-xs bg-transparent border-b border-line focus:border-bone outline-none py-3 text-sm text-center transition-colors"
      />
      <button onClick={entrar} className="tracked mt-8 hover:text-ash transition-colors">Entrar</button>
      {error && <p className="text-ash text-xs mt-4">Contraseña incorrecta</p>}
    </main>
  )
}