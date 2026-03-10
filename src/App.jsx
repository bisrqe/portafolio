import { useState, useEffect } from 'react'
import Navigation from './components/Navigation'
import ProjectManager from './components/ProjectManager'
import PhotographyPortfolio from './components/PhotographyPortfolio'
import './App.css'

function App() {
  const [currentSection, setCurrentSection] = useState('home')
  const [projects, setProjects] = useState([])
  const [photos, setPhotos] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem('portfolio_projects')
    const savedPhotos = localStorage.getItem('portfolio_photos')

    if (savedProjects) {
      setProjects(JSON.parse(savedProjects))
    } else {
      // Default sample data if nothing saved
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

    if (savedPhotos) {
      setPhotos(JSON.parse(savedPhotos))
    } else {
      // Default sample data if nothing saved
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
  }, [])

  const addProject = (project) => {
    const newProjects = [...projects, { ...project, id: Date.now() }]
    setProjects(newProjects)
    localStorage.setItem('portfolio_projects', JSON.stringify(newProjects))
  }

  const deleteProject = (id) => {
    const updatedProjects = projects.filter(p => p.id !== id)
    setProjects(updatedProjects)
    localStorage.setItem('portfolio_projects', JSON.stringify(updatedProjects))
  }

  const addPhoto = (photo) => {
    const newPhotos = [...photos, { ...photo, id: Date.now() }]
    setPhotos(newPhotos)
    localStorage.setItem('portfolio_photos', JSON.stringify(newPhotos))
  }

  const deletePhoto = (id) => {
    const updatedPhotos = photos.filter(p => p.id !== id)
    setPhotos(updatedPhotos)
    localStorage.setItem('portfolio_photos', JSON.stringify(updatedPhotos))
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
