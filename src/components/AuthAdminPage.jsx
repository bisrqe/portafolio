import { useState, useEffect } from 'react'
import AdminAuth from './AdminAuth'
import AdminDashboard from './AdminDashboard'
import './AdminAuth.css'

function AuthAdminPage({ projects, photos, onAddProject, onDeleteProject, onAddPhoto, onDeletePhoto, onUpdateProject, onUpdatePhoto }) {
  const [isAdmin, setIsAdmin] = useState(false)

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('portfolio_admin_token')
    if (token) {
      setIsAdmin(true)
    }
  }, [])

  const handleLoginSuccess = () => {
    setIsAdmin(true)
  }

  const handleExit = () => {
    localStorage.removeItem('portfolio_admin_token')
    setIsAdmin(false)
    window.location.href = '/'
  }

  return (
    <div className="auth-admin-page">
      {!isAdmin ? (
        <AdminAuth 
          onLoginSuccess={handleLoginSuccess}
          onExit={() => window.location.href = '/'}
        />
      ) : (
        <AdminDashboard 
          projects={projects}
          photos={photos}
          onAddProject={onAddProject}
          onDeleteProject={onDeleteProject}
          onAddPhoto={onAddPhoto}
          onDeletePhoto={onDeletePhoto}
          onUpdateProject={onUpdateProject}
          onUpdatePhoto={onUpdatePhoto}
          onExit={handleExit}
        />
      )}
    </div>
  )
}

export default AuthAdminPage
