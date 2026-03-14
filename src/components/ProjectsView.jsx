import { useState, useMemo } from 'react'
import './ProjectsView.css'

function ProjectsView({ projects }) {
  const [activeTag, setActiveTag] = useState(null)

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
        <h2>My Projects</h2>
        <p>Explore my latest work and projects</p>
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

      <div className="projects-grid">
        {filteredProjects.length === 0 ? (
          <div className="empty-state">
            <p>{activeTag ? `No projects found with tag "${activeTag}".` : 'No projects yet.'}</p>
          </div>
        ) : (
          filteredProjects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-image">
                <img src={project.image || 'https://via.placeholder.com/300x200?text=Project'} alt={project.title} />
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
          ))
        )}
      </div>
    </section>
  )
}

export default ProjectsView
