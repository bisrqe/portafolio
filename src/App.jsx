import { useState, useEffect } from 'react'
import { db } from './firebase'
import { collection, addDoc, deleteDoc, doc, onSnapshot, query } from 'firebase/firestore'
import Navigation from './components/Navigation'
import ProjectsView from './components/ProjectsView'
import PhotographyView from './components/PhotographyView'
import AdminDashboard from './components/AdminDashboard'
import './App.css'

function App() {
  const [currentSection, setCurrentSection] = useState('home')
  const [projects, setProjects] = useState([])
  const [photos, setPhotos] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Load projects from Firestore
  useEffect(() => {
    if (!db) {
      console.error('Firebase not initialized. Using localStorage fallback.')
      const saved = localStorage.getItem('portfolio_projects')
      if (saved) {
        setProjects(JSON.parse(saved))
      } else {
        setProjects([
          {
            id: 1,
            title: 'Project 1',
            description: 'A brief description of your project',
            link: '#',
            image: 'https://via.placeholder.com/300x200?text=Project+1'
          }
        ])
      }
      return
    }

    const projectsRef = collection(db, 'projects')
    const unsubscribe = onSnapshot(projectsRef, (snapshot) => {
      const projectsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setProjects(projectsList)
      // Also save to localStorage as backup
      localStorage.setItem('portfolio_projects', JSON.stringify(projectsList))
    }, (error) => {
      console.error('Error loading projects from Firebase:', error)
      // Fallback to localStorage if Firebase fails
      const saved = localStorage.getItem('portfolio_projects')
      if (saved) setProjects(JSON.parse(saved))
    })

    return unsubscribe
  }, [])

  // Load photos from Firestore
  useEffect(() => {
    if (!db) {
      console.error('Firebase not initialized. Using localStorage fallback.')
      const saved = localStorage.getItem('portfolio_photos')
      if (saved) {
        setPhotos(JSON.parse(saved))
      } else {
        setPhotos([
          {
            id: 1,
            title: 'Photo 1',
            image: 'https://via.placeholder.com/300x300?text=Photo+1',
            description: 'Photography description'
          }
        ])
      }
      setIsLoading(false)
      return
    }

    const photosRef = collection(db, 'photos')
    const unsubscribe = onSnapshot(photosRef, (snapshot) => {
      const photosList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setPhotos(photosList)
      // Also save to localStorage as backup
      localStorage.setItem('portfolio_photos', JSON.stringify(photosList))
      setIsLoading(false)
    }, (error) => {
      console.error('Error loading photos from Firebase:', error)
      // Fallback to localStorage if Firebase fails
      const saved = localStorage.getItem('portfolio_photos')
      if (saved) setPhotos(JSON.parse(saved))
      setIsLoading(false)
    })

    return unsubscribe
  }, [])

  const addProject = async (project) => {
    if (!db) {
      console.error('Firebase not initialized. Cannot save to cloud. Using localStorage only.')
      alert('⚠️ Cloud sync unavailable. Saving locally.')
      const existing = localStorage.getItem('portfolio_projects')
      const projects = existing ? JSON.parse(existing) : []
      projects.push({ ...project, id: Date.now() })
      localStorage.setItem('portfolio_projects', JSON.stringify(projects))
      return
    }

    try {
      const projectsRef = collection(db, 'projects')
      await addDoc(projectsRef, {
        ...project,
        createdAt: new Date()
      })
    } catch (error) {
      console.error('Error adding project to Firebase:', error)
      alert('Failed to save to cloud. Saving locally.')
      const existing = localStorage.getItem('portfolio_projects')
      const projects = existing ? JSON.parse(existing) : []
      projects.push({ ...project, id: Date.now() })
      localStorage.setItem('portfolio_projects', JSON.stringify(projects))
    }
  }

  const deleteProject = async (id) => {
    if (!db) {
      // Delete from localStorage if Firebase not available
      const existing = localStorage.getItem('portfolio_projects')
      if (existing) {
        const projects = JSON.parse(existing).filter(p => p.id !== id)
        localStorage.setItem('portfolio_projects', JSON.stringify(projects))
      }
      return
    }

    try {
      await deleteDoc(doc(db, 'projects', id))
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Failed to delete project.')
    }
  }

  const addPhoto = async (photo) => {
    if (!db) {
      console.error('Firebase not initialized. Cannot save to cloud. Using localStorage only.')
      alert('⚠️ Cloud sync unavailable. Saving locally.')
      const existing = localStorage.getItem('portfolio_photos')
      const photos = existing ? JSON.parse(existing) : []
      photos.push({ ...photo, id: Date.now() })
      localStorage.setItem('portfolio_photos', JSON.stringify(photos))
      return
    }

    try {
      const photosRef = collection(db, 'photos')
      await addDoc(photosRef, {
        ...photo,
        createdAt: new Date()
      })
    } catch (error) {
      console.error('Error adding photo to Firebase:', error)
      alert('Failed to save to cloud. Saving locally.')
      const existing = localStorage.getItem('portfolio_photos')
      const photos = existing ? JSON.parse(existing) : []
      photos.push({ ...photo, id: Date.now() })
      localStorage.setItem('portfolio_photos', JSON.stringify(photos))
    }
  }

  const deletePhoto = async (id) => {
    if (!db) {
      // Delete from localStorage if Firebase not available
      const existing = localStorage.getItem('portfolio_photos')
      if (existing) {
        const photos = JSON.parse(existing).filter(p => p.id !== id)
        localStorage.setItem('portfolio_photos', JSON.stringify(photos))
      }
      return
    }

    try {
      await deleteDoc(doc(db, 'photos', id))
    } catch (error) {
      console.error('Error deleting photo:', error)
      alert('Failed to delete photo.')
    }
  }

  if (isLoading) {
    return <div className="app"><div style={{ color: 'white', textAlign: 'center', paddingTop: '50px' }}>Loading...</div></div>
  }

  return (
    <div className="app">
      <Navigation currentSection={currentSection} setCurrentSection={setCurrentSection} />
      
      <main className="main-content">
        {currentSection === 'home' && (
          <section className="hero">
            <div className="hero-content">
              <h1>Welcome to My Portfolio</h1>
              <p>Explore my projects and creative work</p>
            </div>
          </section>
        )}

        {currentSection === 'projects-view' && (
          <ProjectsView 
            projects={projects}
          />
        )}

        {currentSection === 'photography-view' && (
          <PhotographyView 
            photos={photos}
          />
        )}

        {currentSection === 'admin' && (
          <AdminDashboard 
            projects={projects}
            photos={photos}
            onAddProject={addProject}
            onDeleteProject={deleteProject}
            onAddPhoto={addPhoto}
            onDeletePhoto={deletePhoto}
          />
        )}
      </main>
    </div>
  )
}

export default App
