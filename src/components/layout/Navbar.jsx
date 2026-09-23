import { useEffect, useState } from 'react'
import { Link, useRouter } from '../../router'
import { useLanguage } from '../../i18n/LanguageContext'
import { LanguageSwitcher, ThemeToggle } from './Controls'
import Icon from '../shared/Icon'
import './layout.css'

const LINKS = [
  { to: '/', key: 'nav.home' },
  { to: '/professional-projects', key: 'nav.projects' },
  { to: '/leadership', key: 'nav.leadership' },
  { to: '/timelessfts', key: 'nav.photography' },
]

export default function Navbar() {
  const { path } = useRouter()
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false) }, [path])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const isActive = to => (to === '/' ? path === '/' : path.startsWith(to))

  return (
    <header className={`navbar ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}>
      <div className="container navbar-inner">
        <Link to="/" className="brand" aria-label="Bismarck Animas — home">
          <span className="brand-prompt">&gt;</span>
          <span className="brand-name">bisrqe</span>
          <span className="brand-caret" aria-hidden="true" />
        </Link>

        <nav className="navbar-links" id="site-nav" aria-label="Main">
          {LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`navbar-link ${isActive(link.to) ? 'is-active' : ''}`}
              aria-current={isActive(link.to) ? 'page' : undefined}
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="navbar-actions">
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            type="button"
            className="icon-btn navbar-burger"
            aria-expanded={open}
            aria-controls="site-nav"
            aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
            onClick={() => setOpen(o => !o)}
          >
            <Icon name={open ? 'close' : 'menu'} size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}
