import { useState, useEffect } from 'react'
import FirebaseUpload from './FirebaseUpload'
import AdminAuth from './AdminAuth'
import './AdminDashboard.css'

function AdminDashboard({ projects, photos, leadership, homeContent, cvUrl, onAddProject, onDeleteProject, onAddPhoto, onDeletePhoto, onUpdateProject, onUpdatePhoto, onAddLeadership, onDeleteLeadership, onUpdateLeadership, onUpdateHomeContent, onUpdateCvUrl, onExit }) {
  const [activeTab, setActiveTab] = useState('projects')
  const [isAdmin, setIsAdmin] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [editingPhoto, setEditingPhoto] = useState(null)
  const [editingLeadership, setEditingLeadership] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [draggingForm, setDraggingForm] = useState(null) // 'project', 'leadership', or 'photo'
  const [showProjectPositionControls, setShowProjectPositionControls] = useState(false)
  const [showPhotoPositionControls, setShowPhotoPositionControls] = useState(false)
  const [showLeadershipPositionControls, setShowLeadershipPositionControls] = useState(false)
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    link: '',
    image: '',
    images: [],
    tags: [],
    positionX: 0,
    positionY: 0,
    zoom: 1
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
    images: [],
    link: '',
    tags: [],
    sdg: [],
    positionX: 0,
    positionY: 0,
    zoom: 1
  })
  const [homeForm, setHomeForm] = useState({
    name: '',
    tagline: '',
    description: '',
    fullBio: '',
    heroImage: '',
    achievements: [],
    abilities: []
  })
  const [currentCvUrl, setCurrentCvUrl] = useState(cvUrl)
  const [projectsVisibleTags, setProjectsVisibleTags] = useState([])
  const [leadershipVisibleTags, setLeadershipVisibleTags] = useState([])
  const [allProjectTags, setAllProjectTags] = useState([])
  const [allLeadershipTags, setAllLeadershipTags] = useState([])

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('portfolio_admin_token')
    if (token) {
      setIsAdmin(true)
    }
  }, [])

  useEffect(() => {
    setCurrentCvUrl(cvUrl)
    if (homeContent && Object.keys(homeContent).length > 0) {
      setHomeForm({
        name: homeContent.name || '',
        tagline: homeContent.tagline || '',
        description: homeContent.description || '',
        fullBio: homeContent.fullBio || '',
        heroImage: homeContent.heroImage || '',
        achievements: homeContent.achievements || [],
        abilities: homeContent.abilities || []
      })
    }
  }, [homeContent, cvUrl])

  // Initialize tag settings from localStorage and collect available tags
  useEffect(() => {
    // Collect all project tags
    const projectTagSet = new Set()
    projects.forEach(p => {
      if (p.tags && Array.isArray(p.tags)) {
        p.tags.forEach(tag => projectTagSet.add(tag))
      }
    })
    const allProjTags = Array.from(projectTagSet).sort()
    setAllProjectTags(allProjTags)

    // Load visible project tags from localStorage
    const savedProjTags = localStorage.getItem('portfolio_visible_tags_projects')
    if (savedProjTags) {
      try {
        setProjectsVisibleTags(JSON.parse(savedProjTags))
      } catch (e) {
        setProjectsVisibleTags(['Simulation', 'Professional Experience', 'Student Groups', 'Personal Projects', 'Hackathons'])
      }
    } else {
      setProjectsVisibleTags(['Simulation', 'Professional Experience', 'Student Groups', 'Personal Projects', 'Hackathons'])
    }

    // Collect all leadership tags
    const leadershipTagSet = new Set()
    leadership.forEach(l => {
      if (l.tags && Array.isArray(l.tags)) {
        l.tags.forEach(tag => leadershipTagSet.add(tag))
      }
    })
    const allLeadTags = Array.from(leadershipTagSet).sort()
    setAllLeadershipTags(allLeadTags)

    // Load visible leadership tags from localStorage
    const savedLeadTags = localStorage.getItem('portfolio_visible_tags_leadership')
    if (savedLeadTags) {
      try {
        setLeadershipVisibleTags(JSON.parse(savedLeadTags))
      } catch (e) {
        setLeadershipVisibleTags(['EGS', 'Leadership Iniciatives', 'International Events', 'Social Service'])
      }
    } else {
      setLeadershipVisibleTags(['EGS', 'Leadership Iniciatives', 'International Events', 'Social Service'])
    }
  }, [projects, leadership])

  const handleToggleProjectTag = (tag) => {
    setProjectsVisibleTags(prev => {
      const updated = prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
      localStorage.setItem('portfolio_visible_tags_projects', JSON.stringify(updated))
      return updated
    })
  }

  const handleToggleLeadershipTag = (tag) => {
    setLeadershipVisibleTags(prev => {
      const updated = prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
      localStorage.setItem('portfolio_visible_tags_leadership', JSON.stringify(updated))
      return updated
    })
  }

  // Project handlers
  const handleProjectInputChange = (e) => {
    const { name, value } = e.target
    setProjectForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddProjectImage = (uploadData) => {
    const url = uploadData.url || uploadData.secure_url
    setProjectForm(prev => ({
      ...prev,
      images: [...prev.images, url],
      image: url // Also keep as primary image
    }))
  }

  const handleRemoveProjectImage = (index) => {
    setProjectForm(prev => {
      const updatedImages = prev.images.filter((_, i) => i !== index)
      return {
        ...prev,
        images: updatedImages,
        image: updatedImages.length > 0 ? updatedImages[0] : '' // Set first as primary or clear
      }
    })
  }

  const handleAddLeadershipImage = (uploadData) => {
    const url = uploadData.url || uploadData.secure_url
    setLeadershipForm(prev => ({
      ...prev,
      images: [...prev.images, url],
      image: url // Also keep as primary image
    }))
  }

  const handleRemoveLeadershipImage = (index) => {
    setLeadershipForm(prev => {
      const updatedImages = prev.images.filter((_, i) => i !== index)
      return {
        ...prev,
        images: updatedImages,
        image: updatedImages.length > 0 ? updatedImages[0] : '' // Set first as primary or clear
      }
    })
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
      setProjectForm({ title: '', description: '', link: '', image: '', tags: [], positionX: 0, positionY: 0, zoom: 1 })
      setShowForm(false)
      setShowProjectPositionControls(false)
    }
  }

  const handleEditProject = (project) => {
    setEditingProject(project)
    setProjectForm({
      title: project.title,
      description: project.description,
      link: project.link,
      image: project.image,
      images: project.images || [],
      tags: project.tags || [],
      positionX: project.positionX || 0,
      positionY: project.positionY || 0,
      zoom: project.zoom || 1
    })
    setShowForm(true)
  }

  const handleCancelEdit = () => {
    setEditingProject(null)
    setProjectForm({ title: '', description: '', link: '', image: '', images: [], tags: [], positionX: 0, positionY: 0, zoom: 1 })
    setShowForm(false)
    setShowProjectPositionControls(false)
  }

  const handleProjectUploadSuccess = (uploadData) => {
    const url = uploadData.url || uploadData.secure_url
    setProjectForm(prev => ({
      ...prev,
      image: url,
      images: [...(prev.images || []), url]
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
      setShowPhotoPositionControls(false)
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
    setShowPhotoPositionControls(false)
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

  const handlePreviewMouseDown = (e, formType = 'photo') => {
    setIsDragging(true)
    setDraggingForm(formType)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handlePreviewMouseMove = (e) => {
    if (!isDragging) return

    let currentForm, setCurrentForm, maxShift
    
    if (draggingForm === 'project') {
      currentForm = projectForm
      setCurrentForm = setProjectForm
    } else if (draggingForm === 'leadership') {
      currentForm = leadershipForm
      setCurrentForm = setLeadershipForm
    } else {
      currentForm = photoForm
      setCurrentForm = setPhotoForm
    }

    const zoom = currentForm.zoom || 1
    maxShift = (zoom - 1) * 50

    const deltaX = (e.clientX - dragStart.x) * 0.15
    const deltaY = (e.clientY - dragStart.y) * 0.15

    const newX = Math.max(-maxShift, Math.min(maxShift, (currentForm.positionX || 0) + deltaX))
    const newY = Math.max(-maxShift, Math.min(maxShift, (currentForm.positionY || 0) + deltaY))

    setCurrentForm(prev => ({
      ...prev,
      positionX: Math.round(newX),
      positionY: Math.round(newY)
    }))

    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handlePreviewMouseUp = () => {
    setIsDragging(false)
    setDraggingForm(null)
  }

  const resetPosition = (formType = 'photo') => {
    if (formType === 'project') {
      setProjectForm(prev => ({
        ...prev,
        positionX: 0,
        positionY: 0
      }))
    } else if (formType === 'leadership') {
      setLeadershipForm(prev => ({
        ...prev,
        positionX: 0,
        positionY: 0
      }))
    } else {
      setPhotoForm(prev => ({
        ...prev,
        positionX: 0,
        positionY: 0
      }))
    }
  }

  const handleZoom = (direction, formType = 'photo') => {
    const currentForm = formType === 'project' ? projectForm : formType === 'leadership' ? leadershipForm : photoForm
    const setCurrentForm = formType === 'project' ? setProjectForm : formType === 'leadership' ? setLeadershipForm : setPhotoForm
    
    const currentZoom = currentForm.zoom || 1
    const step = 0.1
    const newZoom = direction === 'in' 
      ? Math.min(3, currentZoom + step)
      : Math.max(1, currentZoom - step)

    setCurrentForm(prev => ({
      ...prev,
      zoom: Math.round(newZoom * 10) / 10
    }))
  }

  const resetZoom = (formType = 'photo') => {
    if (formType === 'project') {
      setProjectForm(prev => ({
        ...prev,
        zoom: 1,
        positionX: 0,
        positionY: 0
      }))
    } else if (formType === 'leadership') {
      setLeadershipForm(prev => ({
        ...prev,
        zoom: 1,
        positionX: 0,
        positionY: 0
      }))
    } else {
      setPhotoForm(prev => ({
        ...prev,
        zoom: 1,
        positionX: 0,
        positionY: 0
      }))
    }
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
      setLeadershipForm({ title: '', role: '', description: '', image: '', link: '', tags: [], sdg: [], positionX: 0, positionY: 0, zoom: 1 })
      setShowLeadershipPositionControls(false)
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
      images: item.images || [],
      link: item.link || '',
      tags: item.tags || [],
      sdg: item.sdg || [],
      positionX: item.positionX || 0,
      positionY: item.positionY || 0,
      zoom: item.zoom || 1
    })
    setShowForm(true)
  }

  const handleCancelLeadershipEdit = () => {
    setEditingLeadership(null)
    setLeadershipForm({ title: '', role: '', description: '', image: '', images: [], link: '', tags: [], sdg: [], positionX: 0, positionY: 0, zoom: 1 })
    setShowLeadershipPositionControls(false)
    setShowForm(false)
  }

  const handleLeadershipUploadSuccess = (uploadData) => {
    const url = uploadData.url || uploadData.secure_url
    setLeadershipForm(prev => ({
      ...prev,
      image: url,
      images: [...(prev.images || []), url]
    }))
  }

  // Home handlers
  const handleHomeInputChange = (e) => {
    const { name, value } = e.target
    setHomeForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleHomeHeroUploadSuccess = (uploadData) => {
    setHomeForm(prev => ({
      ...prev,
      heroImage: uploadData.url
    }))
  }

  const handleHomeSubmit = async (e) => {
    e.preventDefault()
    if (homeForm.name.trim()) {
      try {
        await onUpdateHomeContent(homeForm)
        alert('Home content updated successfully!')
      } catch (error) {
        console.error('Error submitting home form:', error)
        alert(`Failed to update home content: ${error.message || 'Unknown error. Check console for details.'}`)
      }
    } else {
      alert('Please enter your name.')
    }
  }

  const handleCvUpload = async (file) => {
    if (!file) return
    
    // The actual CV URL will be set via the handleCvUploadSuccess callback
  }

  const handleCvUploadSuccess = async (uploadData) => {
    const url = uploadData.url || uploadData.secure_url
    setCurrentCvUrl(url)
    try {
      await onUpdateCvUrl(url)
      alert('✓ CV uploaded successfully!')
    } catch (error) {
      console.error('Error saving CV URL:', error)
      alert(`CV file uploaded but failed to save: ${error.message}`)
    }
  }

  const handleAddAchievement = () => {
    setHomeForm(prev => ({
      ...prev,
      achievements: [...prev.achievements, { id: Date.now(), number: '', label: '' }]
    }))
  }

  const handleUpdateAchievement = (id, field, value) => {
    setHomeForm(prev => ({
      ...prev,
      achievements: prev.achievements.map(a => a.id === id ? { ...a, [field]: value } : a)
    }))
  }

  const handleRemoveAchievement = (id) => {
    setHomeForm(prev => ({
      ...prev,
      achievements: prev.achievements.filter(a => a.id !== id)
    }))
  }

  const handleAddAbility = () => {
    setHomeForm(prev => ({
      ...prev,
      abilities: [...prev.abilities, { id: Date.now(), icon: '', title: '', description: '', tags: [] }]
    }))
  }

  const handleUpdateAbility = (id, field, value) => {
    setHomeForm(prev => ({
      ...prev,
      abilities: prev.abilities.map(a => a.id === id ? { ...a, [field]: value } : a)
    }))
  }

  const handleRemoveAbility = (id) => {
    setHomeForm(prev => ({
      ...prev,
      abilities: prev.abilities.filter(a => a.id !== id)
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
              Logout
            </button>
          </div>

          {/* Tabs */}
          <div className="admin-tabs">
            <button
              className={`tab-button ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('home')
                setShowForm(false)
              }}
            >
              🏠 Home
            </button>
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
              Photography ({photos.length})
            </button>
            <button
              className={`tab-button ${activeTab === 'tags' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('tags')
                setShowForm(false)
              }}
            >
              🏷️ Tag Settings
            </button>
          </div>

          {/* Home Tab */}
          {activeTab === 'home' && (
            <div className="admin-content">
              <div className="admin-header">
                <h3>Home Page Management</h3>
              </div>

              <form className="admin-form" onSubmit={handleHomeSubmit}>
                <div className="form-group">
                  <label>Your Name *</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g., Hey, I'm Sanjay Adhithyan"
                    value={homeForm.name}
                    onChange={handleHomeInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Tagline *</label>
                  <input
                    type="text"
                    name="tagline"
                    placeholder="e.g., Product Designer"
                    value={homeForm.tagline}
                    onChange={handleHomeInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Short Description</label>
                  <textarea
                    name="description"
                    placeholder="Brief introduction for the hero section"
                    value={homeForm.description}
                    onChange={handleHomeInputChange}
                    rows="3"
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Full Bio</label>
                  <textarea
                    name="fullBio"
                    placeholder="Longer biography for the about section"
                    value={homeForm.fullBio}
                    onChange={handleHomeInputChange}
                    rows="4"
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Hero Image URL</label>
                  <input
                    type="url"
                    name="heroImage"
                    placeholder="https://..."
                    value={homeForm.heroImage}
                    onChange={handleHomeInputChange}
                  />
                  <div className="form-divider">or</div>
                  <FirebaseUpload onUploadSuccess={handleHomeHeroUploadSuccess} />
                </div>

                <div className="form-group">
                  <label>CV Upload (PDF)</label>
                  <FirebaseUpload 
                    onUploadSuccess={handleCvUploadSuccess} 
                    acceptFiles=".pdf,application/pdf"
                    buttonLabel="📄 Upload CV (PDF)"
                  />
                  {currentCvUrl && (
                    <div style={{ marginTop: '10px', color: '#DEC1FF' }}>
                      <p>✓ CV uploaded: <a href={currentCvUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#DEC1FF', textDecoration: 'underline' }}>Download CV</a></p>
                    </div>
                  )}
                </div>

                <div className="form-section-divider">
                  <h4>Achievements</h4>
                </div>

                {homeForm.achievements.map((achievement) => (
                  <div key={achievement.id} className="form-group achievement-item">
                    <div className="achievement-inputs">
                      <input
                        type="text"
                        placeholder="Number (e.g., 30+)"
                        value={achievement.number}
                        onChange={(e) => handleUpdateAchievement(achievement.id, 'number', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Label (e.g., Projects)"
                        value={achievement.label}
                        onChange={(e) => handleUpdateAchievement(achievement.id, 'label', e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn-remove-item"
                        onClick={() => handleRemoveAchievement(achievement.id)}
                        title="Remove achievement"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}

                <div className="form-group">
                  <button
                    type="button"
                    className="btn-add-item"
                    onClick={handleAddAchievement}
                  >
                    + Add Achievement
                  </button>
                </div>

                <div className="form-section-divider">
                  <h4>Skills & Abilities</h4>
                </div>

                {homeForm.abilities.map((ability) => (
                  <div key={ability.id} className="form-group ability-item">
                    <div className="ability-inputs">
                      <input
                        type="text"
                        placeholder="Icon/Emoji (e.g., 🎨)"
                        value={ability.icon}
                        onChange={(e) => handleUpdateAbility(ability.id, 'icon', e.target.value)}
                        maxLength="2"
                        style={{ maxWidth: '60px' }}
                      />
                      <input
                        type="text"
                        placeholder="Title (e.g., Web Design)"
                        value={ability.title}
                        onChange={(e) => handleUpdateAbility(ability.id, 'title', e.target.value)}
                      />
                    </div>
                    <textarea
                      placeholder="Description"
                      value={ability.description}
                      onChange={(e) => handleUpdateAbility(ability.id, 'description', e.target.value)}
                      rows="2"
                      style={{ marginTop: '10px' }}
                    ></textarea>
                    <input
                      type="text"
                      placeholder="Tags (comma-separated, e.g., React, UI, UX)"
                      value={ability.tags.join(', ')}
                      onChange={(e) => {
                        const tags = e.target.value.split(',').map(t => t.trim()).filter(t => t)
                        handleUpdateAbility(ability.id, 'tags', tags)
                      }}
                      style={{ marginTop: '10px' }}
                    />
                    <button
                      type="button"
                      className="btn-remove-item"
                      onClick={() => handleRemoveAbility(ability.id)}
                      title="Remove ability"
                      style={{ marginTop: '10px' }}
                    >
                      ✕ Remove Ability
                    </button>
                  </div>
                ))}

                <div className="form-group">
                  <button
                    type="button"
                    className="btn-add-item"
                    onClick={handleAddAbility}
                  >
                    + Add Ability
                  </button>
                </div>

                <button type="submit" className="btn-submit-admin">
                  Save Home Page
                </button>
              </form>
            </div>
          )}

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
                    <FirebaseUpload onUploadSuccess={handleProjectUploadSuccess} />
                  </div>

                  {projectForm.images && projectForm.images.length > 0 && (
                    <div className="form-group">
                      <label>📸 Uploaded Images ({projectForm.images.length}) - Carousel</label>
                      <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', margin: '5px 0 10px 0' }}>
                        These images will be available in a carousel on the project card
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                        {projectForm.images.map((img, idx) => (
                          <div key={idx} style={{ position: 'relative', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                            <img 
                              src={img} 
                              alt={`Project image ${idx + 1}`}
                              style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveProjectImage(idx)}
                              style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(255, 0, 0, 0.7)', color: '#fff', border: 'none', borderRadius: '3px', padding: '2px 6px', cursor: 'pointer', fontSize: '0.8rem' }}
                              title="Remove this image"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {projectForm.image && (
                    <div className="form-group">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <label>Image Position</label>
                        <button
                          type="button"
                          className="btn-toggle-position"
                          onClick={() => setShowProjectPositionControls(!showProjectPositionControls)}
                          title={showProjectPositionControls ? 'Hide position controls' : 'Show position controls'}
                        >
                          {showProjectPositionControls ? '▼ Hide' : '▶ Show'}
                        </button>
                      </div>
                      {showProjectPositionControls && (
                        <div className="position-preview">
                          <div 
                            className={`preview-container ${isDragging && draggingForm === 'project' ? 'dragging' : ''}`}
                            onMouseDown={(e) => handlePreviewMouseDown(e, 'project')}
                            onMouseMove={handlePreviewMouseMove}
                            onMouseUp={handlePreviewMouseUp}
                            onMouseLeave={handlePreviewMouseUp}
                          >
                            <img 
                              src={projectForm.image} 
                              alt="Preview" 
                              className="preview-image"
                              style={{
                                transform: `translate(${projectForm.positionX || 0}%, ${projectForm.positionY || 0}%) scale(${projectForm.zoom || 1})`,
                                cursor: isDragging && draggingForm === 'project' ? 'grabbing' : 'grab'
                              }}
                              draggable={false}
                            />
                            <div className="position-overlay">
                              X: {projectForm.positionX || 0}% | Y: {projectForm.positionY || 0}%
                            </div>
                          </div>
                          <small>Drag the image to position it (X: {projectForm.positionX || 0}%, Y: {projectForm.positionY || 0}%)</small>
                          <div className="position-controls-group">
                            <button 
                              type="button"
                              className="btn-reset-position"
                              onClick={() => resetPosition('project')}
                            >
                              ↺ Reset Position
                            </button>
                            <div className="zoom-controls">
                              <button 
                                type="button"
                                className="btn-zoom"
                                onClick={() => handleZoom('out', 'project')}
                                disabled={projectForm.zoom <= 1}
                                title="Zoom Out"
                              >
                                −
                              </button>
                              <span className="zoom-level">{(projectForm.zoom || 1).toFixed(1)}×</span>
                              <button 
                                type="button"
                                className="btn-zoom"
                                onClick={() => handleZoom('in', 'project')}
                                disabled={projectForm.zoom >= 3}
                                title="Zoom In"
                              >
                                +
                              </button>
                              <button 
                                type="button"
                                className="btn-reset-zoom"
                                onClick={() => resetZoom('project')}
                                title="Reset Zoom and Position"
                              >
                                ↺ Reset Zoom
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="form-group">
                    <label>Tags (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="e.g., React, Web Development, Full-stack"
                      value={projectForm.tags.join(', ')}
                      onChange={(e) => {
                        const tagsString = e.target.value
                        const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag)
                        setProjectForm(prev => ({ ...prev, tags }))
                      }}
                    />
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
                    <FirebaseUpload onUploadSuccess={handlePhotoUploadSuccess} />
                  </div>

                  {photoForm.image && (
                    <div className="form-group">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <label>Image Position</label>
                        <button
                          type="button"
                          className="btn-toggle-position"
                          onClick={() => setShowPhotoPositionControls(!showPhotoPositionControls)}
                          title={showPhotoPositionControls ? 'Hide position controls' : 'Show position controls'}
                        >
                          {showPhotoPositionControls ? '▼ Hide' : '▶ Show'}
                        </button>
                      </div>
                      {showPhotoPositionControls && (
                        <div className="position-preview">
                          <div 
                            className={`preview-container ${isDragging && draggingForm === 'photo' ? 'dragging' : ''}`}
                            onMouseDown={(e) => handlePreviewMouseDown(e, 'photo')}
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
                                cursor: isDragging && draggingForm === 'photo' ? 'grabbing' : 'grab'
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
                              onClick={() => resetPosition('photo')}
                            >
                              ↺ Reset Position
                            </button>
                            <div className="zoom-controls">
                              <button 
                                type="button"
                                className="btn-zoom"
                                onClick={() => handleZoom('out', 'photo')}
                                disabled={photoForm.zoom <= 1}
                                title="Zoom Out"
                              >
                                −
                              </button>
                              <span className="zoom-level">{(photoForm.zoom || 1).toFixed(1)}×</span>
                              <button 
                                type="button"
                                className="btn-zoom"
                                onClick={() => handleZoom('in', 'photo')}
                                disabled={photoForm.zoom >= 3}
                                title="Zoom In"
                              >
                                +
                              </button>
                              <button 
                                type="button"
                                className="btn-reset-zoom"
                                onClick={() => resetZoom('photo')}
                                title="Reset Zoom and Position"
                              >
                                ↺ Reset Zoom
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="form-group">
                    <label>Tags (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="e.g., landscape, portrait, summer"
                      value={photoForm.tags.join(', ')}
                      onChange={(e) => {
                        const tagsString = e.target.value
                        const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag)
                        setPhotoForm(prev => ({ ...prev, tags }))
                      }}
                    />
                  </div>

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
                    <FirebaseUpload onUploadSuccess={handleLeadershipUploadSuccess} />
                  </div>

                  {leadershipForm.images && leadershipForm.images.length > 0 && (
                    <div className="form-group">
                      <label>📸 Uploaded Images ({leadershipForm.images.length}) - Carousel</label>
                      <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', margin: '5px 0 10px 0' }}>
                        These images will be available in a carousel on the leadership card
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                        {leadershipForm.images.map((img, idx) => (
                          <div key={idx} style={{ position: 'relative', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                            <img 
                              src={img} 
                              alt={`Leadership image ${idx + 1}`}
                              style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveLeadershipImage(idx)}
                              style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(255, 0, 0, 0.7)', color: '#fff', border: 'none', borderRadius: '3px', padding: '2px 6px', cursor: 'pointer', fontSize: '0.8rem' }}
                              title="Remove this image"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {leadershipForm.image && (
                    <div className="form-group">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <label>Image Position</label>
                        <button
                          type="button"
                          className="btn-toggle-position"
                          onClick={() => setShowLeadershipPositionControls(!showLeadershipPositionControls)}
                          title={showLeadershipPositionControls ? 'Hide position controls' : 'Show position controls'}
                        >
                          {showLeadershipPositionControls ? '▼ Hide' : '▶ Show'}
                        </button>
                      </div>
                      {showLeadershipPositionControls && (
                        <div className="position-preview">
                          <div 
                            className={`preview-container ${isDragging && draggingForm === 'leadership' ? 'dragging' : ''}`}
                            onMouseDown={(e) => handlePreviewMouseDown(e, 'leadership')}
                            onMouseMove={handlePreviewMouseMove}
                            onMouseUp={handlePreviewMouseUp}
                            onMouseLeave={handlePreviewMouseUp}
                          >
                            <img 
                              src={leadershipForm.image} 
                              alt="Preview" 
                              className="preview-image"
                              style={{
                                transform: `translate(${leadershipForm.positionX || 0}%, ${leadershipForm.positionY || 0}%) scale(${leadershipForm.zoom || 1})`,
                                cursor: isDragging && draggingForm === 'leadership' ? 'grabbing' : 'grab'
                              }}
                              draggable={false}
                            />
                            <div className="position-overlay">
                              X: {leadershipForm.positionX || 0}% | Y: {leadershipForm.positionY || 0}%
                            </div>
                          </div>
                          <small>Drag the image to position it (X: {leadershipForm.positionX || 0}%, Y: {leadershipForm.positionY || 0}%)</small>
                          <div className="position-controls-group">
                            <button 
                              type="button"
                              className="btn-reset-position"
                              onClick={() => resetPosition('leadership')}
                            >
                              ↺ Reset Position
                            </button>
                            <div className="zoom-controls">
                              <button 
                                type="button"
                                className="btn-zoom"
                                onClick={() => handleZoom('out', 'leadership')}
                                disabled={leadershipForm.zoom <= 1}
                                title="Zoom Out"
                              >
                                −
                              </button>
                              <span className="zoom-level">{(leadershipForm.zoom || 1).toFixed(1)}×</span>
                              <button 
                                type="button"
                                className="btn-zoom"
                                onClick={() => handleZoom('in', 'leadership')}
                                disabled={leadershipForm.zoom >= 3}
                                title="Zoom In"
                              >
                                +
                              </button>
                              <button 
                                type="button"
                                className="btn-reset-zoom"
                                onClick={() => resetZoom('leadership')}
                                title="Reset Zoom and Position"
                              >
                                ↺ Reset Zoom
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="form-group">
                    <label>Link</label>
                    <input
                      type="url"
                      name="link"
                      placeholder="https://..."
                      value={leadershipForm.link}
                      onChange={handleLeadershipInputChange}
                    />
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

                  <div className="form-group">
                    <label>Sustainable Development Goals (SDGs) - Optional</label>
                    <input
                      type="text"
                      placeholder="e.g., SDG 4 - Quality Education, SDG 10 - Reduced Inequalities"
                      value={leadershipForm.sdg.join(', ')}
                      onChange={(e) => {
                        const sdgString = e.target.value
                        const sdgs = sdgString.split(',').map(goal => goal.trim()).filter(goal => goal)
                        setLeadershipForm(prev => ({ ...prev, sdg: sdgs }))
                      }}
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
                        {item.link && (
                          <a href={item.link} target="_blank" rel="noopener noreferrer" className="item-link">
                            View →
                          </a>
                        )}
                        {item.sdg && item.sdg.length > 0 && (
                          <div className="item-tags">
                            {item.sdg.map((goal, idx) => (
                              <span key={idx} className="sdg-tag">{goal}</span>
                            ))}
                          </div>
                        )}
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

          {/* Tag Settings Tab */}
          {activeTab === 'tags' && (
            <div className="admin-content">
              <div className="admin-header">
                <h3>Tag Visibility Settings</h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', margin: '5px 0 0 0' }}>
                  Select which tags appear in the filter buttons on each page
                </p>
              </div>

              {/* Projects Tags */}
              <div style={{ marginBottom: '40px' }}>
                <h4 style={{ color: '#DEC1FF', marginBottom: '15px', fontSize: '1.1rem' }}>📁 Professional Projects Tags</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {allProjectTags.length === 0 ? (
                    <p style={{ color: 'rgba(255, 255, 255, 0.5)' }}>No tags available</p>
                  ) : (
                    allProjectTags.map(tag => (
                      <label key={tag} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', cursor: 'pointer', border: '1px solid rgba(255, 255, 255, 0.1)', transition: 'all 0.2s ease' }}>
                        <input
                          type="checkbox"
                          checked={projectsVisibleTags.includes(tag)}
                          onChange={() => handleToggleProjectTag(tag)}
                          style={{ cursor: 'pointer' }}
                        />
                        <span style={{ color: projectsVisibleTags.includes(tag) ? '#DEC1FF' : 'rgba(255, 255, 255, 0.6)' }}>
                          {tag}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Leadership Tags */}
              <div>
                <h4 style={{ color: '#DEC1FF', marginBottom: '15px', fontSize: '1.1rem' }}>🎯 Leadership & Impact Tags</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {allLeadershipTags.length === 0 ? (
                    <p style={{ color: 'rgba(255, 255, 255, 0.5)' }}>No tags available</p>
                  ) : (
                    allLeadershipTags.map(tag => (
                      <label key={tag} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', cursor: 'pointer', border: '1px solid rgba(255, 255, 255, 0.1)', transition: 'all 0.2s ease' }}>
                        <input
                          type="checkbox"
                          checked={leadershipVisibleTags.includes(tag)}
                          onChange={() => handleToggleLeadershipTag(tag)}
                          style={{ cursor: 'pointer' }}
                        />
                        <span style={{ color: leadershipVisibleTags.includes(tag) ? '#DEC1FF' : 'rgba(255, 255, 255, 0.6)' }}>
                          {tag}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </>
  )
}

export default AdminDashboard
