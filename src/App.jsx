import { lazy, Suspense, useEffect } from 'react'
import { Link, useRouter } from './router'
import { useLanguage } from './i18n/LanguageContext'
import { HOME_PATH, useCollection, useDocument } from './hooks/useFirestore'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import HomeView from './components/pages/HomeView'
import CollectionPage from './components/pages/CollectionPage'
import TimelessApp from './timelessfts/TimelessApp'

// The admin area is only loaded when someone visits /admin
const AdminPage = lazy(() => import('./components/admin/AdminPage'))



function Loader() {
  const { t } = useLanguage()
  return <div className="app-loader"><span>{t('common.loading')}</span></div>
}

function NotFound() {
  const { t } = useLanguage()
  return (
    <section className="page-header grid-bg">
      <div className="container">
        <p className="eyebrow">404</p>
        <h1 className="section-title">{t('common.notFound')}</h1>
        <p className="section-subtitle"><Link to="/" className="link-arrow">{t('common.backHome')}</Link></p>
      </div>
    </section>
  )
}

export default function App() {
  const { path } = useRouter()
  const { t } = useLanguage()
  const home = useDocument(HOME_PATH)
  const projects = useCollection('projects')
  const leadership = useCollection('leadership')

  useEffect(() => {
    document.title = t('meta.title')
    document.querySelector('meta[name="description"]')?.setAttribute('content', t('meta.description'))
  }, [t])

  if (path.startsWith('/timelessfts')) return <TimelessApp />

  if (path.startsWith('/admin')) {
    return (
      <Suspense fallback={<Loader />}>
        <AdminPage home={home.data} projects={projects.items} leadership={leadership.items} />
      </Suspense>
    )
  }

  const hasCachedHome = Object.keys(home.data).length > 0
  if (home.loading && !hasCachedHome) return <Loader />

  let page
  if (path === '/') page = <HomeView home={home.data} projects={projects.items} leadership={leadership.items} />
  else if (path === '/professional-projects') page = <CollectionPage kind="projects" items={projects.items} />
  else if (path === '/leadership') page = <CollectionPage kind="leadership" items={leadership.items} />
  else page = <NotFound />

  return (
    <div className="site">
      <Navbar />
      <main className="site-main" key={path}>{page}</main>
      <Footer />
    </div>
  )
}
