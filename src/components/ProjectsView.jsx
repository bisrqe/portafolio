import { useState, useMemo } from 'react'
import './ProjectsView.css'

function ProjectsView({ projects }) {
  const [activeTag, setActiveTag] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState({})

  // Extract unique tags from all projects
  const allTags = useMemo(() => {
    const tags = new Set()
    projects.forEach(project => {
      if (project.tags && Array.isArray(project.tags)) {
        project.tags.forEach(tag => tags.add(tag))
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
            const images = project.images || (project.image ? [project.image] : [])
            const currentIdx = currentImageIndex[project.id] || 0
            const currentImage = images[currentIdx] || 'https://via.placeholder.com/300x200?text=Project'
            
            // Separate featured tags and remaining tags
            const featuredTags = project.featuredTags || []
            const remainingTags = project.tags?.filter(tag => !featuredTags.includes(tag)) || []
            
            return (
            <div key={project.id} className="project-card">
              <div className="project-image">
                <img src={currentImage} alt={project.title} />
                {images.length > 1 && (
                  <div className="carousel-controls">
                    <button 
                      className="carousel-btn"
                      onClick={() => setCurrentImageIndex(prev => ({
                        ...prev,
                        [project.id]: (currentIdx - 1 + images.length) % images.length
                      }))}
                    >
                      ‹
                    </button>
                    <span className="carousel-indicator">{currentIdx + 1}/{images.length}</span>
                    <button 
                      className="carousel-btn"
                      onClick={() => setCurrentImageIndex(prev => ({
                        ...prev,
                        [project.id]: (currentIdx + 1) % images.length
                      }))}
                    >
                      ›
                    </button>
                  </div>
                )}
              </div>
              <div className="project-content">
                <h3>{project.title}</h3>
                <p className="description-text">{project.description?.split('\n').map((line, idx) => (
                  <span key={idx}>
                    {line}
                    <br />
                  </span>
                ))}</p>
                {(featuredTags.length > 0 || remainingTags.length > 0) && (
                  <div className="tags-section">
                    {featuredTags.length > 0 && (
                      <div className="tags featured-tags">
                        {featuredTags.map((tag, idx) => (
                          <span key={idx} className="tag featured">{tag}</span>
                        ))}
                      </div>
                    )}
                    {remainingTags.length > 0 && (
                      <div className="tags">
                        {remainingTags.map((tag, idx) => (
                          <span key={idx} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}
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
