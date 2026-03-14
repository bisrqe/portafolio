import { useState, useEffect } from 'react'
import CloudinaryUpload from './CloudinaryUpload'
import AdminAuth from './AdminAuth'
import './ProjectManager.css'

function ProjectManager({ projects, onAdd, onDelete }) {
  const [showForm, setShowForm] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    image: ''
  })

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('portfolio_admin_token')
    if (token) {
      setIsAdmin(true)
    }
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.title.trim()) {
      onAdd(formData)
      setFormData({ title: '', description: '', link: '', image: '' })
      setShowForm(false)
    }
  }

  const handleUploadSuccess = (uploadData) => {
    setFormData(prev => ({
      ...prev,
      image: uploadData.url
    }))
  }

  return (
    <>
      {!isAdmin && <AdminAuth onLoginSuccess={() => setIsAdmin(true)} />}
      
      {isAdmin && (
        <section className="projects-section">
          <div className="section-header">
            <h2>Professional Projects</h2>
            <div className="header-buttons">
              <button 
                className="btn-add"
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? '✕ Cancel' : '+ Add Project'}
              </button>
              <button
                className="btn-logout"
                onClick={() => {
                  localStorage.removeItem('portfolio_admin_token')
                  setIsAdmin(false)
                  setShowForm(false)
                }}
                title="Logout admin access"
              >
                🔓 Logout
              </button>
            </div>
          </div>

          {showForm && (
        <form className="project-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="title"
              placeholder="Project Title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <textarea
              name="description"
              placeholder="Project Description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
            ></textarea>
          </div>

          <div className="form-group">
            <input
              type="url"
              name="link"
              placeholder="Project Link (https://...)"
              value={formData.link}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <input
              type="url"
              name="image"
              placeholder="Image URL"
              value={formData.image}
              onChange={handleInputChange}
            />
            <div className="form-divider">or</div>
            <CloudinaryUpload onUploadSuccess={handleUploadSuccess} />
          </div>

          <button type="submit" className="btn-submit">Save Project</button>
        </form>
      )}

      <div className="projects-grid">
        {projects.length === 0 ? (
          <div className="empty-state">
            <p>No projects yet. Add one to get started!</p>
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
                      View Project
                    </a>
                  )}
                  <button 
                    className="btn-delete"
                    onClick={() => onDelete(project.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
        </section>
      )}
    </>
  )
}

export default ProjectManager
