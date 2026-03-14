import { useState, useMemo } from 'react'
import './LeadershipView.css'

function LeadershipView({ leadership }) {
  const [activeTag, setActiveTag] = useState(null)
  const [imageIndices, setImageIndices] = useState({})
  const visibleTags = ['EGS', 'Leadership Iniciatives', 'International Events', 'Social Service']
  
  // Handle carousel navigation
  const handleImageNavigation = (itemId, direction) => {
    const item = leadership.find(l => l.id === itemId)
    if (!item) return
    
    const images = Array.isArray(item.images) ? item.images : [item.image].filter(Boolean)
    if (images.length === 0) return
    
    const currentIndex = imageIndices[itemId] || 0
    const newIndex = direction === 'next'
      ? (currentIndex + 1) % images.length
      : (currentIndex - 1 + images.length) % images.length
    
    setImageIndices(prev => ({ ...prev, [itemId]: newIndex }))
  }

  const getLeadershipImage = (item) => {
    const images = Array.isArray(item.images) ? item.images : [item.image].filter(Boolean)
    if (images.length === 0) return null
    const index = imageIndices[item.id] || 0
    return images[index]
  }

  const getLeadershipImageCount = (item) => {
    const images = Array.isArray(item.images) ? item.images : [item.image].filter(Boolean)
    return images.length
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
}, [leadership])

  // Filter leadership by selected tag
  const filteredLeadership = (() => {
    let filtered = activeTag
      ? leadership.filter(item => item.tags && item.tags.includes(activeTag))
      : leadership
    
    // Sort by date (newest first)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.date || '1970-01-01')
      const dateB = new Date(b.date || '1970-01-01')
      return dateB - dateA
    })
  })()

  return (
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
          filteredLeadership.map(item => (
            <div key={item.id} className="leadership-card">
              {(item.image || item.images) && (
                <div className="leadership-image-container">
                  <div className="leadership-image">
                    <img src={getLeadershipImage(item) || item.image} alt={item.title || 'Leadership'} />
                  </div>
                  {getLeadershipImageCount(item) > 1 && (
                    <>
                      <button 
                        className="carousel-nav carousel-prev"
                        onClick={() => handleImageNavigation(item.id, 'prev')}
                        title="Previous image"
                      >
                        ‹
                      </button>
                      <button 
                        className="carousel-nav carousel-next"
                        onClick={() => handleImageNavigation(item.id, 'next')}
                        title="Next image"
                      >
                        ›
                      </button>
                      <div className="carousel-counter">
                        {(imageIndices[item.id] || 0) + 1} / {getLeadershipImageCount(item)}
                      </div>
                    </>
                  )}
                </div>
              )}
              <div className="leadership-content">
                <h3>{item.title || 'Untitled'}</h3>
                {item.role && <p className="role">{item.role}</p>}
                {item.date && (
                  <p className="leadership-date">{new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                )}
                {item.description && <p className="description">{item.description}</p>}
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
          ))
        )}
      </div>
    </section>
  )
}

export default LeadershipView
