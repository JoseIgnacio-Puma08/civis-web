'use client'

import { useState } from 'react'

export type Preventa = {
  id: number
  nombre: string
  contacto: string
  ciudad: string | null
  talla: string | null
  estado: string
  origen: string
  envio_cent: number
  total_cent: number
  posicion: number | null
}

export default function AdminPreventa({
  pedidos,
  variantes,
}: {
  pedidos: Preventa[]
  variantes: { id: number; talla: string }[]
}) {
  const [busy, setBusy] = useState(0)
  const [abierto, setAbierto] = useState(false)
  const [m, setM] = useState({ varianteId: 0, nombre: '', contacto: '' })

  async function accion(payload: any, id = 0) {
    setBusy(id || -1)
    await fetch('/api/admin/pedido', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    window.location.reload()
  }

  const campo =
    'w-full bg-transparent border-b border-line focus:border-bone outline-none py-3 text-sm placeholder:text-ash'

  return (
    <div>
      <div className="mt-14 flex items-center justify-between">
        <p className="tracked text-ash">Preventas</p>
        <button
          onClick={() => setAbierto(!abierto)}
          className="tracked hover:text-ash transition-colors"
        >
          {abierto ? 'Cerrar' : 'Registrar manual'}
        </button>
      </div>

      {abierto && (
        <div className="mt-6 border border-line p-6 space-y-6">
          <div className="flex gap-3">
            {variantes.map(v => (
              <button
                key={v.id}
                onClick={() => setM({ ...m, varianteId: v.id })}
                className={
                  'flex-1 py-3 border text-sm ' +
                  (m.varianteId === v.id
                    ? 'border-bone bg-bone text-noir'
                    : 'border-line')
                }
              >
                {v.talla}
              </button>
            ))}
          </div>
          <input
            value={m.nombre}
            onChange={e => setM({ ...m, nombre: e.target.value })}
            placeholder="Nombre"
            className={campo}
          />
          <input
            value={m.contacto}
            onChange={e => setM({ ...m, contacto: e.target.value })}
            placeholder="Telefono"
            className={campo}
          />
          <button
            disabled={!m.varianteId || busy !== 0}
            onClick={() => accion({ accion: 'manual_preventa', ...m })}
            className={
              'w-full py-4 tracked ' +
              (m.varianteId ? 'bg-bone text-noir' : 'border border-line text-line')
            }
          >
            Registrar como pagada
          </button>
        </div>
      )}

      <div className="mt-6 border-t border-line">
        {pedidos.map(p => {
          const wa = 'https://wa.me/593' + p.contacto.replace(/^0+/, '')
          return (
            <div key={p.id} className="py-5 border-b border-line">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm">
                    {p.posicion ? '#' + p.posicion + ' · ' : ''}
                    {p.nombre}
                    {p.origen === 'manual' && (
                      <span className="text-ash"> · directa</span>
                    )}
                  </p>
                  <p className="text-ash text-xs mt-1">
                    Talla <span className="text-bone">{p.talla ?? '—'}</span>
                    {' · '}
                    <span className="text-bone">{p.ciudad ?? 'sin ciudad'}</span>
                  </p>
                  <p className="text-ash text-xs mt-1">
                    ${(p.total_cent / 100).toFixed(2)}
                    {p.envio_cent === 0
                      ? ' · envio gratis'
                      : ' · envio $' + (p.envio_cent / 100).toFixed(2)}
                  </p>
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ash text-xs mt-1 block hover:text-bone transition-colors"
                  >
                    {p.contacto}
                  </a>
                </div>

                <div className="flex gap-4 shrink-0">
                  {p.estado === 'pendiente' ? (
                    <>
                      <button
                        disabled={busy !== 0}
                        onClick={() => accion({ accion: 'confirmar', id: p.id }, p.id)}
                        className="tracked hover:text-ash transition-colors"
                      >
                        Confirmar
                      </button>
                      <button
                        disabled={busy !== 0}
                        onClick={() => accion({ accion: 'cancelar', id: p.id }, p.id)}
                        className="tracked text-ash hover:text-bone transition-colors"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <span className="tracked text-ash">{p.estado}</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        {pedidos.length === 0 && (
          <p className="text-ash text-sm py-8">Todavia no hay preventas.</p>
        )}
      </div>
    </div>
  )
}
