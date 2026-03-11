import { useState, useMemo } from 'react'
import './PhotographyView.css'

function PhotographyView({ photos }) {
  const [activeLabel, setActiveLabel] = useState(null)

  // Group photos by label
  const photosByLabel = useMemo(() => {
    const grouped = {}
    photos.forEach(photo => {
      const label = photo.label || 'Unsorted'
      if (!grouped[label]) {
        grouped[label] = []
      }
      grouped[label].push(photo)
    })
    return grouped
  }, [photos])

  const labels = Object.keys(photosByLabel).sort()
  const selectedLabel = activeLabel || (labels.length > 0 ? labels[0] : null)
  const displayPhotos = selectedLabel ? photosByLabel[selectedLabel] : []

  return (
    <section className="photography-view-section">
      <div className="view-header">
        <h2>Photography & Videography</h2>
        <p>Explore my creative work</p>
      </div>

      {/* Label Filter Tabs */}
      {labels.length > 1 && (
        <div className="label-filters">
          {labels.map(label => (
            <button
              key={label}
              className={`label-tab ${selectedLabel === label ? 'active' : ''}`}
              onClick={() => setActiveLabel(label)}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Photos Gallery */}
      <div className="gallery-grid">
        {displayPhotos.length === 0 ? (
          <div className="empty-state">
            <p>No photography in this category yet.</p>
          </div>
        ) : (
          displayPhotos.map(photo => (
            <div key={photo.id} className="gallery-item">
              <div className="gallery-image">
                <img 
                  src={photo.image} 
                  alt={photo.title || 'Photography'}
                  style={{
                    transform: `translate(${photo.positionX || 0}%, ${photo.positionY || 0}%)`
                  }}
                />
                <div className="gallery-overlay">
                  {photo.title && <h3>{photo.title}</h3>}
                  {photo.description && <p>{photo.description}</p>}
                  <div className="overlay-tags">
                    {photo.category && <span className="category-tag">{photo.category}</span>}
                    {photo.label && <span className="label-tag">{photo.label}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}

export default PhotographyView
