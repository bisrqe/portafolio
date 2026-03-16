import { useState, useEffect } from 'react'
import { db } from './firebase'
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, updateDoc, setDoc } from 'firebase/firestore'
import Navigation from './components/Navigation'
import HomeView from './components/HomeView'
import ProjectsView from './components/ProjectsView'
import PhotographyView from './components/PhotographyView'
import LeadershipView from './components/LeadershipView'
import AuthAdminPage from './components/AuthAdminPage'
import './App.css'

function App() {
  const [currentSection, setCurrentSection] = useState('home')
  const [projects, setProjects] = useState([])
  const [photos, setPhotos] = useState([])
  const [leadership, setLeadership] = useState([])
  const [homeContent, setHomeContent] = useState({})
  const [cvUrl, setCvUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [currentPath, setCurrentPath] = useState(window.location.pathname)

  // Update path on navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Load home content from Firestore
  useEffect(() => {
    if (!db) {
      const saved = localStorage.getItem('portfolio_homeContent')
      if (saved) {
        setHomeContent(JSON.parse(saved))
      }
      const savedCv = localStorage.getItem('portfolio_cvUrl')
      if (savedCv) {
        setCvUrl(savedCv)
      }
      return
    }

    const homeRef = doc(db, 'home', 'content')
    const unsubscribe = onSnapshot(homeRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data()
        console.log('Home content loaded from Firestore:', data)
        setHomeContent(data)
        setCvUrl(data.cvUrl || '')
        localStorage.setItem('portfolio_homeContent', JSON.stringify(data))
        localStorage.setItem('portfolio_cvUrl', data.cvUrl || '')
      } else {
        console.log('Home content document does not exist')
      }
    }, (error) => {
      console.error('Error loading home content:', error)
      const saved = localStorage.getItem('portfolio_homeContent')
      if (saved) {
        console.log('Loading home content from localStorage')
        setHomeContent(JSON.parse(saved))
      }
      const savedCv = localStorage.getItem('portfolio_cvUrl')
      if (savedCv) setCvUrl(savedCv)
    })

    return unsubscribe
  }, [])

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

  // Load leadership from Firestore
  useEffect(() => {
    if (!db) {
      console.error('Firebase not initialized. Using localStorage fallback.')
      const saved = localStorage.getItem('portfolio_leadership')
      if (saved) {
        setLeadership(JSON.parse(saved))
      }
      return
    }

    const leadershipRef = collection(db, 'leadership')
    const unsubscribe = onSnapshot(leadershipRef, (snapshot) => {
      const leadershipList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setLeadership(leadershipList)
      // Also save to localStorage as backup
      localStorage.setItem('portfolio_leadership', JSON.stringify(leadershipList))
    }, (error) => {
      console.error('Error loading leadership from Firebase:', error)
      // Fallback to localStorage if Firebase fails
      const saved = localStorage.getItem('portfolio_leadership')
      if (saved) setLeadership(JSON.parse(saved))
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
        setProjects(projects)
      }
      return
    }

    try {
      await deleteDoc(doc(db, 'projects', id))
      setProjects(prev => prev.filter(p => p.id !== id))
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
        setPhotos(photos)
      }
      return
    }

    try {
      await deleteDoc(doc(db, 'photos', id))
      setPhotos(prev => prev.filter(p => p.id !== id))
    } catch (error) {
      console.error('Error deleting photo:', error)
      alert('Failed to delete photo.')
    }
  }

  const updateProject = async (id, project) => {
    if (!db) {
      console.error('Firebase not initialized. Cannot update to cloud. Using localStorage only.')
      alert('⚠️ Cloud sync unavailable. Updating locally.')
      const existing = localStorage.getItem('portfolio_projects')
      if (existing) {
        const projects = JSON.parse(existing).map(p => p.id === id ? { ...project, id } : p)
        localStorage.setItem('portfolio_projects', JSON.stringify(projects))
      }
      return
    }

    try {
      const projectRef = doc(db, 'projects', id)
      await updateDoc(projectRef, {
        ...project,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error updating project:', error)
      alert('Failed to update project.')
    }
  }

  const updatePhoto = async (id, photo) => {
    if (!db) {
      console.error('Firebase not initialized. Cannot update to cloud. Using localStorage only.')
      alert('⚠️ Cloud sync unavailable. Updating locally.')
      const existing = localStorage.getItem('portfolio_photos')
      if (existing) {
        const photos = JSON.parse(existing).map(p => p.id === id ? { ...photo, id } : p)
        localStorage.setItem('portfolio_photos', JSON.stringify(photos))
      }
      return
    }

    try {
      const photoRef = doc(db, 'photos', id)
      await updateDoc(photoRef, {
        ...photo,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error updating photo:', error)
      alert('Failed to update photo.')
    }
  }

  const addLeadership = async (item) => {
    if (!db) {
      console.error('Firebase not initialized. Cannot add to cloud. Using localStorage only.')
      alert('⚠️ Cloud sync unavailable. Adding locally.')
      const newItem = { ...item, id: Date.now().toString() }
      const existing = localStorage.getItem('portfolio_leadership')
      const items = existing ? JSON.parse(existing) : []
      localStorage.setItem('portfolio_leadership', JSON.stringify([...items, newItem]))
      setLeadership(prev => [...prev, newItem])
      return
    }

    try {
      const docRef = await addDoc(collection(db, 'leadership'), {
        ...item,
        createdAt: new Date()
      })
      setLeadership(prev => [...prev, { ...item, id: docRef.id }])
    } catch (error) {
      console.error('Error adding leadership item:', error)
      alert('Failed to add leadership item.')
    }
  }

  const deleteLeadership = async (id) => {
    if (!db) {
      console.error('Firebase not initialized. Cannot delete from cloud. Using localStorage only.')
      alert('⚠️ Cloud sync unavailable. Deleting locally.')
      const existing = localStorage.getItem('portfolio_leadership')
      if (existing) {
        const items = JSON.parse(existing).filter(item => item.id !== id)
        localStorage.setItem('portfolio_leadership', JSON.stringify(items))
      }
      setLeadership(prev => prev.filter(item => item.id !== id))
      return
    }

    try {
      await deleteDoc(doc(db, 'leadership', id))
      setLeadership(prev => prev.filter(item => item.id !== id))
    } catch (error) {
      console.error('Error deleting leadership item:', error)
      alert('Failed to delete leadership item.')
    }
  }

  const updateLeadership = async (id, item) => {
    if (!db) {
      console.error('Firebase not initialized. Cannot update to cloud. Using localStorage only.')
      alert('⚠️ Cloud sync unavailable. Updating locally.')
      const existing = localStorage.getItem('portfolio_leadership')
      if (existing) {
        const items = JSON.parse(existing).map(i => i.id === id ? { ...item, id } : i)
        localStorage.setItem('portfolio_leadership', JSON.stringify(items))
      }
      return
    }

    try {
      const leadershipRef = doc(db, 'leadership', id)
      await updateDoc(leadershipRef, {
        ...item,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error updating leadership item:', error)
      alert('Failed to update leadership item.')
    }
  }

  const updateHomeContent = async (content) => {
    if (!db) {
      console.error('Firebase not initialized. Cannot update. Using localStorage only.')
      localStorage.setItem('portfolio_homeContent', JSON.stringify(content))
      setHomeContent(content)
      return
    }

    try {
      const homeRef = doc(db, 'home', 'content')
      try {
        // Try to update existing document
        await updateDoc(homeRef, {
          ...content,
          updatedAt: new Date()
        })
        console.log('Home content updated successfully')
      } catch (updateError) {
        // If document doesn't exist, create it
        if (updateError.code === 'not-found') {
          console.log('Document not found, creating new document')
          await setDoc(homeRef, {
            ...content,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          console.log('Home content document created successfully')
        } else {
          throw updateError
        }
      }
      // Update local state after successful Firestore update
      setHomeContent(content)
    } catch (error) {
      console.error('Error updating home content:', error)
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      // Still update local state and localStorage as fallback
      localStorage.setItem('portfolio_homeContent', JSON.stringify(content))
      setHomeContent(content)
      throw error
    }
  }

  const updateCvUrl = async (url) => {
    if (!db) {
      console.log('Firebase not initialized. Saving CV URL to localStorage only.')
      localStorage.setItem('portfolio_cvUrl', url)
      setCvUrl(url)
      return
    }

    try {
      const homeRef = doc(db, 'home', 'content')
      try {
        // Try to update existing document
        await updateDoc(homeRef, {
          cvUrl: url,
          updatedAt: new Date()
        })
        console.log('CV URL updated in Firestore')
      } catch (updateError) {
        // If document doesn't exist, create it with CV URL
        if (updateError.code === 'not-found') {
          console.log('Home document not found, creating with CV URL')
          await setDoc(homeRef, {
            cvUrl: url,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          console.log('Home document created with CV URL')
        } else {
          throw updateError
        }
      }
      // Update local state after successful Firestore update
      setCvUrl(url)
      localStorage.setItem('portfolio_cvUrl', url)
    } catch (error) {
      console.error('Error updating CV URL:', error)
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      // Still update local state and localStorage as fallback
      localStorage.setItem('portfolio_cvUrl', url)
      setCvUrl(url)
      throw error
    }
  }

  if (isLoading) {
    return <div className="app"><div style={{ color: 'white', textAlign: 'center', paddingTop: '50px' }}>Loading...</div></div>
  }

  // Check if we're on the admin auth page
  if (currentPath === '/admin') {
    return (
      <div className="app">
        <AuthAdminPage 
          projects={projects}
          photos={photos}
          leadership={leadership}
          homeContent={homeContent}
          cvUrl={cvUrl}
          onAddProject={addProject}
          onDeleteProject={deleteProject}
          onAddPhoto={addPhoto}
          onDeletePhoto={deletePhoto}
          onUpdateProject={updateProject}
          onUpdatePhoto={updatePhoto}
          onAddLeadership={addLeadership}
          onDeleteLeadership={deleteLeadership}
          onUpdateLeadership={updateLeadership}
          onUpdateHomeContent={updateHomeContent}
          onUpdateCvUrl={updateCvUrl}
        />
      </div>
    )
  }

  return (
    <div className="app">
      <Navigation currentPath={currentPath} />
      
      <main className="main-content">
        {currentPath === '/' && (
          <HomeView 
            homeContent={homeContent}
            cvUrl={cvUrl}
          />
        )}

        {currentPath === '/professional-projects' && (
          <ProjectsView 
            projects={projects}
          />
        )}

        {currentPath === '/leadership' && (
          <LeadershipView 
            leadership={leadership}
          />
        )}

        {currentPath === '/photography-portfolio' && (
          <PhotographyView 
            photos={photos}
          />
        )}
      </main>
    </div>
  )
}

export default App
