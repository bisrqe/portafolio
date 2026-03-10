import { useState, useEffect } from 'react'
import { db } from './firebase'
import { collection, addDoc, deleteDoc, doc, onSnapshot, query } from 'firebase/firestore'
import Navigation from './components/Navigation'
import ProjectManager from './components/ProjectManager'
import PhotographyPortfolio from './components/PhotographyPortfolio'
import './App.css'

function App() {
  const [currentSection, setCurrentSection] = useState('home')
  const [projects, setProjects] = useState([])
  const [photos, setPhotos] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Load projects from Firestore
  useEffect(() => {
    const projectsRef = collection(db, 'projects')
    const unsubscribe = onSnapshot(projectsRef, (snapshot) => {
      const projectsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setProjects(projectsList)
    }, (error) => {
      console.error('Error loading projects:', error)
      // Fallback to localStorage if Firebase fails
      const saved = localStorage.getItem('portfolio_projects')
      if (saved) setProjects(JSON.parse(saved))
    })

    return unsubscribe
  }, [])

  // Load photos from Firestore
  useEffect(() => {
    const photosRef = collection(db, 'photos')
    const unsubscribe = onSnapshot(photosRef, (snapshot) => {
      const photosList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setPhotos(photosList)
      setIsLoading(false)
    }, (error) => {
      console.error('Error loading photos:', error)
      // Fallback to localStorage if Firebase fails
      const saved = localStorage.getItem('portfolio_photos')
      if (saved) setPhotos(JSON.parse(saved))
      setIsLoading(false)
    })

    return unsubscribe
  }, [])

  const addProject = async (project) => {
    try {
      const projectsRef = collection(db, 'projects')
      await addDoc(projectsRef, {
        ...project,
        createdAt: new Date()
      })
    } catch (error) {
      console.error('Error adding project:', error)
      alert('Failed to save project. Check console for details.')
    }
  }

  const deleteProject = async (id) => {
    try {
      await deleteDoc(doc(db, 'projects', id))
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Failed to delete project.')
    }
  }

  const addPhoto = async (photo) => {
    try {
      const photosRef = collection(db, 'photos')
      await addDoc(photosRef, {
        ...photo,
        createdAt: new Date()
      })
    } catch (error) {
      console.error('Error adding photo:', error)
      alert('Failed to save photo. Check console for details.')
    }
  }

  const deletePhoto = async (id) => {
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

        {currentSection === 'projects' && (
          <ProjectManager 
            projects={projects} 
            onAdd={addProject}
            onDelete={deleteProject}
          />
        )}

        {currentSection === 'photography' && (
          <PhotographyPortfolio 
            photos={photos}
            onAdd={addPhoto}
            onDelete={deletePhoto}
          />
        )}
      </main>
    </div>
  )
}

export default App
