import { useState, useMemo, useEffect } from 'react'
import './LeadershipView.css'

function LeadershipView({ leadership }) {
  const [activeTag, setActiveTag] = useState(null)
  const [visibleTags, setVisibleTags] = useState([])
  const [carouselIndices, setCarouselIndices] = useState({})
  const [expandedImage, setExpandedImage] = useState(null)

  // Load visible tags from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('portfolio_visible_tags_leadership')
    if (saved) {
      try {
        setVisibleTags(JSON.parse(saved))
      } catch (e) {
        // Fallback to default
        setVisibleTags(['EGS', 'Leadership Iniciatives', 'International Events', 'Social Service', 'Student Groups'])
      }
    } else {
      // Set default tags on first load
      setVisibleTags(['EGS', 'Leadership Iniciatives', 'International Events', 'Social Service', 'Student Groups'])
    }
  }, [])

  // Handle escape key to close expanded image
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setExpandedImage(null)
      }
    }
    if (expandedImage) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [expandedImage])

  const getLeadershipImages = (item) => {
    // Support both single image (backward compatibility) and multiple images
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      return item.images
    }
    if (item.image) {
      return [item.image]
    }
    return []
  }

  const nextImage = (itemId) => {
    const item = leadership.find(l => l.id === itemId)
    const images = getLeadershipImages(item)
    if (images.length <= 1) return
    
    setCarouselIndices(prev => ({
      ...prev,
      [itemId]: ((prev[itemId] || 0) + 1) % images.length
    }))
  }

  const prevImage = (itemId) => {
    const item = leadership.find(l => l.id === itemId)
    const images = getLeadershipImages(item)
    if (images.length <= 1) return

    setCarouselIndices(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) === 0 ? images.length - 1 : (prev[itemId] || 0) - 1
    }))
  }
  
  // Get all unique tags
  const allTags = useMemo(() => {
  const tags = new Set()

  leadership.forEach(item => {
    if (item.tags && Array.isArray(item.tags)) {
      item.tags.forEach(tag => {
        if (!visibleTags || visibleTags.includes(tag)) {
          tags.add(tag)
        }
      })
    }
  })

  return Array.from(tags).sort()
}, [leadership, visibleTags])

  // Filter leadership by selected tag
  const filteredLeadership = activeTag
    ? leadership.filter(item => item.tags && item.tags.includes(activeTag))
    : leadership

  return (
    <>
      <section className="leadership-view-section">
      <div className="view-header">
        <h2>Leadership & Impact</h2>
        <p>Projects and initiatives I've led</p>
      </div>

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <div className="tag-filters">
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
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Leadership List */}
      <div className="leadership-list">
        {filteredLeadership.length === 0 ? (
          <div className="empty-state">
            <p>No leadership items in this category yet.</p>
          </div>
        ) : (
          filteredLeadership.map(item => {
            const images = getLeadershipImages(item)
            const currentIndex = carouselIndices[item.id] || 0
            const hasMultipleImages = images.length > 1

            return (
            <div key={item.id} className="leadership-card">
              {images.length > 0 && (
                <div className="leadership-image-container">
                  <div className="leadership-image" onClick={() => setExpandedImage(images[currentIndex])} style={{ cursor: 'pointer' }}>
                    <img 
                      src={images[currentIndex]} 
                      alt={item.title || 'Leadership'}
                      style={{
                        transform: `translate(${item.positionX || 0}%, ${item.positionY || 0}%) scale(${item.zoom || 1})`
                      }}
                    />
                  </div>
                  
                  {/* Carousel Controls */}
                  {hasMultipleImages && (
                    <>
                      <button 
                        className="carousel-btn carousel-prev"
                        onClick={() => prevImage(item.id)}
                        title="Previous image"
                      >
                        ‹
                      </button>
                      <button 
                        className="carousel-btn carousel-next"
                        onClick={() => nextImage(item.id)}
                        title="Next image"
                      >
                        ›
                      </button>
                      
                      {/* Carousel Indicators */}
                      <div className="carousel-indicators">
                        {images.map((_, idx) => (
                          <button
                            key={idx}
                            className={`carousel-dot ${idx === currentIndex ? 'active' : ''}`}
                            onClick={() => setCarouselIndices(prev => ({ ...prev, [item.id]: idx }))}
                            title={`Go to image ${idx + 1}`}
                            aria-label={`Image ${idx + 1}`}
                          />
                        ))}
                      </div>

                      {/* Image Counter */}
                      <div className="carousel-counter">
                        {currentIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                </div>
              )}
              <div className="leadership-content">
                <h3>{item.title || 'Untitled'}</h3>
                {item.role && <p className="role">{item.role}</p>}
                {item.description && <p className="leadership-description">{item.description}</p>}
                {item.sdg && item.sdg.length > 0 && (
                  <div className="sdg-tags">
                    {item.sdg.map(goal => (
                      <span key={goal} className="sdg-tag">{goal}</span>
                    ))}
                  </div>
                )}
                {item.tags && item.tags.length > 0 && (
                  <div className="tags">
                    {item.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="leadership-actions">
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="btn-link">
                      Learn More →
                    </a>
                  )}
                </div>
              </div>
            </div>
            )
          })
        )}
      </div>
    </section>

    {expandedImage && (
      <div 
        className="image-modal-overlay"
        onClick={() => setExpandedImage(null)}
      >
        <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
          <button 
            className="image-modal-close"
            onClick={() => setExpandedImage(null)}
            title="Close (or press Escape)"
          >
            ✕
          </button>
          <img 
            src={expandedImage} 
            alt="Expanded view"
            className="image-modal-image"
          />
        </div>
      </div>
    )}
    </>
  )
}

export default LeadershipView
