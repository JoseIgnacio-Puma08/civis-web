'use client'

import { useState } from 'react'

export type Variante = { id: number; talla: string; stock: number }

export type Pedido = {
  id: number
  nombre: string
  contacto: string
  ciudad: string | null
  talla: string | null
  estado: string
  origen: string
  total_cent: number
  numero?: number
}

const TALLAS = ['S', 'M', 'L']

export default function AdminDrop({
  dropId,
  estado,
  precioCent,
  variantes,
  pedidos,
}: {
  dropId: number
  estado: string
  precioCent: number
  variantes: Variante[]
  pedidos: Pedido[]
}) {
  const inicial: Record<string, string> = {}
  TALLAS.forEach(t => {
    const v = variantes.find(x => x.talla.toUpperCase() === t)
    inicial[t] = String(v?.stock ?? 0)
  })

  const [tallas, setTallas] = useState(inicial)
  const [busy, setBusy] = useState(false)
  const [abierto, setAbierto] = useState(false)
  const [m, setM] = useState({ varianteId: 0, nombre: '', contacto: '', ciudad: '' })

  const total = TALLAS.reduce((a, t) => a + (parseInt(tallas[t]) || 0), 0)

  async function llamar(url: string, payload: any) {
    setBusy(true)
    await fetch(url, {
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
      {/* ---------- estado ---------- */}
      <div className="mt-14">
        <p className="tracked text-ash">Estado del drop</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {['borrador', 'proximamente', 'activo', 'cerrado'].map(e => (
            <button
              key={e}
              disabled={busy || e === estado}
              onClick={() => llamar('/api/admin/drop', { accion: 'estado', dropId, estado: e })}
              className={
                'py-3 border text-sm transition-colors duration-300 ' +
                (e === estado
                  ? 'border-bone bg-bone text-noir'
                  : 'border-line hover:border-bone')
              }
            >
              {e}
            </button>
          ))}
        </div>
        <p className="text-ash text-xs mt-3 leading-relaxed">
          Activo abre la venta en la web. Proximamente muestra el contador.
        </p>
      </div>

      {/* ---------- tallas ---------- */}
      <div className="mt-14 border-t border-line pt-10">
        <div className="flex items-baseline justify-between">
          <p className="tracked text-ash">Tallas y stock</p>
          <p className="text-2xl tabular-nums">{total}</p>
        </div>

        <div className="mt-6 space-y-5">
          {TALLAS.map(t => (
            <div key={t} className="flex items-center gap-5">
              <span className="w-10 text-lg">{t}</span>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={tallas[t]}
                onChange={e => setTallas({ ...tallas, [t]: e.target.value })}
                className="flex-1 bg-transparent border-b border-line focus:border-bone outline-none py-3 text-lg tabular-nums"
              />
            </div>
          ))}
        </div>

        <button
          disabled={busy}
          onClick={() =>
            llamar('/api/admin/drop', {
              accion: 'tallas',
              dropId,
              tallas: TALLAS.map(t => ({ talla: t, stock: parseInt(tallas[t]) || 0 })),
            })
          }
          className="w-full mt-8 py-4 bg-bone text-noir tracked"
        >
          Guardar tallas
        </button>
        <p className="text-ash text-xs mt-3 leading-relaxed">
          El total se guarda como las unidades del drop.
        </p>
      </div>

      {/* ---------- venta manual ---------- */}
      <div className="mt-14 border-t border-line pt-10">
        <div className="flex items-center justify-between">
          <p className="tracked text-ash">Venta manual</p>
          <button
            onClick={() => setAbierto(!abierto)}
            className="tracked hover:text-ash transition-colors"
          >
            {abierto ? 'Cerrar' : 'Registrar'}
          </button>
        </div>

        {abierto && (
          <div className="mt-6 border border-line p-6 space-y-6">
            {variantes.length === 0 ? (
              <p className="text-ash text-sm">Guarda las tallas primero.</p>
            ) : (
              <>
                <div className="flex gap-3">
                  {variantes.map(v => (
                    <button
                      key={v.id}
                      disabled={v.stock === 0}
                      onClick={() => setM({ ...m, varianteId: v.id })}
                      className={
                        'flex-1 py-3 border text-sm ' +
                        (m.varianteId === v.id
                          ? 'border-bone bg-bone text-noir'
                          : v.stock === 0
                          ? 'border-line text-line line-through'
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
                <input
                  value={m.ciudad}
                  onChange={e => setM({ ...m, ciudad: e.target.value })}
                  placeholder="Ciudad"
                  className={campo}
                />
                <button
                  disabled={!m.varianteId || busy}
                  onClick={() => llamar('/api/admin/pedido', { accion: 'manual', ...m })}
                  className={
                    'w-full py-4 tracked ' +
                    (m.varianteId ? 'bg-bone text-noir' : 'border border-line text-line')
                  }
                >
                  Registrar como pagada
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* ---------- pedidos ---------- */}
      <div className="mt-14 border-t border-line pt-10">
        <p className="tracked text-ash">Pedidos</p>
        <div className="mt-6 border-t border-line">
          {pedidos.map(p => {
            const wa = 'https://wa.me/593' + p.contacto.replace(/^0+/, '')
            return (
              <div key={p.id} className="py-5 border-b border-line">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm">
                      Pedido #{p.numero ?? p.id} · {p.nombre}
                      {p.origen === 'manual' && <span className="text-ash"> · directa</span>}
                    </p>
                    <p className="text-ash text-xs mt-1">
                      Talla <span className="text-bone">{p.talla ?? '—'}</span> ·{' '}
                      {p.ciudad ?? 'sin ciudad'} · ${(p.total_cent / 100).toFixed(2)}
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
                          disabled={busy}
                          onClick={() => llamar('/api/admin/pedido', { accion: 'confirmar', id: p.id })}
                          className="tracked hover:text-ash transition-colors"
                        >
                          Pagado
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => llamar('/api/admin/pedido', { accion: 'cancelar', id: p.id })}
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
            <p className="text-ash text-sm py-8">Sin pedidos todavia.</p>
          )}
        </div>
      </div>
    </div>
  )
}
