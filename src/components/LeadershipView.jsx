import { useState, useMemo } from 'react'
import './LeadershipView.css'

function LeadershipView({ leadership }) {
  const [activeTag, setActiveTag] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState({})
  const visibleTags = ['EGS', 'Leadership Iniciatives', 'International Events', 'Social Service']
  
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
          filteredLeadership.map(item => (
            <div key={item.id} className="leadership-card">
              {item.image && (
                <div className="leadership-image-container">
                  {(() => {
                    const images = (item.images && Array.isArray(item.images) && item.images.length > 0) ? item.images : (item.image ? [item.image] : [])
                    const currentIdx = currentImageIndex[item.id] || 0
                    const currentImage = images[currentIdx]

                    return (
                      <>
                        <div className="leadership-image">
                          <img src={currentImage} alt={item.title || 'Leadership'} />
                        </div>
                        {images.length > 1 && (
                          <>
                            <button
                              className="carousel-btn carousel-prev"
                              onClick={() => setCurrentImageIndex(prev => ({
                                ...prev,
                                [item.id]: (currentIdx - 1 + images.length) % images.length
                              }))}
                            >
                              ❮
                            </button>
                            <button
                              className="carousel-btn carousel-next"
                              onClick={() => setCurrentImageIndex(prev => ({
                                ...prev,
                                [item.id]: (currentIdx + 1) % images.length
                              }))}
                            >
                              ❯
                            </button>
                            <div className="carousel-indicators">
                              {images.map((_, idx) => (
                                <button
                                  key={idx}
                                  className={`indicator ${idx === currentIdx ? 'active' : ''}`}
                                  onClick={() => setCurrentImageIndex(prev => ({
                                    ...prev,
                                    [item.id]: idx
                                  }))}
                                  aria-label={`Image ${idx + 1}`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    )
                  })()}
                </div>
              )}
              <div className="leadership-content">
                <h3>{item.title || 'Untitled'}</h3>
                {item.role && <p className="role">{item.role}</p>}
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
