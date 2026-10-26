'use client'

import { motion } from 'motion/react'
import { useRef, useState } from 'react'

const EASE = [0.16, 1, 0.3, 1] as const

type Variante = { id: number; talla: string }

type Cfg = {
  whatsapp: string
  banco: string
  cuenta_titular: string
  cuenta_numero: string
  cuenta_tipo: string
}

type Hecho = {
  pedidoId: number
  talla: string
  posicion: number
  envioGratis: boolean
  totalCent: number
}

export default function Aniversario({
  titulo,
  bajada,
  fotos,
  variantes,
  precioCent,
  unidades,
  confirmadas,
  envioGratisHasta,
  activa,
  abre,
  cfg,
  dropV,
  teaserV,
  preview = false,
}: {
  titulo: string
  bajada: string
  fotos: string[]
  variantes: Variante[]
  precioCent: number
  unidades: number
  confirmadas: number
  envioGratisHasta: number
  activa: boolean
  abre: string
  cfg: Cfg
  dropV: string | null
  teaserV: string | null
  preview?: boolean
}) {
  const [talla, setTalla] = useState<Variante | null>(null)
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [hecho, setHecho] = useState<Hecho | null>(null)
  const [slide, setSlide] = useState(0)
  const [copiado, setCopiado] = useState(false)

  async function copiarCuenta() {
    try {
      await navigator.clipboard.writeText(cfg.cuenta_numero)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {}
  }

  const pista = useRef<HTMLDivElement>(null)

  const telLimpio = telefono.replace(/\D/g, '')
  const telOk = telLimpio.length >= 9 && telLimpio.length <= 13
  const telMal = telefono.length > 0 && !telOk
  const listo = !!talla && nombre.trim().length > 2 && telOk

  const quedan = Math.max(0, unidades - confirmadas)

  async function asegurar() {
    if (!listo || cargando || !talla) return

    if (preview) {
      setHecho({
        pedidoId: 0,
        talla: talla.talla,
        posicion: confirmadas + 1,
        envioGratis: confirmadas + 1 <= envioGratisHasta,
        totalCent: precioCent,
      })
      return
    }

    setCargando(true)
    setError('')
    try {
      const r = await fetch('/api/preventa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          varianteId: talla.id,
          nombre: nombre.trim(),
          telefono: telLimpio,
        }),
      })
      let data: any = null
      try {
        data = await r.json()
      } catch {}
      if (!r.ok || !data) {
        setError(
          data?.error === 'cerrada'
            ? 'La preventa todavia no esta abierta.'
            : 'Algo fallo. Intenta de nuevo.'
        )
        return
      }
      setHecho(data)
    } catch {
      setError('Sin conexion. Intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  function alScroll() {
    const el = pista.current
    if (!el) return
    const i = Math.round(el.scrollLeft / el.clientWidth)
    if (i !== slide) setSlide(i)
  }

  const campo =
    'w-full bg-transparent border-b border-line focus:border-bone outline-none py-3 text-sm transition-colors placeholder:text-ash'

  // ---------- pantalla de confirmacion ----------
  if (hecho) {
    const lineas = [
      'Hola! Quiero asegurar mi camiseta de la ' + titulo + ' de Civis.',
      '',
      '*Mi talla es ' + hecho.talla + '*',
      '',
      'Nombre: ' + nombre.trim(),
      'Telefono: ' + telLimpio,
      'Preventa #' + hecho.posicion + (hecho.envioGratis ? ' · envio gratis' : ''),
      'Total: $' + (hecho.totalCent / 100).toFixed(2),
      '',
      'Voy a transferir a:',
      cfg.banco + ' · ' + cfg.cuenta_tipo,
      cfg.cuenta_numero,
      cfg.cuenta_titular,
      '',
      'Te envio el comprobante enseguida.',
    ]
    const waUrl =
      'https://wa.me/' + cfg.whatsapp + '?text=' + encodeURIComponent(lineas.join('\n'))

    return (
      <main className="min-h-screen px-6 py-20 max-w-md mx-auto">
        {preview && (
          <p className="tracked text-ash border border-line px-3 py-2 mb-10 text-center">
            Vista previa · no se guardo nada
          </p>
        )}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: EASE }}
        >
          <p className="tracked text-ash">Preventa #{hecho.posicion}</p>
          <h1 className="mt-6 text-3xl tracking-tight leading-snug">
            Tu talla {hecho.talla} esta apartada
          </h1>
          <p className="mt-4 text-ash text-sm leading-relaxed">
            Queda reservada 24 horas. Manda el comprobante por WhatsApp y la confirmo.
          </p>

          {hecho.envioGratis && (
            <p className="mt-6 tracked">Envio gratis incluido</p>
          )}

          <div className="mt-12 border-t border-line pt-8">
            <p className="tracked text-ash">Transferencia</p>

            <button
              onClick={copiarCuenta}
              className="w-full mt-5 border border-line hover:border-bone transition-colors duration-300 p-5 text-left"
            >
              <span className="tracked text-ash block">
                {copiado ? 'Copiado' : 'Toca para copiar'}
              </span>
              <span className="block text-2xl tabular-nums mt-2">
                {cfg.cuenta_numero}
              </span>
              <span className="block text-ash text-xs mt-2">
                {cfg.banco} · {cfg.cuenta_tipo} · {cfg.cuenta_titular}
              </span>
            </button>

            <p className="text-2xl mt-8">${(hecho.totalCent / 100).toFixed(2)}</p>
            {!hecho.envioGratis && (
              <p className="text-ash text-xs mt-2">
                Envio se coordina por WhatsApp.
              </p>
            )}
          </div>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center mt-12 py-5 bg-bone text-noir tracked"
          >
            Enviar comprobante
          </a>
          <p className="mt-6 text-ash text-xs leading-relaxed">
            El mensaje ya va escrito con tu talla. Solo adjunta el comprobante.
          </p>
        </motion.div>
      </main>
    )
  }

  // ---------- pagina principal ----------
  return (
    <main className="min-h-screen">
      {preview && (
        <p className="tracked text-ash text-center border-b border-line py-3">
          Vista previa
        </p>
      )}
      <section className="px-6 pt-24 pb-10 max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease: EASE }}
          className="w-16 md:w-20 mx-auto"
        >
          <img src="/civis-dog.svg" alt="" className="w-full h-auto" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.5, ease: EASE }}
          className="tracked text-ash mt-12"
        >
          Preventa
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3, delay: 0.7, ease: EASE }}
          className="mt-4 text-5xl md:text-8xl tracking-tight leading-[0.95] uppercase"
        >
          {titulo}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 1, ease: EASE }}
          className="mt-8 text-ash text-sm md:text-base max-w-md mx-auto leading-relaxed"
        >
          {bajada}
        </motion.p>
      </section>

      {fotos.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 1.2, ease: EASE }}
          className="mt-6"
        >
          <div
            ref={pista}
            onScroll={alScroll}
            className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {fotos.map((f, i) => (
              <div key={i} className="w-full shrink-0 snap-center">
                <img src={f} alt="" className="w-full h-auto block" />
              </div>
            ))}
          </div>

          {fotos.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {fotos.map((_, i) => (
                <span
                  key={i}
                  className={
                    'h-px w-8 transition-colors duration-500 ' +
                    (i === slide ? 'bg-bone' : 'bg-line')
                  }
                />
              ))}
            </div>
          )}
        </motion.section>
      )}

      <section className="px-6 py-20 max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: EASE }}
        >
          <p className="text-2xl">${(precioCent / 100).toFixed(0)}</p>
          <p className="mt-10 text-5xl tracking-tight tabular-nums">
            {String(quedan).padStart(2, '0')}
            <span className="text-ash"> / {unidades}</span>
          </p>
          <p className="tracked text-ash mt-2">Disponibles</p>
          <p className="text-ash text-xs mt-6 leading-relaxed">
            Las primeras {envioGratisHasta} preventas llevan envio gratis a todo el pais.
          </p>
        </motion.div>

        {!activa ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, delay: 0.15, ease: EASE }}
            className="mt-14 border border-line p-8 text-center"
          >
            <p className="tracked text-ash">Abre</p>
            <p className="mt-3 text-2xl">{abre}</p>
            <p className="mt-6 text-ash text-xs leading-relaxed">
              Vuelve a esta pagina para asegurar tu talla.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, delay: 0.15, ease: EASE }}
            className="mt-14"
          >
            <p className="tracked text-ash mb-4">Talla</p>
            <div className="flex gap-3">
              {variantes.map(v => {
                const sel = talla?.id === v.id
                return (
                  <button
                    key={v.id}
                    onClick={() => setTalla(v)}
                    className={
                      'flex-1 py-4 border text-sm transition-colors duration-300 ' +
                      (sel
                        ? 'border-bone bg-bone text-noir'
                        : 'border-line hover:border-bone')
                    }
                  >
                    {v.talla}
                  </button>
                )
              })}
            </div>

            <p className="text-ash text-xs mt-6 leading-relaxed">
              El corte es boxy. Si dudas entre dos tallas, la menor te queda bien.
            </p>

            <div className="mt-12 space-y-8">
              <input
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Nombre y apellido"
                className={campo}
              />
              <div>
                <input
                  value={telefono}
                  onChange={e => setTelefono(e.target.value)}
                  inputMode="tel"
                  type="tel"
                  placeholder="Numero de telefono"
                  className={campo}
                />
                {telMal && (
                  <p className="text-ash text-xs mt-2">
                    Escribe tu numero completo, ej. 0939411416
                  </p>
                )}
              </div>
            </div>

            {error && <p className="text-ash text-xs mt-6">{error}</p>}

            <button
              onClick={asegurar}
              disabled={!listo || cargando}
              className={
                'w-full mt-12 py-5 tracked transition-colors duration-300 ' +
                (listo ? 'bg-bone text-noir' : 'border border-line text-line')
              }
            >
              {cargando ? 'Apartando' : 'Asegurar mi talla'}
            </button>

            <p className="mt-6 text-ash text-xs leading-relaxed">
              Apartamos tu talla y te paso los datos de transferencia. El pago se
              confirma por WhatsApp.
            </p>
          </motion.div>
        )}
      </section>

      {dropV && (
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: EASE }}
          className="relative border-t border-line px-6 py-24 overflow-hidden"
        >
          {teaserV && (
            <div className="absolute inset-0 pointer-events-none opacity-30">
              <img
                src={teaserV}
                alt=""
                className="w-full h-full object-contain blur-[28px] scale-75 brightness-[1.7]"
              />
            </div>
          )}
          <div className="relative text-center">
            <p className="tracked text-ash">Proximamente</p>
            <p className="mt-3 text-3xl md:text-4xl tracking-tight">Drop {dropV}</p>
            <p className="mt-4 text-ash text-xs">25 unidades. Sin fecha todavia.</p>
          </div>
        </motion.section>
      )}
    </main>
  )
}
