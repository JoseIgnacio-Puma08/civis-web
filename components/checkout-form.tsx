'use client'

import { motion } from 'motion/react'
import { useState } from 'react'

const EASE = [0.16, 1, 0.3, 1] as const

type Cfg = { whatsapp: string; banco: string; cuenta_titular: string; cuenta_numero: string; cuenta_tipo: string }

export default function CheckoutForm({
  varianteId, talla, precioCent, ciudadesGratis, envioNacionalCent, cfg,
}: {
  varianteId: number
  talla: string
  precioCent: number
  ciudadesGratis: string[]
  envioNacionalCent: number
  cfg: Cfg
}) {
  const [f, setF] = useState({ nombre: '', contacto: '', ciudad: '', direccion: '' })
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [hecho, setHecho] = useState<any>(null)

  const telLimpio = f.contacto.replace(/\D/g, '')
  const telOk = telLimpio.length >= 9 && telLimpio.length <= 13
  const telMal = f.contacto.length > 0 && !telOk

  const esGratis = ciudadesGratis.some(c => c.toLowerCase() === f.ciudad.trim().toLowerCase())
  const envio = f.ciudad.trim() ? (esGratis ? 0 : envioNacionalCent) : 0
  const total = precioCent + envio
  const listo = f.nombre.trim().length > 2 && telOk && f.ciudad.trim().length > 0

  async function enviar() {
    if (!listo || cargando) return
    setCargando(true)
    setError('')
    try {
      const r = await fetch('/api/pedido', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ varianteId, ...f, contacto: telLimpio }),
      })
      let data: any = null
      try { data = await r.json() } catch {}
      if (!r.ok || !data) {
        setError(data?.error === 'agotado' ? 'Esa talla se acaba de agotar.' : 'Algo falló. Intenta de nuevo.')
        return
      }
      setHecho(data)
    } catch {
      setError('Sin conexión. Intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  const campo = 'w-full bg-transparent border-b border-line focus:border-bone outline-none py-3 text-sm transition-colors placeholder:text-ash'

  if (hecho) {
    const texto = 'Hola! Pedido #' + hecho.pedidoId + ' - Drop IV talla ' + talla + '. Total $' + (hecho.totalCent / 100).toFixed(2) + '. Te envio el comprobante.'
    const waUrl = 'https://wa.me/' + cfg.whatsapp + '?text=' + encodeURIComponent(texto)
    return (
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, ease: EASE }} className="px-6 py-20 max-w-md mx-auto">
        <p className="tracked text-ash">Pedido #{hecho.pedidoId}</p>
        <h1 className="mt-6 text-3xl tracking-tight">Tu talla {talla} está reservada</h1>
        <p className="mt-4 text-ash text-sm leading-relaxed">Tienes 24 horas para transferir y enviarme el comprobante. Después la unidad vuelve a estar disponible.</p>

        <div className="mt-12 border-t border-line pt-8 space-y-3">
          <p className="tracked text-ash">Transferencia</p>
          <div className="text-sm space-y-1">
            <p>{cfg.banco}</p>
            <p>{cfg.cuenta_tipo} · {cfg.cuenta_numero}</p>
            <p className="text-ash">{cfg.cuenta_titular}</p>
          </div>
          <p className="text-2xl pt-4">${(hecho.totalCent / 100).toFixed(2)}</p>
        </div>

        <a href={waUrl} target="_blank" rel="noopener noreferrer" className="block text-center mt-12 py-5 bg-bone text-noir tracked">Enviar comprobante</a>
        <p className="mt-6 text-ash text-xs leading-relaxed">Al recibirlo confirmo tu pedido y coordinamos la entrega.</p>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, ease: EASE }} className="px-6 py-20 max-w-md mx-auto">
      <p className="tracked text-ash">Drop IV · Talla {talla}</p>
      <h1 className="mt-6 text-3xl tracking-tight">Tus datos</h1>

      <div className="mt-12 space-y-8">
        <input value={f.nombre} onChange={e => setF({ ...f, nombre: e.target.value })} placeholder="Nombre y apellido" className={campo} />
        <div>
          <input value={f.contacto} onChange={e => setF({ ...f, contacto: e.target.value })} inputMode="tel" type="tel" placeholder="Número de teléfono" className={campo} />
          {telMal && <p className="text-ash text-xs mt-2">Escribe tu número completo, ej. 0939411416</p>}
        </div>
        <input value={f.ciudad} onChange={e => setF({ ...f, ciudad: e.target.value })} placeholder="Ciudad" className={campo} />
        <input value={f.direccion} onChange={e => setF({ ...f, direccion: e.target.value })} placeholder="Dirección (si es envío)" className={campo} />
      </div>

      <div className="mt-14 border-t border-line pt-8 space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-ash">Camiseta</span><span>${(precioCent / 100).toFixed(2)}</span></div>
        <div className="flex justify-between"><span className="text-ash">Envío</span><span>{f.ciudad.trim().length === 0 ? '—' : envio === 0 ? 'Gratis' : '$' + (envio / 100).toFixed(2)}</span></div>
        <div className="flex justify-between pt-4 text-lg"><span>Total</span><span>${(total / 100).toFixed(2)}</span></div>
      </div>

      {error && <p className="text-ash text-xs mt-6">{error}</p>}

      <button onClick={enviar} disabled={!listo || cargando} className={`w-full mt-12 py-5 tracked transition-colors duration-300 ${listo ? 'bg-bone text-noir' : 'border border-line text-line'}`}>{cargando ? 'Reservando' : 'Reservar mi talla'}</button>
      <p className="mt-6 text-ash text-xs leading-relaxed">Al reservar apartamos tu unidad. El pago es por transferencia y coordinamos por WhatsApp al número que dejaste.</p>
    </motion.div>
  )
}   