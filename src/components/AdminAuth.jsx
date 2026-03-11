import { useState } from 'react'
import './AdminAuth.css'

function AdminAuth({ onLoginSuccess, onExit }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Simulate auth delay
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        localStorage.setItem('portfolio_admin_token', 'authenticated')
        onLoginSuccess()
      } else {
        setError('Invalid password')
        setPassword('')
      }
      setIsLoading(false)
    }, 500)
  }

  return (
    <div className="admin-auth-overlay">
      <div className="admin-auth-modal">
        <div className="auth-header">
          <h2>🔐 Admin Access</h2>
          {onExit && (
            <button 
              className="btn-exit-auth" 
              onClick={onExit}
              title="Return to home"
            >
              ✕
            </button>
          )}
        </div>
        <p>Enter password to manage projects and photos</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            autoFocus
          />
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AdminAuth
