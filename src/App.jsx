import { useState } from 'react'
import Navigation from './components/Navigation'
import ProjectManager from './components/ProjectManager'
import PhotographyPortfolio from './components/PhotographyPortfolio'
import './App.css'

function App() {
  const [currentSection, setCurrentSection] = useState('home')
  const [projects, setProjects] = useState([
    {
      id: 1,
      title: 'Project 1',
      description: 'A brief description of your project',
      link: '#',
      image: 'https://via.placeholder.com/300x200?text=Project+1'
    }
  ])
  const [photos, setPhotos] = useState([
    {
      id: 1,
      title: 'Photo 1',
      image: 'https://via.placeholder.com/300x300?text=Photo+1',
      description: 'Photography description'
    }
  ])

  const addProject = (project) => {
    setProjects([...projects, { ...project, id: Date.now() }])
  }

  const deleteProject = (id) => {
    setProjects(projects.filter(p => p.id !== id))
  }

  const addPhoto = (photo) => {
    setPhotos([...photos, { ...photo, id: Date.now() }])
  }

  const deletePhoto = (id) => {
    setPhotos(photos.filter(p => p.id !== id))
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
