import { useState, useMemo } from 'react'
import './LeadershipView.css'

function LeadershipView({ leadership }) {
  const [activeTag, setActiveTag] = useState(null)
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
                <div className="leadership-image">
                  <img src={item.image} alt={item.title || 'Leadership'} />
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
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}

export default LeadershipView
