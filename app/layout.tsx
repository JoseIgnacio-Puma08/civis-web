import type { Metadata } from 'next'
import { Archivo } from 'next/font/google'
import SmoothScroll from '@/components/smooth-scroll'
import './globals.css'

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'cIvIs brAnd',
  description: 'La conocen muchos, la visten pocos.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={archivo.variable}>
      <body
        style={{ fontFamily: 'var(--font-archivo), system-ui, sans-serif' }}
        className="bg-noir text-bone antialiased"
      >
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  )
}