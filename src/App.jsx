import { lazy, Suspense, useEffect, useMemo } from 'react'
import { Link, useRouter } from './router'
import { useLanguage } from './i18n/LanguageContext'
import { HOME_PATH, useCollection, useDocument } from './hooks/useFirestore'
import { matchRoute } from './seo/routes'
import { applyHead, buildHead } from './seo/head'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import HomeView from './components/pages/HomeView'
import CollectionPage from './components/pages/CollectionPage'
import ItemDetailPage from './components/pages/ItemDetailPage'
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
  const { path, lang } = useRouter()
  const home = useDocument(HOME_PATH)
  const projects = useCollection('projects')
  const leadership = useCollection('leadership')

  const data = useMemo(
    () => ({ [HOME_PATH]: home.data, projects: projects.items, leadership: leadership.items }),
    [home.data, projects.items, leadership.items],
  )
  const route = matchRoute(path, data)

  // Keep <title>, description, canonical, hreflang and Open Graph in sync after client-side navigation
  useEffect(() => {
    if (route.name === 'admin') return
    applyHead(buildHead({ lang, path, data, siteUrl: window.location.origin }))
  }, [lang, path, data, route.name])

  if (route.name === 'timeless') return <TimelessApp />

  if (route.name === 'admin') {
    return (
      <Suspense fallback={<Loader />}>
        <AdminPage home={home.data} projects={projects.items} leadership={leadership.items} />
      </Suspense>
    )
  }

  const hasHome = Object.keys(home.data).length > 0
  if (home.loading && !hasHome) return <Loader />

  let page
  if (route.name === 'home') {
    page = <HomeView home={home.data} projects={projects.items} leadership={leadership.items} />
  } else if (route.name === 'list') {
    page = <CollectionPage kind={route.kind} items={data[route.kind]} />
  } else if (route.name === 'detail') {
    const loading = route.kind === 'leadership' ? leadership.loading : projects.loading
    if (route.item) page = <ItemDetailPage key={route.item.id} kind={route.kind} item={route.item} items={data[route.kind]} />
    else page = loading ? <Loader /> : <NotFound />
  } else {
    page = <NotFound />
  }

  return (
    <div className="site">
      <Navbar />
      <main className="site-main" key={path}>{page}</main>
      <Footer />
    </div>
  )
}
