import { useState, useEffect } from 'react'
import CloudinaryUpload from './CloudinaryUpload'
import AdminAuth from './AdminAuth'
import './AdminDashboard.css'

function AdminDashboard({ projects, photos, onAddProject, onDeleteProject, onAddPhoto, onDeletePhoto, onUpdateProject, onUpdatePhoto, onExit }) {
  const [activeTab, setActiveTab] = useState('projects')
  const [isAdmin, setIsAdmin] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [editingPhoto, setEditingPhoto] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
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
    category: 'photography',
    label: '',
    positionX: 0,
    positionY: 0
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
      if (editingProject) {
        // Update existing project
        if (onUpdateProject) {
          onUpdateProject(editingProject.id, projectForm)
        }
        setEditingProject(null)
      } else {
        // Add new project
        onAddProject(projectForm)
      }
      setProjectForm({ title: '', description: '', link: '', image: '' })
      setShowForm(false)
    }
  }

  const handleEditProject = (project) => {
    setEditingProject(project)
    setProjectForm({
      title: project.title,
      description: project.description,
      link: project.link,
      image: project.image
    })
    setShowForm(true)
  }

  const handleCancelEdit = () => {
    setEditingProject(null)
    setProjectForm({ title: '', description: '', link: '', image: '' })
    setShowForm(false)
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
      if (editingPhoto) {
        // Update existing photo
        if (onUpdatePhoto) {
          onUpdatePhoto(editingPhoto.id, photoForm)
        }
        setEditingPhoto(null)
      } else {
        // Add new photo
        onAddPhoto(photoForm)
      }
      setPhotoForm({ title: '', description: '', image: '', category: 'photography', label: '', positionX: 0, positionY: 0 })
      setShowForm(false)
    }
  }

  const handleEditPhoto = (photo) => {
    setEditingPhoto(photo)
    setPhotoForm({
      title: photo.title,
      description: photo.description,
      image: photo.image,
      category: photo.category,
      label: photo.label || '',
      positionX: photo.positionX || 0,
      positionY: photo.positionY || 0
    })
    setShowForm(true)
  }

  const handleCancelPhotoEdit = () => {
    setEditingPhoto(null)
    setPhotoForm({ title: '', description: '', image: '', category: 'photography', label: '', positionX: 0, positionY: 0 })
    setShowForm(false)
  }

  const handlePhotoUploadSuccess = (uploadData) => {
    setPhotoForm(prev => ({
      ...prev,
      image: uploadData.url
    }))
  }

  const handleExit = () => {
    localStorage.removeItem('portfolio_admin_token')
    setIsAdmin(false)
    setShowForm(false)
    setEditingProject(null)
    setEditingPhoto(null)
    if (onExit) {
      onExit()
    }
  }

  const handlePreviewMouseDown = (e) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handlePreviewMouseMove = (e) => {
    if (!isDragging) return

    const deltaX = (e.clientX - dragStart.x) * 0.15
    const deltaY = (e.clientY - dragStart.y) * 0.15

    const newX = Math.max(-100, Math.min(100, (photoForm.positionX || 0) + deltaX))
    const newY = Math.max(-100, Math.min(100, (photoForm.positionY || 0) + deltaY))

    setPhotoForm(prev => ({
      ...prev,
      positionX: Math.round(newX),
      positionY: Math.round(newY)
    }))

    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handlePreviewMouseUp = () => {
    setIsDragging(false)
  }

  const resetPosition = () => {
    setPhotoForm(prev => ({
      ...prev,
      positionX: 0,
      positionY: 0
    }))
  }

  return (
    <>
      {!isAdmin && <AdminAuth onLoginSuccess={() => setIsAdmin(true)} onExit={onExit} />}
      
      {isAdmin && (
        <section className="admin-dashboard-section">
          <div className="dashboard-header">
            <div className="header-title">
              <h2>Admin Dashboard</h2>
              <p>Manage your portfolio content</p>
            </div>
            <button
              className="btn-logout-admin"
              onClick={handleExit}
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
                  onClick={() => {
                    if (editingProject) {
                      handleCancelEdit()
                    } else {
                      setShowForm(!showForm)
                    }
                  }}
                >
                  {editingProject ? '✕ Cancel Edit' : (showForm ? '✕ Cancel' : '+ Add Project')}
                </button>
              </div>

              {showForm && (
                <form className="admin-form" onSubmit={handleProjectSubmit}>
                  <div className="form-group">
                    <label>{editingProject ? 'Update Project Title' : 'Project Title'} *</label>
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

                  <button type="submit" className="btn-submit-admin">
                    {editingProject ? 'Save Changes' : 'Save Project'}
                  </button>
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
                      <div className="item-actions">
                        <button 
                          className="btn-edit-admin"
                          onClick={() => handleEditProject(project)}
                          title="Edit project"
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn-delete-admin"
                          onClick={() => {
                            if (confirm('Delete this project?')) {
                              onDeleteProject(project.id)
                            }
                          }}
                          title="Delete project"
                        >
                          🗑️
                        </button>
                      </div>
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
                  onClick={() => {
                    if (editingPhoto) {
                      handleCancelPhotoEdit()
                    } else {
                      setShowForm(!showForm)
                    }
                  }}
                >
                  {editingPhoto ? '✕ Cancel Edit' : (showForm ? '✕ Cancel' : '+ Add Work')}
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
                    <label>Subcategory / Label</label>
                    <input
                      type="text"
                      name="label"
                      placeholder="e.g., Portraits, Nature, Events, etc."
                      value={photoForm.label}
                      onChange={handlePhotoInputChange}
                    />
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

                  {photoForm.image && (
                    <div className="form-group">
                      <label>Image Position</label>
                      <div className="position-preview">
                        <div 
                          className={`preview-container ${isDragging ? 'dragging' : ''}`}
                          onMouseDown={handlePreviewMouseDown}
                          onMouseMove={handlePreviewMouseMove}
                          onMouseUp={handlePreviewMouseUp}
                          onMouseLeave={handlePreviewMouseUp}
                        >
                          <img 
                            src={photoForm.image} 
                            alt="Preview" 
                            className="preview-image"
                            style={{
                              transform: `translate(${photoForm.positionX || 0}%, ${photoForm.positionY || 0}%)`,
                              cursor: isDragging ? 'grabbing' : 'grab'
                            }}
                            draggable={false}
                          />
                          <div className="position-overlay">
                            X: {photoForm.positionX || 0}% | Y: {photoForm.positionY || 0}%
                          </div>
                        </div>
                        <small>Drag the image to position it (X: {photoForm.positionX || 0}%, Y: {photoForm.positionY || 0}%)</small>
                        <button 
                          type="button"
                          className="btn-reset-position"
                          onClick={resetPosition}
                        >
                          ↺ Reset Position
                        </button>
                      </div>
                    </div>
                  )}

                  <button type="submit" className="btn-submit-admin">
                    {editingPhoto ? 'Save Changes' : 'Save Work'}
                  </button>
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
                        <div className="photo-meta">
                          <span className="photo-category">{photo.category}</span>
                          {photo.label && <span className="photo-label">{photo.label}</span>}
                        </div>
                        {photo.description && <p className="truncate">{photo.description}</p>}
                      </div>
                      <div className="item-actions">
                        <button 
                          className="btn-edit-admin"
                          onClick={() => handleEditPhoto(photo)}
                          title="Edit photo"
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn-delete-admin"
                          onClick={() => {
                            if (confirm('Delete this work?')) {
                              onDeletePhoto(photo.id)
                            }
                          }}
                          title="Delete photo"
                        >
                          🗑️
                        </button>
                      </div>
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
