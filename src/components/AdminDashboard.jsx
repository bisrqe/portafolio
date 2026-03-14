import { useState, useEffect } from 'react'
import CloudinaryUpload from './CloudinaryUpload'
import AdminAuth from './AdminAuth'
import './AdminDashboard.css'

function AdminDashboard({ projects, photos, leadership, onAddProject, onDeleteProject, onAddPhoto, onDeletePhoto, onUpdateProject, onUpdatePhoto, onAddLeadership, onDeleteLeadership, onUpdateLeadership, onExit }) {
  const [activeTab, setActiveTab] = useState('projects')
  const [isAdmin, setIsAdmin] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [editingPhoto, setEditingPhoto] = useState(null)
  const [editingLeadership, setEditingLeadership] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    link: '',
    image: '',
    tags: []
  })
  const [photoForm, setPhotoForm] = useState({
    title: '',
    description: '',
    image: '',
    category: 'photography',
    label: '',
    positionX: 0,
    positionY: 0,
    zoom: 1,
    tags: []
  })
  const [leadershipForm, setLeadershipForm] = useState({
    title: '',
    role: '',
    description: '',
    image: '',
    tags: []
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
      setProjectForm({ title: '', description: '', link: '', image: '', tags: [] })
      setShowForm(false)
    }
  }

  const handleEditProject = (project) => {
    setEditingProject(project)
    setProjectForm({
      title: project.title,
      description: project.description,
      link: project.link,
      image: project.image,
      tags: project.tags || []
    })
    setShowForm(true)
  }

  const handleCancelEdit = () => {
    setEditingProject(null)
    setProjectForm({ title: '', description: '', link: '', image: '', tags: [] })
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
      setPhotoForm({ title: '', description: '', image: '', category: 'photography', label: '', positionX: 0, positionY: 0, zoom: 1, tags: [] })
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
      positionY: photo.positionY || 0,
      zoom: photo.zoom || 1,
      tags: photo.tags || []
    })
    setShowForm(true)
  }

  const handleCancelPhotoEdit = () => {
    setEditingPhoto(null)
    setPhotoForm({ title: '', description: '', image: '', category: 'photography', label: '', positionX: 0, positionY: 0, zoom: 1, tags: [] })
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

    const zoom = photoForm.zoom || 1
    const maxShift = (zoom - 1) * 50

    const deltaX = (e.clientX - dragStart.x) * 0.15
    const deltaY = (e.clientY - dragStart.y) * 0.15

    const newX = Math.max(-maxShift, Math.min(maxShift, (photoForm.positionX || 0) + deltaX))
    const newY = Math.max(-maxShift, Math.min(maxShift, (photoForm.positionY || 0) + deltaY))

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

  const handleZoom = (direction) => {
    const currentZoom = photoForm.zoom || 1
    const step = 0.1
    const newZoom = direction === 'in' 
      ? Math.min(3, currentZoom + step)
      : Math.max(1, currentZoom - step)

    setPhotoForm(prev => ({
      ...prev,
      zoom: Math.round(newZoom * 10) / 10
    }))
  }

  const resetZoom = () => {
    setPhotoForm(prev => ({
      ...prev,
      zoom: 1,
      positionX: 0,
      positionY: 0
    }))
  }

  // Leadership handlers
  const handleLeadershipInputChange = (e) => {
    const { name, value } = e.target
    setLeadershipForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLeadershipTagsChange = (e) => {
    const tagsString = e.target.value
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag)
    setLeadershipForm(prev => ({
      ...prev,
      tags
    }))
  }

  const handleLeadershipSubmit = (e) => {
    e.preventDefault()
    if (leadershipForm.title.trim() && leadershipForm.role.trim()) {
      if (editingLeadership) {
        // Update existing leadership item
        if (onUpdateLeadership) {
          onUpdateLeadership(editingLeadership.id, leadershipForm)
        }
        setEditingLeadership(null)
      } else {
        // Add new leadership item
        onAddLeadership(leadershipForm)
      }
      setLeadershipForm({ title: '', role: '', description: '', image: '', tags: [] })
      setShowForm(false)
    }
  }

  const handleEditLeadership = (item) => {
    setEditingLeadership(item)
    setLeadershipForm({
      title: item.title,
      role: item.role,
      description: item.description,
      image: item.image,
      tags: item.tags || []
    })
    setShowForm(true)
  }

  const handleCancelLeadershipEdit = () => {
    setEditingLeadership(null)
    setLeadershipForm({ title: '', role: '', description: '', image: '', tags: [] })
    setShowForm(false)
  }

  const handleLeadershipUploadSuccess = (uploadData) => {
    setLeadershipForm(prev => ({
      ...prev,
      image: uploadData.url
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
              className={`tab-button ${activeTab === 'leadership' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('leadership')
                setShowForm(false)
              }}
            >
              🎯 Leadership ({leadership.length})
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
                              transform: `translate(${photoForm.positionX || 0}%, ${photoForm.positionY || 0}%) scale(${photoForm.zoom || 1})`,
                              cursor: isDragging ? 'grabbing' : 'grab'
                            }}
                            draggable={false}
                          />
                          <div className="position-overlay">
                            X: {photoForm.positionX || 0}% | Y: {photoForm.positionY || 0}%
                          </div>
                        </div>
                        <small>Drag the image to position it (X: {photoForm.positionX || 0}%, Y: {photoForm.positionY || 0}%)</small>
                        <div className="position-controls-group">
                          <button 
                            type="button"
                            className="btn-reset-position"
                            onClick={resetPosition}
                          >
                            ↺ Reset Position
                          </button>
                          <div className="zoom-controls">
                            <button 
                              type="button"
                              className="btn-zoom"
                              onClick={() => handleZoom('out')}
                              disabled={photoForm.zoom <= 1}
                              title="Zoom Out"
                            >
                              −
                            </button>
                            <span className="zoom-level">{(photoForm.zoom || 1).toFixed(1)}×</span>
                            <button 
                              type="button"
                              className="btn-zoom"
                              onClick={() => handleZoom('in')}
                              disabled={photoForm.zoom >= 3}
                              title="Zoom In"
                            >
                              +
                            </button>
                            <button 
                              type="button"
                              className="btn-reset-zoom"
                              onClick={resetZoom}
                              title="Reset Zoom and Position"
                            >
                              ↺ Reset Zoom
                            </button>
                          </div>
                        </div>
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

          {/* Leadership Tab */}
          {activeTab === 'leadership' && (
            <div className="admin-content">
              <div className="admin-header">
                <h3>Leadership & Experience</h3>
                <button 
                  className="btn-add-admin"
                  onClick={() => {
                    if (editingLeadership) {
                      handleCancelLeadershipEdit()
                    } else {
                      setShowForm(!showForm)
                    }
                  }}
                >
                  {editingLeadership ? '✕ Cancel Edit' : (showForm ? '✕ Cancel' : '+ Add Item')}
                </button>
              </div>

              {showForm && (
                <form className="admin-form" onSubmit={handleLeadershipSubmit}>
                  <div className="form-group">
                    <label>Name / Title *</label>
                    <input
                      type="text"
                      name="title"
                      placeholder="e.g., Jane Smith"
                      value={leadershipForm.title}
                      onChange={handleLeadershipInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Role / Position *</label>
                    <input
                      type="text"
                      name="role"
                      placeholder="e.g., CEO, VP of Engineering"
                      value={leadershipForm.role}
                      onChange={handleLeadershipInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      placeholder="Bio or description"
                      value={leadershipForm.description}
                      onChange={handleLeadershipInputChange}
                      rows="4"
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label>Image URL</label>
                    <input
                      type="url"
                      name="image"
                      placeholder="https://..."
                      value={leadershipForm.image}
                      onChange={handleLeadershipInputChange}
                    />
                    <div className="form-divider">or</div>
                    <CloudinaryUpload onUploadSuccess={handleLeadershipUploadSuccess} />
                  </div>

                  <div className="form-group">
                    <label>Tags (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="e.g., mentor, advisor, speaker"
                      value={leadershipForm.tags.join(', ')}
                      onChange={handleLeadershipTagsChange}
                    />
                  </div>

                  <button type="submit" className="btn-submit-admin">
                    {editingLeadership ? 'Save Changes' : 'Save Leadership Item'}
                  </button>
                </form>
              )}

              <div className="admin-grid">
                {leadership.length === 0 ? (
                  <div className="empty-admin-state">
                    <p>No leadership items yet. Add your first one!</p>
                  </div>
                ) : (
                  leadership.map(item => (
                    <div key={item.id} className="admin-item project-item">
                      <div className="item-image">
                        <img src={item.image || 'https://via.placeholder.com/200x150?text=Leadership'} alt={item.title} />
                      </div>
                      <div className="item-info">
                        <h4>{item.title}</h4>
                        <p className="truncate">{item.role}</p>
                        <p className="truncate">{item.description}</p>
                        {item.tags && item.tags.length > 0 && (
                          <div className="item-tags">
                            {item.tags.map((tag, idx) => (
                              <span key={idx} className="tag">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="item-actions">
                        <button 
                          className="btn-edit-admin"
                          onClick={() => handleEditLeadership(item)}
                          title="Edit item"
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn-delete-admin"
                          onClick={() => {
                            if (confirm('Delete this leadership item?')) {
                              onDeleteLeadership(item.id)
                            }
                          }}
                          title="Delete item"
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
