import { useState, useMemo } from 'react'
import './ProjectsView.css'

function ProjectsView({ projects }) {
  const [activeTag, setActiveTag] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState({})
  const visibleTags = ['Simulation', 'Professional Experience', 'Student Groups', 'Personal Projects', 'Hackathons']

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
            const images = (project.images && Array.isArray(project.images) && project.images.length > 0) 
              ? project.images 
              : (project.image ? [project.image] : ['https://via.placeholder.com/300x200?text=Project'])
            const currentIdx = currentImageIndex[project.id] || 0
            const currentImage = images[currentIdx]
            
            return (
            <div key={project.id} className="project-card">
              <div className="project-image-container">
                <div className="project-image">
                  <img src={currentImage} alt={project.title} />
                </div>
                {images.length > 1 && (
                  <>
                    <button
                      className="carousel-btn carousel-prev"
                      onClick={() => setCurrentImageIndex(prev => ({
                        ...prev,
                        [project.id]: (currentIdx - 1 + images.length) % images.length
                      }))}
                      aria-label="Previous image"
                    >
                      ❮
                    </button>
                    <button
                      className="carousel-btn carousel-next"
                      onClick={() => setCurrentImageIndex(prev => ({
                        ...prev,
                        [project.id]: (currentIdx + 1) % images.length
                      }))}
                      aria-label="Next image"
                    >
                      ❯
                    </button>
                    <div className="carousel-indicators">
                      {images.map((_, idx) => (
                        <button
                          key={idx}
                          className={`indicator ${idx === currentIdx ? 'active' : ''}`}
                          onClick={() => setCurrentImageIndex(prev => ({ ...prev, [project.id]: idx }))}
                          aria-label={`Image ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="project-content">
                <h3>{project.title}</h3>
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
            )
          })
        )}
      </div>
    </section>
  )
}

export default ProjectsView
