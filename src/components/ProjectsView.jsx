import { useState, useMemo } from 'react'
import './ProjectsView.css'

function ProjectsView({ projects }) {
  const [activeTag, setActiveTag] = useState(null)
  const [imageIndices, setImageIndices] = useState({})
  const visibleTags = ['Simulation', 'Professional Experience', 'Student Groups', 'Personal Projects', 'Hackathons']

  const handleImageNavigation = (projectId, direction) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return
    
    const images = Array.isArray(project.images) ? project.images : [project.image].filter(Boolean)
    if (images.length === 0) return
    
    const currentIndex = imageIndices[projectId] || 0
    const newIndex = direction === 'next'
      ? (currentIndex + 1) % images.length
      : (currentIndex - 1 + images.length) % images.length
    
    setImageIndices(prev => ({ ...prev, [projectId]: newIndex }))
  }

  const getProjectImage = (project) => {
    const images = Array.isArray(project.images) ? project.images : [project.image].filter(Boolean)
    if (images.length === 0) return 'https://via.placeholder.com/300x200?text=Project'
    const index = imageIndices[project.id] || 0
    return images[index]
  }

  const getProjectImageCount = (project) => {
    const images = Array.isArray(project.images) ? project.images : [project.image].filter(Boolean)
    return images.length
  }

  // Extract unique tags from all projects
  const allTags = useMemo(() => {
  const tags = new Set()

  projects.forEach(project => {
    if (project.tags && Array.isArray(project.tags)) {
    project.tags.forEach(tag => {
        if (!visibleTags || visibleTags.includes(tag)) {
        tags.add(tag)
        }
    })
    }
    })

    return Array.from(tags).sort()
    }, [projects])

  // Filter projects by selected tag
  const filteredProjects = useMemo(() => {
    let filtered = !activeTag ? projects : projects.filter(project => 
      project.tags && project.tags.includes(activeTag)
    )
    
    // Sort by date (newest first)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.date || '1970-01-01')
      const dateB = new Date(b.date || '1970-01-01')
      return dateB - dateA
    })
  }, [projects, activeTag])

  return (
    <section className="projects-view-section">
      <div className="view-header">
        <h2>Professional Projects</h2>
        <p>Explore my latest work and projects I've worked on</p>
      </div>

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <div className="tag-filter-container">
          <button 
            className={`tag-btn ${!activeTag ? 'active' : ''}`}
            onClick={() => setActiveTag(null)}
          >
            All
          </button>
          {allTags.map(tag => (
            <button 
              key={tag}
              className={`tag-btn ${activeTag === tag ? 'active' : ''}`}
              onClick={() => setActiveTag(tag)}
            >
              {tag.charAt(0).toUpperCase() + tag.slice(1)}
            </button>
          ))}
        </div>
      )}

      <div className="projects-list">
        {filteredProjects.length === 0 ? (
          <div className="empty-state">
            <p>{activeTag ? `No projects found with tag "${activeTag}".` : 'No projects yet.'}</p>
          </div>
        ) : (
          filteredProjects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-image-container">
                <div className="project-image">
                  <img src={getProjectImage(project)} alt={project.title} />
                </div>
                {getProjectImageCount(project) > 1 && (
                  <>
                    <button 
                      className="carousel-nav carousel-prev"
                      onClick={() => handleImageNavigation(project.id, 'prev')}
                      title="Previous image"
                    >
                      ‹
                    </button>
                    <button 
                      className="carousel-nav carousel-next"
                      onClick={() => handleImageNavigation(project.id, 'next')}
                      title="Next image"
                    >
                      ›
                    </button>
                    <div className="carousel-counter">
                      {(imageIndices[project.id] || 0) + 1} / {getProjectImageCount(project)}
                    </div>
                  </>
                )}
              </div>
              <div className="project-content">
                <h3>{project.title}</h3>
                {project.date && (
                  <p className="project-date">{new Date(project.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                )}
                <p>{project.description}</p>
                {project.tags && project.tags.length > 0 && (
                  <div className="tags">
                    {project.tags.map((tag, idx) => (
                      <span key={idx} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="project-actions">
                  {project.link && (
                    <a href={project.link} target="_blank" rel="noopener noreferrer" className="btn-link">
                      View Project →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}

export default ProjectsView
