import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  throw new Error('Falta DATABASE_URL en .env.local')
}

export const sql = neon(process.env.DATABASE_URL)

export async function getConfig(): Promise<Record<string, string>> {
  const rows = (await sql`select clave, valor from config`) as {
    clave: string
    valor: string
  }[]
  return Object.fromEntries(rows.map(r => [r.clave, r.valor]))
}