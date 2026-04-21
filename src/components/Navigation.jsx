import './Navigation.css'

function Navigation({ currentPath }) {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <a href="/" className="logo-link">
            <h2>Portfolio</h2>
          </a>
        </div>
        <ul className="nav-menu">
          <li className="nav-item">
            <a 
              href="/" 
              className={`nav-link ${currentPath === '/' ? 'active' : ''}`}
            >
              Home
            </a>
          </li>
          <li className="nav-item">
            <a 
              href="/professional-projects" 
              className={`nav-link ${currentPath === '/professional-projects' ? 'active' : ''}`}
            >
              Professional Projects
            </a>
          </li>
          <li className="nav-item">
            <a 
              href="/leadership" 
              className={`nav-link ${currentPath === '/leadership' ? 'active' : ''}`}
            >
              Leadership
            </a>
          </li>
          <li className="nav-item">
            <a 
              href="/photography-portfolio" 
              className={`nav-link ${currentPath === '/photography-portfolio' ? 'active' : ''}`}
            >
              Photography
            </a>
          </li>
          <li className="nav-item">
            <a 
              href="/timelessfts" 
              className={`nav-link ${currentPath.startsWith('/timelessfts') ? 'active' : ''}`}
            >
              Timeless
            </a>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navigation
