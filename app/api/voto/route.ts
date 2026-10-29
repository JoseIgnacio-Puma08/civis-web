import { NextResponse } from 'next/server'

// La votacion del aniversario termino.
export async function POST() {
  return NextResponse.json({ error: 'cerrada' }, { status: 410 })
}
