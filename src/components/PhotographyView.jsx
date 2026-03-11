import './PhotographyView.css'

function PhotographyView({ photos }) {
  return (
    <section className="photography-view-section">
      <div className="view-header">
        <h2>Photography & Videography</h2>
        <p>Explore my creative work</p>
      </div>

      <div className="gallery-grid">
        {photos.length === 0 ? (
          <div className="empty-state">
            <p>No photography yet.</p>
          </div>
        ) : (
          photos.map(photo => (
            <div key={photo.id} className="gallery-item">
              <div className="gallery-image">
                <img src={photo.image} alt={photo.title || 'Photography'} />
                <div className="gallery-overlay">
                  {photo.title && <h3>{photo.title}</h3>}
                  {photo.description && <p>{photo.description}</p>}
                  {photo.category && <span className="category-tag">{photo.category}</span>}
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
