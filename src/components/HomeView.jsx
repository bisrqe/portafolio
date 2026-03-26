import { useState } from 'react'
import './HomeView.css'

function HomeView({ homeContent, cvUrl }) {
  const [cvLoading, setCvLoading] = useState(false)

  const handleDownloadCV = async () => {
    if (!cvUrl) {
      alert('CV URL not available')
      return
    }

    try {
      setCvLoading(true)
      
      // Ensure we have the correct Cloudinary URL format for PDFs
      let finalUrl = cvUrl
      
      // If it's a Cloudinary URL without /raw/ and has pdf extension, convert it
      if (cvUrl.includes('cloudinary.com') && !cvUrl.includes('/raw/')) {
        // Replace /image/ with /raw/ to get the correct Cloudinary raw file endpoint
        finalUrl = cvUrl.replace('/image/upload', '/raw/upload')
      }
      
      // Add the attachment parameter to force download
      if (!finalUrl.includes('?')) {
        finalUrl = `${finalUrl}?attachment=true`
      } else {
        finalUrl = `${finalUrl}&attachment=true`
      }
      
      // Try to download using fetch + blob for better reliability
      try {
        const response = await fetch(finalUrl, {
          method: 'GET',
          mode: 'cors',
          credentials: 'omit'
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const blob = await response.blob()
        
        // Check if we got a valid PDF
        if (blob.type !== 'application/pdf') {
          console.warn('Response is not a PDF. Type:', blob.type)
        }
        
        // Create blob URL and download
        const blobUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = 'Sanjay_Adhithyan_CV.pdf'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(blobUrl)
      } catch (fetchError) {
        console.error('Fetch error:', fetchError)
        // Fallback: try direct download without fetch
        const link = document.createElement('a')
        link.href = finalUrl
        link.download = 'Sanjay_Adhithyan_CV.pdf'
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error('Error downloading CV:', error)
      alert('Failed to download CV. Trying to open in new tab...')
      // Fallback: open in new tab
      try {
        let fallbackUrl = cvUrl
        if (!fallbackUrl.includes('?')) {
          fallbackUrl = `${fallbackUrl}?dl=1` // Alternative parameter
        }
        window.open(fallbackUrl, '_blank')
      } catch (e) {
        alert('Could not open CV. Please check if the file is properly uploaded.')
      }
    } finally {
      setCvLoading(false)
    }
  }

  const summary = {
    name: homeContent?.name,
    tagline: homeContent?.tagline,
    description: homeContent?.description,
    heroImage: homeContent?.heroImage
  }
  const achievements = homeContent?.achievements || []
  const abilities = homeContent?.abilities || []

  return (
    <div className="home-view">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              {summary.name || 'Hey, I\'m Your Name'}
            </h1>
            <p className="hero-subtitle">
              <em>{summary.tagline || 'Product Designer'}</em>
            </p>
            <p className="hero-description">
              {summary.description || 'Welcome to my portfolio. Here you\'ll find my work, achievements, and more.'}
            </p>
            <div className="hero-actions">
              {cvUrl && (
                <button 
                  className="btn-download-cv"
                  onClick={handleDownloadCV}
                  disabled={cvLoading}
                >
                  {cvLoading ? '⏳ Downloading...' : '📄 Download CV'}
                </button>
              )}
              <a href="#abilities" className="btn-explore">
                Explore My Work ↓
              </a>
            </div>
          </div>
          {summary.heroImage && (
            <div className="hero-image">
              <img src={summary.heroImage} alt={summary.name} />
            </div>
          )}
        </div>
      </section>


    {/* Summary Section */}
      {homeContent?.fullBio && (
        <section className="summary-section">
          <div className="summary-container">
            <div className="summary-label">ABOUT</div>
            <h2>Who I Am</h2>
            <div className="summary-content">
              <p>{homeContent.fullBio}</p>
            </div>
          </div>
        </section>
      )}


      {/* Stats Section */}
      {achievements.length > 0 && (
        <section className="stats-section">
          <div className="stats-container">
            <div className="section-label">ACHIEVEMENTS</div>
            <h2>Highlights & Impact</h2>
            <div className="stats-grid">
              {achievements.map((stat) => (
                <div key={stat.id} className="stat-card">
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Abilities Section */}
      {abilities.length > 0 && (
        <section className="abilities-section" id="abilities">
          <div className="abilities-container">
            <div className="section-label">EXPERTISE</div>
            <h2>Skills & Abilities</h2>
            <div className="abilities-grid">
              {abilities.map((ability) => (
                <div key={ability.id} className="ability-card">
                  <div className="ability-icon">{ability.icon || '✦'}</div>
                  <h3>{ability.title}</h3>
                  <p>{ability.description}</p>
                  {ability.tags && ability.tags.length > 0 && (
                    <div className="ability-tags">
                      {ability.tags.map((tag, idx) => (
                        <span key={idx} className="ability-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2>Let's Create Something Amazing</h2>
          <p>Interested in collaborating? Let's chat about your next project.</p>
          <a href="#contact" className="btn-get-started">
            Get in Touch →
          </a>
        </div>
      </section>
    </div>
  )
}

export default HomeView
