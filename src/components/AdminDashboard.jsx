import { useState, useEffect } from 'react'
import CloudinaryUpload from './CloudinaryUpload'
import AdminAuth from './AdminAuth'
import './AdminDashboard.css'

function AdminDashboard({ projects, photos, onAddProject, onDeleteProject, onAddPhoto, onDeletePhoto }) {
  const [activeTab, setActiveTab] = useState('projects')
  const [isAdmin, setIsAdmin] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    link: '',
    image: ''
  })
  const [photoForm, setPhotoForm] = useState({
    title: '',
    description: '',
    image: '',
    category: 'photography'
  })

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('portfolio_admin_token')
    if (token) {
      setIsAdmin(true)
    }
  }, [])

  // Project handlers
  const handleProjectInputChange = (e) => {
    const { name, value } = e.target
    setProjectForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleProjectSubmit = (e) => {
    e.preventDefault()
    if (projectForm.title.trim()) {
      onAddProject(projectForm)
      setProjectForm({ title: '', description: '', link: '', image: '' })
      setShowForm(false)
    }
  }

  const handleProjectUploadSuccess = (uploadData) => {
    setProjectForm(prev => ({
      ...prev,
      image: uploadData.url
    }))
  }

  // Photo handlers
  const handlePhotoInputChange = (e) => {
    const { name, value } = e.target
    setPhotoForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePhotoSubmit = (e) => {
    e.preventDefault()
    if (photoForm.image.trim()) {
      onAddPhoto(photoForm)
      setPhotoForm({ title: '', description: '', image: '', category: 'photography' })
      setShowForm(false)
    }
  }

  const handlePhotoUploadSuccess = (uploadData) => {
    setPhotoForm(prev => ({
      ...prev,
      image: uploadData.url
    }))
  }

  return (
    <>
      {!isAdmin && <AdminAuth onLoginSuccess={() => setIsAdmin(true)} />}
      
      {isAdmin && (
        <section className="admin-dashboard-section">
          <div className="dashboard-header">
            <div className="header-title">
              <h2>Admin Dashboard</h2>
              <p>Manage your portfolio content</p>
            </div>
            <button
              className="btn-logout-admin"
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

          {/* Tabs */}
          <div className="admin-tabs">
            <button
              className={`tab-button ${activeTab === 'projects' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('projects')
                setShowForm(false)
              }}
            >
              📁 Projects ({projects.length})
            </button>
            <button
              className={`tab-button ${activeTab === 'photography' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('photography')
                setShowForm(false)
              }}
            >
              📷 Photography ({photos.length})
            </button>
          </div>

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className="admin-content">
              <div className="admin-header">
                <h3>My Projects</h3>
                <button 
                  className="btn-add-admin"
                  onClick={() => setShowForm(!showForm)}
                >
                  {showForm ? '✕ Cancel' : '+ Add Project'}
                </button>
              </div>

              {showForm && (
                <form className="admin-form" onSubmit={handleProjectSubmit}>
                  <div className="form-group">
                    <label>Project Title *</label>
                    <input
                      type="text"
                      name="title"
                      placeholder="Enter project title"
                      value={projectForm.title}
                      onChange={handleProjectInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      placeholder="Project description"
                      value={projectForm.description}
                      onChange={handleProjectInputChange}
                      rows="4"
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label>Project Link</label>
                    <input
                      type="url"
                      name="link"
                      placeholder="https://..."
                      value={projectForm.link}
                      onChange={handleProjectInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Image URL</label>
                    <input
                      type="url"
                      name="image"
                      placeholder="https://..."
                      value={projectForm.image}
                      onChange={handleProjectInputChange}
                    />
                    <div className="form-divider">or</div>
                    <CloudinaryUpload onUploadSuccess={handleProjectUploadSuccess} />
                  </div>

                  <button type="submit" className="btn-submit-admin">Save Project</button>
                </form>
              )}

              <div className="admin-grid">
                {projects.length === 0 ? (
                  <div className="empty-admin-state">
                    <p>No projects yet. Create your first one!</p>
                  </div>
                ) : (
                  projects.map(project => (
                    <div key={project.id} className="admin-item project-item">
                      <div className="item-image">
                        <img src={project.image || 'https://via.placeholder.com/200x150?text=Project'} alt={project.title} />
                      </div>
                      <div className="item-info">
                        <h4>{project.title}</h4>
                        <p className="truncate">{project.description}</p>
                        {project.link && (
                          <a href={project.link} target="_blank" rel="noopener noreferrer" className="item-link">
                            Go to project →
                          </a>
                        )}
                      </div>
                      <button 
                        className="btn-delete-admin"
                        onClick={() => {
                          if (confirm('Delete this project?')) {
                            onDeleteProject(project.id)
                          }
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Photography Tab */}
          {activeTab === 'photography' && (
            <div className="admin-content">
              <div className="admin-header">
                <h3>Photography & Videography</h3>
                <button 
                  className="btn-add-admin"
                  onClick={() => setShowForm(!showForm)}
                >
                  {showForm ? '✕ Cancel' : '+ Add Work'}
                </button>
              </div>

              {showForm && (
                <form className="admin-form" onSubmit={handlePhotoSubmit}>
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      name="title"
                      placeholder="Photo/video title (optional)"
                      value={photoForm.title}
                      onChange={handlePhotoInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      placeholder="Photo/video description"
                      value={photoForm.description}
                      onChange={handlePhotoInputChange}
                      rows="4"
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <select
                      name="category"
                      value={photoForm.category}
                      onChange={handlePhotoInputChange}
                    >
                      <option value="photography">Photography</option>
                      <option value="videography">Videography</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Image/Thumbnail URL *</label>
                    <input
                      type="url"
                      name="image"
                      placeholder="https://..."
                      value={photoForm.image}
                      onChange={handlePhotoInputChange}
                      required
                    />
                    <div className="form-divider">or</div>
                    <CloudinaryUpload onUploadSuccess={handlePhotoUploadSuccess} />
                  </div>

                  <button type="submit" className="btn-submit-admin">Save Work</button>
                </form>
              )}

              <div className="admin-gallery">
                {photos.length === 0 ? (
                  <div className="empty-admin-state">
                    <p>No photography yet. Upload your creative work!</p>
                  </div>
                ) : (
                  photos.map(photo => (
                    <div key={photo.id} className="admin-photo">
                      <div className="photo-image">
                        <img src={photo.image} alt={photo.title || 'Photography'} />
                      </div>
                      <div className="photo-info">
                        <h4>{photo.title || 'Untitled'}</h4>
                        <span className="photo-category">{photo.category}</span>
                        {photo.description && <p className="truncate">{photo.description}</p>}
                      </div>
                      <button 
                        className="btn-delete-admin"
                        onClick={() => {
                          if (confirm('Delete this work?')) {
                            onDeletePhoto(photo.id)
                          }
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </section>
      )}
    </>
  )
}

export default AdminDashboard
