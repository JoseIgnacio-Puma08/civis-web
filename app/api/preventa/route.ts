import { NextResponse } from 'next/server'

// La preventa de la Edicion Aniversario esta cerrada.
export async function POST() {
  return NextResponse.json({ error: 'cerrada' }, { status: 410 })
}
