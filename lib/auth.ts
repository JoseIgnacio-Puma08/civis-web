import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? 'dev-secret-cambiar-en-produccion'
)

export const COOKIE = 'civis_acceso'

export async function firmarAcceso(miembroId: number) {
  return new SignJWT({ mid: miembroId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('365d')
    .sign(secret)
}

export async function verificarAcceso(token?: string) {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload.mid as number
  } catch {
    return null
  }
}