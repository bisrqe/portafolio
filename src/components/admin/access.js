// A user can open the dashboard if they have the `admin` custom claim (what the
// Firestore/Storage rules check) or match the optional VITE_ADMIN_EMAIL.
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL

export async function isAdminUser(user) {
  if (!user) return false
  const token = await user.getIdTokenResult()
  return Boolean(token.claims.admin) || (Boolean(ADMIN_EMAIL) && user.email === ADMIN_EMAIL)
}

export async function hasAdminClaim(user) {
  if (!user) return false
  const token = await user.getIdTokenResult()
  return Boolean(token.claims.admin)
}
