// After content changes, asks Vercel to rebuild the static (prerendered) pages.
// Saves are grouped: the rebuild starts 20 s after the last change, or when the tab is closed.
import { auth } from '../../firebaseAdmin'

const DELAY = 20000
let timer = null
let token = ''
let listener = () => {}

export function onPublishState(fn) { listener = fn }

async function send() {
  timer = null
  listener({ state: 'running' })
  try {
    const idToken = await auth.currentUser.getIdToken()
    const res = await fetch('/api/rebuild', { method: 'POST', headers: { Authorization: `Bearer ${idToken}` } })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
    listener(data.triggered ? { state: 'done' } : { state: 'disabled', reason: data.reason })
  } catch (err) {
    listener({ state: 'error', reason: err.message })
  }
}

export function schedulePublish() {
  clearTimeout(timer)
  timer = setTimeout(send, DELAY)
  listener({ state: 'scheduled' })
  auth?.currentUser?.getIdToken().then(t => { token = t }).catch(() => {})
}

export function publishNow() {
  clearTimeout(timer)
  return send()
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => {
    if (!timer || !token) return
    navigator.sendBeacon('/api/rebuild', new Blob([JSON.stringify({ token })], { type: 'application/json' }))
  })
}
