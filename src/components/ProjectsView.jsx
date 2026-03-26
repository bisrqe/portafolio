import { useState, useMemo, useEffect } from 'react'
import './ProjectsView.css'

function ProjectsView({ projects }) {
  const [activeTag, setActiveTag] = useState(null)
  const [visibleTags, setVisibleTags] = useState([])
  const [carouselIndices, setCarouselIndices] = useState({})
  const [expandedImage, setExpandedImage] = useState(null)

  // Load visible tags from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('portfolio_visible_tags_projects')
    if (saved) {
      try {
        setVisibleTags(JSON.parse(saved))
      } catch (e) {
        // Fallback to default
        setVisibleTags(['Simulation', 'Professional Experience', 'Student Groups', 'Personal Projects', 'Hackathons'])
      }
    } else {
      // Set default tags on first load
      setVisibleTags(['Simulation', 'Professional Experience', 'Student Groups', 'Personal Projects', 'Hackathons'])
    }
  }, [])

  // Handle escape key to close expanded image
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setExpandedImage(null)
      }
    }
    if (expandedImage) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [expandedImage])

  // Helper to get images for a project (supports both single image and images array)
  const getProjectImages = (project) => {
    if (project.images && Array.isArray(project.images) && project.images.length > 0) {
      return project.images
    }
    return project.image ? [project.image] : []
  }

  // Carousel navigation
  const nextImage = (projectId) => {
    const project = projects.find(p => p.id === projectId)
    const images = getProjectImages(project)
    if (images.length <= 1) return
    
    setCarouselIndices(prev => ({
      ...prev,
      [projectId]: ((prev[projectId] || 0) + 1) % images.length
    }))
  }

  const prevImage = (projectId) => {
    const project = projects.find(p => p.id === projectId)
    const images = getProjectImages(project)
    if (images.length <= 1) return

    setCarouselIndices(prev => ({
      ...prev,
      [projectId]: (prev[projectId] || 0) === 0 ? images.length - 1 : (prev[projectId] || 0) - 1
    }))
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
    if (!activeTag) return projects
    return projects.filter(project => 
      project.tags && project.tags.includes(activeTag)
    )
  }, [projects, activeTag])

  return (
    <>
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
          filteredProjects.map(project => {
            const images = getProjectImages(project)
            const currentIndex = carouselIndices[project.id] || 0
            const hasMultipleImages = images.length > 1

            return (
            <div key={project.id} className="project-card">
              <div className="project-image-container">
                <div className="project-image" onClick={() => setExpandedImage(images[currentIndex])} style={{ cursor: 'pointer' }}>
                  <img 
                    src={images[currentIndex]} 
                    alt={project.title}
                    style={{
                      transform: `translate(${project.positionX || 0}%, ${project.positionY || 0}%) scale(${project.zoom || 1})`
                    }}
                  />
                </div>
                
                {/* Carousel Controls */}
                {hasMultipleImages && (
                  <>
                    <button 
                      className="carousel-btn carousel-prev"
                      onClick={() => prevImage(project.id)}
                      title="Previous image"
                    >
                      ‹
                    </button>
                    <button 
                      className="carousel-btn carousel-next"
                      onClick={() => nextImage(project.id)}
                      title="Next image"
                    >
                      ›
                    </button>
                    
                    {/* Carousel Indicators */}
                    <div className="carousel-indicators">
                      {images.map((_, idx) => (
                        <button
                          key={idx}
                          className={`carousel-dot ${idx === currentIndex ? 'active' : ''}`}
                          onClick={() => setCarouselIndices(prev => ({ ...prev, [project.id]: idx }))}
                          title={`Go to image ${idx + 1}`}
                          aria-label={`Image ${idx + 1}`}
                        />
                      ))}
                    </div>

                    {/* Image Counter */}
                    <div className="carousel-counter">
                      {currentIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>
              <div className="project-content">
                <h3>{project.title}</h3>
                <p className="project-description">{project.description}</p>
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
            )
          })
        )}
      </div>
    </section>

    {expandedImage && (
      <div 
        className="image-modal-overlay"
        onClick={() => setExpandedImage(null)}
      >
        <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
          <button 
            className="image-modal-close"
            onClick={() => setExpandedImage(null)}
            title="Close (or press Escape)"
          >
            ✕
          </button>
          <img 
            src={expandedImage} 
            alt="Expanded view"
            className="image-modal-image"
          />
        </div>
      </div>
    )}
    </>
  )
}

export default ProjectsView
