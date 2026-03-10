import { useState } from 'react'
import CloudinaryUpload from './CloudinaryUpload'
import './PhotographyPortfolio.css'

function PhotographyPortfolio({ photos, onAdd, onDelete }) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    category: 'photography'
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.image.trim()) {
      onAdd(formData)
      setFormData({ title: '', description: '', image: '', category: 'photography' })
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
    <section className="photography-section">
      <div className="section-header">
        <h2>Photography & Videography</h2>
        <button 
          className="btn-add"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ Add Work'}
        </button>
      </div>

      {showForm && (
        <form className="photo-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="title"
              placeholder="Title (optional)"
              value={formData.title}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
            ></textarea>
          </div>

          <div className="form-group">
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
            >
              <option value="photography">Photography</option>
              <option value="videography">Videography</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <input
              type="url"
              name="image"
              placeholder="Image/Thumbnail URL"
              value={formData.image}
              onChange={handleInputChange}
              required
            />
            <div className="form-divider">or</div>
            <CloudinaryUpload onUploadSuccess={handleUploadSuccess} />
          </div>

          <button type="submit" className="btn-submit">Save Work</button>
        </form>
      )}

      <div className="gallery-grid">
        {photos.length === 0 ? (
          <div className="empty-state">
            <p>No photography yet. Add your creative work!</p>
          </div>
        ) : (
          photos.map(photo => (
            <div key={photo.id} className="gallery-item">
              <div className="gallery-image">
                <img src={photo.image} alt={photo.title || 'Photography'} />
                <div className="gallery-overlay">
                  {photo.title && <h3>{photo.title}</h3>}
                  {photo.description && <p>{photo.description}</p>}
                </div>
              </div>
              <button 
                className="btn-delete-gallery"
                onClick={() => onDelete(photo.id)}
                title="Delete"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  )
}

export default PhotographyPortfolio
