// Verifies that a request comes from the portfolio owner: a valid Firebase ID token with the
// `admin` claim, or the owner's verified email (ADMIN_EMAIL / VITE_ADMIN_EMAIL).
import { createRemoteJWKSet, jwtVerify } from 'jose'

const GOOGLE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'),
)

export async function authorize(headers = {}, env = {}, bodyToken = '') {
  const projectId = env.FIREBASE_PROJECT_ID || env.VITE_FIREBASE_PROJECT_ID
  const adminEmail = (env.ADMIN_EMAIL || env.VITE_ADMIN_EMAIL || '').toLowerCase()
  const header = headers.authorization || headers.Authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : bodyToken
  if (!projectId) return { ok: false, status: 500, error: 'FIREBASE_PROJECT_ID is not configured on the server.' }
  if (!token) return { ok: false, status: 401, error: 'Missing sign-in token.' }
  try {
    const { payload } = await jwtVerify(token, GOOGLE_JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    })
    const isOwner = adminEmail && payload.email?.toLowerCase() === adminEmail && payload.email_verified === true
    if (payload.admin === true || isOwner) return { ok: true }
    return { ok: false, status: 403, error: 'This account is not allowed to do this.' }
  } catch {
    return { ok: false, status: 401, error: 'Invalid or expired sign-in token.' }
  }
}
