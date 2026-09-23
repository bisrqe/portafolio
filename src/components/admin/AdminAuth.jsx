import { useState } from 'react'
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { auth } from '../../firebaseAdmin'
import { isAdminUser } from './access'

const DENIED = 'Acceso denegado: esta cuenta no tiene permisos de administrador.'

export default function AdminAuth({ accessDenied }) {
  const [error, setError] = useState(accessDenied ? DENIED : '')
  const [loading, setLoading] = useState(false)

  const signIn = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider())
      if (!(await isAdminUser(result.user))) {
        await signOut(auth)
        setError(DENIED)
      }
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') setError('No se pudo iniciar sesión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="adm-auth">
      <div className="adm-auth-card">
        <p className="adm-mono adm-accent">&gt; admin</p>
        <h1>Panel de administración</h1>
        <p className="adm-muted">Inicia sesión con tu cuenta de Google para editar el contenido del portafolio.</p>
        {error && <p className="adm-error adm-block">{error}</p>}
        <button type="button" className="adm-btn adm-btn--primary adm-btn--lg" onClick={signIn} disabled={loading}>
          {loading ? 'Iniciando sesión…' : 'Continuar con Google'}
        </button>
        <a href="/" className="adm-link">← Volver al sitio</a>
      </div>
    </div>
  )
}
