import { Link } from '../../router'
import { useLanguage } from '../../i18n/LanguageContext'
import { useSiteSettings } from '../../hooks/useSiteSettings'
import { CONTACT } from '../layout/Footer'
import ItemCard from '../shared/ItemCard'
import Icon from '../shared/Icon'
import { featuredItems } from '../shared/sort'
import { resolveHome, splitItems } from '../../content/homeContent'
import { itemPath, resolveSlugs } from '../../content/items'
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

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function About({ home }) {
  const { t, pick } = useLanguage()
  const bio = pick(home, 'fullBio')
  const areas = home.expertiseAreas || []
  if (!bio && areas.length === 0) return null
  return (
    <section className="section" id="about">
      <div className="container">
        <div className="about-grid">
          <div>
            <p className="eyebrow">{t('about.label')}</p>
            <h2 className="section-title">{t('about.title')}</h2>
            {bio && (
              <div className="about-text">
                {bio.split(/\n{2,}/).map((paragraph, i) => <p key={i}>{paragraph}</p>)}
              </div>
            )}
          </div>
          <aside className="facts card">
            <p className="panel-title">{t('about.facts')}</p>
            <dl>
              {(home.quickFacts || []).map((fact, i) => {
                const value = pick(fact, 'value')
                return (
                  <div key={fact.id ?? i}>
                    <dt>{pick(fact, 'label')}</dt>
                    <dd>{EMAIL.test(value.trim()) ? <a href={`mailto:${value.trim()}`}>{value}</a> : value}</dd>
                  </div>
                )
              })}
            </dl>
          </aside>
        </div>

        {areas.length > 0 && (
          <div className="areas card">
            <p className="panel-title">{t('about.keyAreas')}</p>
            <div className="areas-grid">
              {areas.map((area, i) => (
                <article key={area.id ?? i} className="area">
                  <span className="skill-index">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{pick(area, 'title')}</h3>
                  <p>{pick(area, 'description')}</p>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function Education({ items }) {
  const { t, pick } = useLanguage()
  if (items.length === 0) return null
  return (
    <section className="section" id="education">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">{t('education.label')}</p>
          <h2 className="section-title">{t('education.title')}</h2>
        </div>
        <ol className="edu-list">
          {items.map((entry, i) => {
            const dates = pick(entry, 'dates')
            const location = pick(entry, 'location')
            const detail = pick(entry, 'detail')
            return (
              <li key={entry.id ?? i} className="edu-item">
                <span className="edu-dot" aria-hidden="true" />
                <div className="edu-meta">
                  {dates && <span className="edu-dates">{dates}</span>}
                  {location && <span className="edu-location">{location}</span>}
                </div>
                <div className="edu-body card">
                  <h3>{pick(entry, 'program')}</h3>
                  <p className="edu-institution">
                    {entry.url ? <a href={entry.url} target="_blank" rel="noopener noreferrer">{entry.institution}</a> : entry.institution}
                  </p>
                  {detail && <p className="edu-detail">{detail}</p>}
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

function Highlights({ items }) {
  const { t, pick } = useLanguage()
  if (items.length === 0) return null
  return (
    <section className="section section--tight metrics-section">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">{t('metrics.label')}</p>
          <h2 className="section-title">{t('metrics.title')}</h2>
        </div>
        <div className="highlights">
          {items.map((item, i) => {
            const value = pick(item, 'value')
            const detail = pick(item, 'detail')
            return (
              <article key={item.id ?? i} className={`highlight highlight--${item.kind === 'metric' ? 'metric' : 'award'}`}>
                <div className="highlight-top">
                  {item.kind !== 'metric' && <span className="highlight-icon"><Icon name="award" size={18} /></span>}
                  {value && <span className="highlight-value">{value}</span>}
                </div>
                <h3 className="highlight-label">{pick(item, 'label')}</h3>
                {detail && <p className="highlight-detail">{detail}</p>}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Expertise({ abilities, toolkit }) {
  const { t, pick } = useLanguage()
  if (abilities.length === 0 && toolkit.length === 0) return null
  return (
    <section className="section" id="expertise">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">{t('expertise.label')}</p>
          <h2 className="section-title">{t('expertise.title')}</h2>
        </div>
        {abilities.length > 0 && (
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
        )}
        {toolkit.length > 0 && (
          <div className="toolkit card">
            <p className="panel-title">{t('expertise.toolkit')}</p>
            <dl>
              {toolkit.map((row, i) => (
                <div key={row.id ?? i} className="toolkit-row">
                  <dt>{pick(row, 'label')}</dt>
                  <dd className="chips">
                    {splitItems(pick(row, 'items')).map(item => <span key={item} className="chip">{item}</span>)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </section>
  )
}

function Featured({ items, all, kind, to }) {
  const { t } = useLanguage()
  const { tagLabel } = useSiteSettings()
  if (items.length === 0) return null
  const slugs = resolveSlugs(all)
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
            <ItemCard key={item.id} item={item} kind={kind} href={itemPath(kind, slugs.get(item.id))} tagLabel={tagLabel} variant="compact" />
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

export default function HomeView({ home: rawHome, projects, leadership }) {
  const home = resolveHome(rawHome)

  return (
    <>
      <Hero home={home} cvUrl={home.cvUrl} />
      <About home={home} />
      <Education items={home.education} />
      <Highlights items={home.highlights} />
      <Expertise abilities={home.abilities} toolkit={home.toolkit} />
      <Featured items={featuredItems(projects)} all={projects} kind="projects" to="/professional-projects" />
      <Featured items={featuredItems(leadership)} all={leadership} kind="leadership" to="/leadership" />
      <CallToAction />
    </>
  )
}
