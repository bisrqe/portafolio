import './Navigation.css'

function Navigation({ currentSection, setCurrentSection }) {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <h2>Portfolio</h2>
        </div>
        <ul className="nav-menu">
          <li className="nav-item">
            <button 
              className={`nav-link ${currentSection === 'home' ? 'active' : ''}`}
              onClick={() => setCurrentSection('home')}
            >
              Home
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${currentSection === 'projects' ? 'active' : ''}`}
              onClick={() => setCurrentSection('projects')}
            >
              Projects
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${currentSection === 'photography' ? 'active' : ''}`}
              onClick={() => setCurrentSection('photography')}
            >
              Photography
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navigation
