// Triggers a new Vercel deployment (Deploy Hook) so the prerendered HTML includes the latest
// content saved from the admin dashboard. Configure VERCEL_DEPLOY_HOOK_URL in Vercel.
import { authorize } from './auth.js'

export async function handleRebuild({ headers = {}, body = {}, env = process.env }) {
  const auth = await authorize(headers, env, typeof body?.token === 'string' ? body.token : '')
  if (!auth.ok) return { status: auth.status, body: { error: auth.error } }

  const hook = env.VERCEL_DEPLOY_HOOK_URL
  if (!hook) return { status: 200, body: { triggered: false, reason: 'VERCEL_DEPLOY_HOOK_URL is not configured.' } }
  try {
    const res = await fetch(hook, { method: 'POST' })
    if (!res.ok) throw new Error(`Deploy hook responded ${res.status}`)
    return { status: 200, body: { triggered: true } }
  } catch (err) {
    return { status: 502, body: { error: err.message } }
  }
}
