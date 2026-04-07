import { useState, useEffect } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../firebase'
import AdminAuth from './AdminAuth'
import AdminDashboard from './AdminDashboard'
import './AdminAuth.css'

function AuthAdminPage({ projects, photos, leadership, homeContent, cvUrl, onAddProject, onDeleteProject, onAddPhoto, onDeletePhoto, onUpdateProject, onUpdatePhoto, onAddLeadership, onDeleteLeadership, onUpdateLeadership, onUpdateHomeContent, onUpdateCvUrl }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)

  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.email === ADMIN_EMAIL) {
          setIsAdmin(true)
          setAccessDenied(false)
        } else {
          setIsAdmin(false)
          setAccessDenied(true)
        }
      } else {
        setIsAdmin(false)
        setAccessDenied(false)
      }
      setIsAuthLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleLoginSuccess = () => {
    setIsAdmin(true)
    setAccessDenied(false)
  }

  const handleExit = async () => {
    await signOut(auth)
    setIsAdmin(false)
    window.location.href = '/'
  }

  if (isAuthLoading) {
    return (
      <div className="auth-admin-page">
        <div style={{ color: 'white', textAlign: 'center', paddingTop: '50px' }}>
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="auth-admin-page">
      {!isAdmin ? (
        <AdminAuth
          onLoginSuccess={handleLoginSuccess}
          onExit={() => window.location.href = '/'}
          accessDenied={accessDenied}
        />
      ) : (
        <AdminDashboard
          projects={projects}
          photos={photos}
          leadership={leadership}
          homeContent={homeContent}
          cvUrl={cvUrl}
          onAddProject={onAddProject}
          onDeleteProject={onDeleteProject}
          onAddPhoto={onAddPhoto}
          onDeletePhoto={onDeletePhoto}
          onUpdateProject={onUpdateProject}
          onUpdatePhoto={onUpdatePhoto}
          onAddLeadership={onAddLeadership}
          onDeleteLeadership={onDeleteLeadership}
          onUpdateLeadership={onUpdateLeadership}
          onUpdateHomeContent={onUpdateHomeContent}
          onUpdateCvUrl={onUpdateCvUrl}
          onExit={handleExit}
        />
      )}
    </div>
  )
}

export default AuthAdminPage
