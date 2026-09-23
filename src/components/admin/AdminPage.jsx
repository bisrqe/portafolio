import { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../../firebaseAdmin'
import AdminAuth from './AdminAuth'
import AdminDashboard from './AdminDashboard'
import { hasAdminClaim, isAdminUser } from './access'
import './admin.css'

export default function AdminPage(props) {
  const [state, setState] = useState({ loading: true, user: null, allowed: false, claim: false, denied: false })

  useEffect(() => {
    if (!auth) {
      setState(s => ({ ...s, loading: false }))
      return undefined
    }
    return onAuthStateChanged(auth, async user => {
      if (!user) return setState({ loading: false, user: null, allowed: false, claim: false, denied: false })
      const allowed = await isAdminUser(user)
      const claim = allowed && (await hasAdminClaim(user))
      setState({ loading: false, user, allowed, claim, denied: !allowed })
    })
  }, [])

  if (!auth) {
    return (
      <div className="adm-auth">
        <div className="adm-auth-card">
          <h1>Firebase no está configurado</h1>
          <p className="adm-muted">Agrega las variables VITE_FIREBASE_* en .env.local (consulta .env.example).</p>
        </div>
      </div>
    )
  }

  if (state.loading) return <div className="adm-auth"><p className="adm-mono adm-muted">Cargando…</p></div>
  if (!state.allowed) return <AdminAuth accessDenied={state.denied} />

  return (
    <AdminDashboard
      {...props}
      user={state.user}
      hasClaim={state.claim}
      onSignOut={async () => { await signOut(auth); window.location.href = '/' }}
    />
  )
}
