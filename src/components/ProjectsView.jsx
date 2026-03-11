import './ProjectsView.css'

function ProjectsView({ projects }) {
  return (
    <section className="projects-view-section">
      <div className="view-header">
        <h2>My Projects</h2>
        <p>Explore my latest work and projects</p>
      </div>

      <div className="projects-grid">
        {projects.length === 0 ? (
          <div className="empty-state">
            <p>No projects yet.</p>
          </div>
        ) : (
          projects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-image">
                <img src={project.image || 'https://via.placeholder.com/300x200?text=Project'} alt={project.title} />
              </div>
              <div className="project-content">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
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
