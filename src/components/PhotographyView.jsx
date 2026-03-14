import { useState, useMemo } from 'react'
import './PhotographyView.css'

function PhotographyView({ photos }) {
  const [activeLabel, setActiveLabel] = useState(null)
  const [activeTag, setActiveTag] = useState(null)

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

  // Extract unique tags
  const allTags = useMemo(() => {
    const tags = new Set()
    photos.forEach(photo => {
      if (photo.tags && Array.isArray(photo.tags)) {
        photo.tags.forEach(tag => tags.add(tag))
      }
    })
    return Array.from(tags).sort()
  }, [photos])

  const labels = Object.keys(photosByLabel).sort()
  const selectedLabel = activeLabel || (labels.length > 0 ? labels[0] : null)
  let displayPhotos = selectedLabel ? photosByLabel[selectedLabel] : []

  // Further filter by tag if selected
  if (activeTag) {
    displayPhotos = displayPhotos.filter(photo => 
      photo.tags && photo.tags.includes(activeTag)
    )
  }

  return (
    <section className="photography-view-section">
      <div className="view-header">
        <h2>Timeless Photography</h2>
        <p>My artistic work stems from curiosity and the desire to express ideas and emotions through forms, colors, and compositions. I am interested in experimenting with different techniques and visual approaches to discover new ways of communicating and representing what I observe and feel, as well as what others feel. Each piece seeks to immortalize moments; hence the name: timeless photography.</p>
      </div>

      {/* Label Filter Tabs */}
      {labels.length > 1 && (
        <div className="label-filters">
          {labels.map(label => (
            <button
              key={label}
              className={`label-tab ${selectedLabel === label ? 'active' : ''}`}
              onClick={() => {
                setActiveLabel(label)
                setActiveTag(null)
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

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

      {/* Photos Gallery */}
      <div className="gallery-grid">
        {displayPhotos.length === 0 ? (
          <div className="empty-state">
            <p>{activeTag ? `No photos found with tag "${activeTag}".` : 'No photography in this category yet.'}</p>
          </div>
        ) : (
          displayPhotos.map(photo => (
            <div key={photo.id} className="gallery-item">
              <div className="gallery-image">
                <img 
                  src={photo.image} 
                  alt={photo.title || 'Photography'}
                  style={{
                    transform: `translate(${photo.positionX || 0}%, ${photo.positionY || 0}%) scale(${photo.zoom || 1})`
                  }}
                />
                <div className="gallery-overlay">
                  {photo.title && <h3>{photo.title}</h3>}
                  {photo.description && <p>{photo.description}</p>}
                  <div className="overlay-tags">
                    {photo.category && <span className="category-tag">{photo.category}</span>}
                    {photo.label && <span className="label-tag">{photo.label}</span>}
                    {photo.tags && photo.tags.length > 0 && (
                      <div className="photo-tags">
                        {photo.tags.map((tag, idx) => (
                          <span key={idx} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}
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
