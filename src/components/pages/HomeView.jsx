import { useCallback, useState } from 'react'
import { Link } from '../../router'
import { useLanguage } from '../../i18n/LanguageContext'
import { useSiteSettings } from '../../hooks/useSiteSettings'
import { CONTACT } from '../layout/Footer'
import ItemCard from '../shared/ItemCard'
import Lightbox from '../shared/Lightbox'
import Icon from '../shared/Icon'
import { featuredItems } from '../shared/sort'
import '../shared/shared.css'
import './home.css'

// String literal token for the code card
const Str = ({ v }) => <span className="tk-s">{`'${v}'`}</span>

function Hero({ home, cvUrl }) {
  const { t, pick } = useLanguage()
  const name = home.name || t('hero.fallbackName')
  const tagline = pick(home, 'tagline') || t('hero.fallbackTagline')
  const description = pick(home, 'description') || t('hero.fallbackDescription')

  return (
    <section className="hero grid-bg">
      <div className="hero-glow" aria-hidden="true" />
      <div className="container hero-inner">
        <div className="hero-copy fade-up">
          <p className="eyebrow">{t('hero.kicker')}</p>
          <h1 className="hero-title">{name}</h1>
          <p className="hero-tagline">{tagline}</p>
          <p className="hero-desc">{description}</p>

          <div className="hero-actions">
            {cvUrl && (
              <a href={cvUrl} target="_blank" rel="noopener noreferrer" className="btn btn--primary">
                <Icon name="download" /> {t('hero.downloadCv')}
              </a>
            )}
            <a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer" className={`btn ${cvUrl ? 'btn--ghost' : 'btn--primary'}`}>
              <Icon name="linkedin" /> {t('hero.linkedin')}
            </a>
            <a href={`mailto:${CONTACT.email}`} className="btn btn--ghost">
              <Icon name="mail" /> {t('hero.contact')}
            </a>
          </div>

          <ul className="hero-meta">
            <li><Icon name="pin" size={16} /> {t('hero.location')}</li>
            <li><Icon name="globe" size={16} /> {t('hero.languages')}</li>
          </ul>
        </div>

        <div className="hero-visual fade-up" style={{ animationDelay: '0.12s' }}>
          <div className="window">
            <div className="window-bar" aria-hidden="true">
              <span /><span /><span />
              <code>~/bisrqe/{home.heroImage ? 'profile.jpg' : 'profile.js'}</code>
            </div>
            {home.heroImage ? (
              <img className="window-img" src={home.heroImage} alt={name} />
            ) : (
              <pre className="window-code" aria-hidden="true">
                <code>
                  <span className="tk-k">const</span> <span className="tk-v">bis</span> = {'{'}{'\n'}
                  {'  '}role: <Str v={tagline} />,{'\n'}
                  {'  '}based: <Str v={t('hero.location')} />,{'\n'}
                  {'  '}languages: [{['ES', 'EN', 'FR', 'DE'].map((l, i) => <span key={l}>{i > 0 && ', '}<Str v={l} /></span>)}],{'\n'}
                  {'}'}
                </code>
              </pre>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function About({ home }) {
  const { t, pick } = useLanguage()
  const bio = pick(home, 'fullBio')
  if (!bio) return null
  return (
    <section className="section" id="about">
      <div className="container about-grid">
        <div>
          <p className="eyebrow">{t('about.label')}</p>
          <h2 className="section-title">{t('about.title')}</h2>
          <div className="about-text">
            {bio.split(/\n{2,}/).map((paragraph, i) => <p key={i}>{paragraph}</p>)}
          </div>
        </div>
        <aside className="facts card">
          <p className="facts-title">{t('about.facts')}</p>
          <dl>
            <div><dt>{t('about.basedIn')}</dt><dd>{t('hero.location')}</dd></div>
            <div><dt>{t('about.speaks')}</dt><dd>{t('hero.languages')}</dd></div>
            <div><dt>{t('about.email')}</dt><dd><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></dd></div>
          </dl>
        </aside>
      </div>
    </section>
  )
}

function Metrics({ achievements }) {
  const { t, pick } = useLanguage()
  if (achievements.length === 0) return null
  return (
    <section className="section section--tight metrics-section">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">{t('metrics.label')}</p>
          <h2 className="section-title">{t('metrics.title')}</h2>
        </div>
        <div className="metrics">
          {achievements.map((stat, i) => (
            <div key={stat.id ?? i} className="metric">
              <span className="metric-value">{stat.number}</span>
              <span className="metric-label">{pick(stat, 'label')}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Expertise({ abilities }) {
  const { t, pick } = useLanguage()
  if (abilities.length === 0) return null
  return (
    <section className="section" id="expertise">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">{t('expertise.label')}</p>
          <h2 className="section-title">{t('expertise.title')}</h2>
        </div>
        <div className="skills">
          {abilities.map((ability, i) => (
            <article key={ability.id ?? i} className="skill card">
              <span className="skill-index">{String(i + 1).padStart(2, '0')}</span>
              <h3>{pick(ability, 'title')}</h3>
              {pick(ability, 'description') && <p>{pick(ability, 'description')}</p>}
              {ability.tags?.length > 0 && (
                <div className="chips">
                  {ability.tags.map(tag => <span key={tag} className="chip">{tag}</span>)}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Featured({ items, kind, to, onExpand }) {
  const { t } = useLanguage()
  const { tagLabel } = useSiteSettings()
  if (items.length === 0) return null
  const isLeadership = kind === 'leadership'
  return (
    <section className="section">
      <div className="container">
        <div className="section-head section-head--row">
          <div>
            <p className="eyebrow">{t(isLeadership ? 'featured.leadershipLabel' : 'featured.projectsLabel')}</p>
            <h2 className="section-title">{t(isLeadership ? 'featured.leadershipTitle' : 'featured.projectsTitle')}</h2>
          </div>
          <Link to={to} className="link-arrow">{t('featured.viewAll')} <Icon name="arrow-right" /></Link>
        </div>
        <div className="item-grid item-grid--3">
          {items.map(item => (
            <ItemCard key={item.id} item={item} kind={isLeadership ? 'leadership' : 'project'} tagLabel={tagLabel} onExpand={onExpand} variant="compact" />
          ))}
        </div>
      </div>
    </section>
  )
}

function CallToAction() {
  const { t } = useLanguage()
  return (
    <section className="section">
      <div className="container">
        <div className="cta card grid-bg">
          <p className="eyebrow">{t('cta.label')}</p>
          <h2 className="section-title">{t('cta.title')}</h2>
          <p className="section-subtitle">{t('cta.text')}</p>
          <div className="cta-actions">
            <a href={`mailto:${CONTACT.email}`} className="btn btn--primary"><Icon name="mail" /> {t('cta.button')}</a>
            <a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn--ghost"><Icon name="linkedin" /> LinkedIn</a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function HomeView({ home, projects, leadership }) {
  const [expanded, setExpanded] = useState(null)
  const closeLightbox = useCallback(() => setExpanded(null), [])

  return (
    <>
      <Hero home={home} cvUrl={home.cvUrl} />
      <About home={home} />
      <Metrics achievements={home.achievements || []} />
      <Expertise abilities={home.abilities || []} />
      <Featured items={featuredItems(projects)} kind="projects" to="/professional-projects" onExpand={setExpanded} />
      <Featured items={featuredItems(leadership)} kind="leadership" to="/leadership" onExpand={setExpanded} />
      <CallToAction />
      <Lightbox src={expanded} onClose={closeLightbox} />
    </>
  )
}
