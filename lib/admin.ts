import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? 'dev-secret-cambiar-en-produccion'
)

export const ADMIN_COOKIE = 'civis_admin'

export async function firmarAdmin() {
  return new SignJWT({ rol: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret)
}

export async function esAdmin() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value
  if (!token) return false
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload.rol === 'admin'
  } catch {
    return false
  }
}