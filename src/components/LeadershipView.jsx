import { useState, useMemo } from 'react'
import './LeadershipView.css'

function LeadershipView({ leadership }) {
  const [activeTag, setActiveTag] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState({})

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set()
    leadership.forEach(item => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach(tag => tags.add(tag))
      }
    })
    return Array.from(tags).sort()
  }, [leadership])

  // Filter leadership by selected tag
  const filteredLeadership = activeTag
    ? leadership.filter(item => item.tags && item.tags.includes(activeTag))
    : leadership

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
          filteredLeadership.map(item => {
            const images = item.images || (item.image ? [item.image] : [])
            const currentIdx = currentImageIndex[item.id] || 0
            const currentImage = images[currentIdx]
            
            // Separate featured tags and remaining tags
            const featuredTags = item.featuredTags || []
            const remainingTags = item.tags?.filter(tag => !featuredTags.includes(tag)) || []
            
            return (
            <div key={item.id} className="leadership-card">
              {currentImage && (
                <div className="leadership-image">
                  <img src={currentImage} alt={item.title || 'Leadership'} />
                  {images.length > 1 && (
                    <div className="carousel-controls">
                      <button 
                        className="carousel-btn"
                        onClick={() => setCurrentImageIndex(prev => ({
                          ...prev,
                          [item.id]: (currentIdx - 1 + images.length) % images.length
                        }))}
                      >
                        ‹
                      </button>
                      <span className="carousel-indicator">{currentIdx + 1}/{images.length}</span>
                      <button 
                        className="carousel-btn"
                        onClick={() => setCurrentImageIndex(prev => ({
                          ...prev,
                          [item.id]: (currentIdx + 1) % images.length
                        }))}
                      >
                        ›
                      </button>
                    </div>
                  )}
                </div>
              )}
              <div className="leadership-content">
                <h3>{item.title || 'Untitled'}</h3>
                {item.role && <p className="role">{item.role}</p>}
                {item.description && (
                  <p className="description">
                    {item.description?.split('\n').map((line, idx) => (
                      <span key={idx}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </p>
                )}
                {item.sdg && item.sdg.length > 0 && (
                  <div className="sdg-tags">
                    {item.sdg.map(goal => (
                      <span key={goal} className="sdg-tag">{goal}</span>
                    ))}
                  </div>
                )}
                {(featuredTags.length > 0 || remainingTags.length > 0) && (
                  <div className="tags-section">
                    {featuredTags.length > 0 && (
                      <div className="tags featured-tags">
                        {featuredTags.map((tag, idx) => (
                          <span key={idx} className="tag featured">{tag}</span>
                        ))}
                      </div>
                    )}
                    {remainingTags.length > 0 && (
                      <div className="tags">
                        {remainingTags.map((tag, idx) => (
                          <span key={idx} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            )
          })
        )}
      </div>
    </section>
  )
}

export default LeadershipView
