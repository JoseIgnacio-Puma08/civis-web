'use client'

import { useState } from 'react'

type Pedido = {
  id: number
  nombre: string
  contacto: string
  ciudad: string
  talla: string
  total_cent: number
  estado: string
  origen: string
  creado_en: string
}

type Variante = { id: number; talla: string; stock: number }

export default function AdminPedidos({
  pedidos, variantes,
}: {
  pedidos: Pedido[]
  variantes: Variante[]
}) {
  const [busy, setBusy] = useState(0)
  const [abierto, setAbierto] = useState(false)
  const [m, setM] = useState({ varianteId: 0, nombre: '', contacto: '', ciudad: '' })

  async function accion(payload: any, id = 0) {
    setBusy(id || -1)
    await fetch('/api/admin/pedido', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    window.location.reload()
  }

  const campo = 'w-full bg-transparent border-b border-line focus:border-bone outline-none py-3 text-sm placeholder:text-ash'

  return (
    <div>
      <div className="mt-16 flex items-center justify-between">
        <p className="tracked text-ash">Stock</p>
        <button onClick={() => setAbierto(!abierto)} className="tracked hover:text-ash transition-colors">
          {abierto ? 'Cerrar' : 'Venta manual'}
        </button>
      </div>

      <div className="mt-4 flex gap-6 text-sm">
        {variantes.map(v => (
          <span key={v.id}>{v.talla} <span className="text-ash">{v.stock}</span></span>
        ))}
      </div>

      {abierto && (
        <div className="mt-8 border border-line p-6 space-y-6">
          <div className="flex gap-3">
            {variantes.map(v => (
              <button
                key={v.id}
                disabled={v.stock === 0}
                onClick={() => setM({ ...m, varianteId: v.id })}
                className={`flex-1 py-3 border text-sm ${m.varianteId === v.id ? 'border-bone bg-bone text-noir' : v.stock === 0 ? 'border-line text-line line-through' : 'border-line'}`}
              >
                {v.talla}
              </button>
            ))}
          </div>
          <input value={m.nombre} onChange={e => setM({ ...m, nombre: e.target.value })} placeholder="Nombre" className={campo} />
          <input value={m.contacto} onChange={e => setM({ ...m, contacto: e.target.value })} placeholder="Teléfono" className={campo} />
          <input value={m.ciudad} onChange={e => setM({ ...m, ciudad: e.target.value })} placeholder="Ciudad" className={campo} />
          <button
            disabled={!m.varianteId || busy !== 0}
            onClick={() => accion({ accion: 'manual', ...m })}
            className={`w-full py-4 tracked ${m.varianteId ? 'bg-bone text-noir' : 'border border-line text-line'}`}
          >
            Registrar venta
          </button>
        </div>
      )}

      <p className="tracked text-ash mt-20">Pedidos</p>

      <div className="mt-6 border-t border-line">
        {pedidos.map(p => (
          <div key={p.id} className="py-5 border-b border-line">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm">
                  #{p.id} · {p.nombre}
                  {p.origen === 'manual' && <span className="text-ash"> · directa</span>}
                </p>
                <p className="text-ash text-xs mt-1">
                  {p.talla} · {p.ciudad} · ${(p.total_cent / 100).toFixed(2)}
                </p>
                <p className="text-ash text-xs mt-1">{p.contacto}</p>
              </div>

              {p.estado === 'pendiente' ? (
                <div className="flex gap-4 shrink-0">
                  <button
                    disabled={busy !== 0}
                    onClick={() => accion({ accion: 'confirmar', id: p.id }, p.id)}
                    className="tracked hover:text-ash transition-colors"
                  >
                    Pagado
                  </button>
                  <button
                    disabled={busy !== 0}
                    onClick={() => accion({ accion: 'cancelar', id: p.id }, p.id)}
                    className="tracked text-ash hover:text-bone transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <span className="tracked text-ash shrink-0">{p.estado}</span>
              )}
            </div>
          </div>
        ))}
        {pedidos.length === 0 && <p className="text-ash text-sm py-8">Sin pedidos todavía.</p>}
      </div>
    </div>
  )
}