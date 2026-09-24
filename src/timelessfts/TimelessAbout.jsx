import { Link } from '../router'
import { useLanguage } from '../i18n/LanguageContext'
import { cld } from './galleries'

const PORTRAIT = 'https://res.cloudinary.com/dobiuvljw/image/upload/v1776904888/personal_portrait_bc2p1y_7e0f4f.jpg'

export default function TimelessAbout() {
  const { t } = useLanguage()
  const [before, after] = t('timeless.about.closing').split('{link}')

  return (
    <>
      <header className="page-hero">
        <h1>{t('timeless.about.title')}</h1>
      </header>

      <main className="about-wrapper">
        <section className="about-profile">
          <img src={cld(PORTRAIT, 600)} alt={t('timeless.about.photoAlt')} width="280" height="280" />
        </section>

        <section className="about-bio">
          <h2>{t('timeless.about.greeting')}</h2>
          {t('timeless.about.paragraphs').map((paragraph, i) => <p key={i}>{paragraph}</p>)}
          <p>
            {before}
            <Link to="/timelessfts/contact">
              {t('timeless.about.closingLink')}
            </Link>
            {after}
          </p>
        </section>

        <section className="about-cv">
          <h2>{t('timeless.about.cvTitle')}</h2>
          <div className="cv-timeline">
            {t('timeless.about.cv').map(item => (
              <div className="cv-item" key={item.title}>
                <span className="cv-year">{item.year}</span>
                <div className="cv-detail">
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}
