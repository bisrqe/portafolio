import { useState, useEffect } from 'react'
import AdminAuth from './AdminAuth'
import AdminDashboard from './AdminDashboard'
import './AdminAuth.css'

function AuthAdminPage({ projects, photos, leadership, onAddProject, onDeleteProject, onAddPhoto, onDeletePhoto, onUpdateProject, onUpdatePhoto, onAddLeadership, onDeleteLeadership, onUpdateLeadership }) {
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
          leadership={leadership}
          onAddProject={onAddProject}
          onDeleteProject={onDeleteProject}
          onAddPhoto={onAddPhoto}
          onDeletePhoto={onDeletePhoto}
          onUpdateProject={onUpdateProject}
          onUpdatePhoto={onUpdatePhoto}
          onAddLeadership={onAddLeadership}
          onDeleteLeadership={onDeleteLeadership}
          onUpdateLeadership={onUpdateLeadership}
          onExit={handleExit}
        />
      )}
    </div>
  )
}

export default AuthAdminPage
