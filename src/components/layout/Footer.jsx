import { Link } from '../../router'
import { useLanguage } from '../../i18n/LanguageContext'
import Icon from '../shared/Icon'

import { PROFILE } from '../../content/profile'
import { FEATURES } from '../../content/features'

// Kept for existing imports
export const CONTACT = { email: PROFILE.email, linkedin: PROFILE.linkedin, instagram: PROFILE.instagram, github: PROFILE.github }

export default function Footer() {
  const { t } = useLanguage()
  const year = __BUILD_YEAR__ // build-time constant (vite.config.js) so prerendered HTML hydrates identically
  return (
    <footer className="site-footer">
      <div className="container site-footer-inner">
        <div className="site-footer-brand">
          <Link to="/" className="brand">
            <span className="brand-prompt">&gt;</span>
            <span className="brand-name">bisrqe</span>
          </Link>
          <p>{t('footer.built')}</p>
        </div>

        <nav className="site-footer-links" aria-label="Footer">
          <Link to="/">{t('nav.home')}</Link>
          <Link to="/professional-projects">{t('nav.projects')}</Link>
          <Link to="/leadership">{t('nav.leadership')}</Link>
          {FEATURES.photography && <Link to="/timelessfts">{t('nav.photography')}</Link>}
        </nav>

        <div className="site-footer-social">
          <a href={`mailto:${CONTACT.email}`} className="icon-btn" aria-label="Email"><Icon name="mail" size={18} /></a>
          <a href={CONTACT.linkedin} className="icon-btn" target="_blank" rel="noopener noreferrer me" aria-label="LinkedIn"><Icon name="linkedin" size={18} /></a>
          <a href={CONTACT.github} className="icon-btn" target="_blank" rel="noopener noreferrer me" aria-label="GitHub"><Icon name="github" size={18} /></a>
          {FEATURES.photography && <a href={CONTACT.instagram} className="icon-btn" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Icon name="instagram" size={18} /></a>}
        </div>
      </div>
      <div className="container site-footer-bottom">
        <span>© {year} {PROFILE.name}. {t('footer.rights')}</span>
        <span className="site-footer-mono">Monterrey, MX</span>
      </div>
    </footer>
  )
}
