import { useMemo } from 'react'
import { useRouter } from '../../router'
import { useLanguage } from '../../i18n/LanguageContext'
import { itemPath, resolveSlugs } from '../../content/items'
import GraphCanvas from '../shared/GraphCanvas'

const NODE_COLOR = '#5b8cff'

/** Read-only public map: experiences written by the admin, connected to show how one leads to another. */
export default function MapView({ nodes, projects, leadership }) {
  const { t, pick } = useLanguage()
  const { navigate } = useRouter()

  const projectSlugs = useMemo(() => resolveSlugs(projects), [projects])
  const leadershipSlugs = useMemo(() => resolveSlugs(leadership), [leadership])

  const targetPath = node => {
    if (!node.experienceKind || !node.experienceId) return null
    if (node.experienceKind === 'projects') {
      const slug = projectSlugs.get(node.experienceId)
      return slug ? itemPath('projects', slug) : null
    }
    const slug = leadershipSlugs.get(node.experienceId)
    return slug ? itemPath('leadership', slug) : null
  }

  const graphNodes = useMemo(() => nodes.map(n => ({
    key: n.id, label: pick(n, 'title') || t('map.untitled'), color: NODE_COLOR, linked: Boolean(targetPath(n)),
  })), [nodes, pick, projectSlugs, leadershipSlugs])

  const edges = useMemo(() => {
    const ids = new Set(nodes.map(n => n.id))
    const list = []
    nodes.forEach(n => (n.dependsOn || []).forEach(dep => { if (ids.has(dep)) list.push({ from: dep, to: n.id }) }))
    return list
  }, [nodes])

  const onNodeClick = key => {
    const node = nodes.find(n => n.id === key)
    const path = node && targetPath(node)
    if (path) navigate(path)
  }

  return (
    <>
      <header className="page-header grid-bg">
        <div className="container fade-up">
          <p className="eyebrow">{t('map.label')}</p>
          <h1 className="section-title">{t('map.title')}</h1>
          <p className="section-subtitle">{t('map.subtitle')}</p>
        </div>
      </header>

      <section className="section section--tight">
        <div className="container">
          {nodes.length === 0 ? (
            <div className="empty-state">{t('map.empty')}</div>
          ) : (
            <>
              <GraphCanvas nodes={graphNodes} edges={edges} onNodeClick={onNodeClick} emptyText={t('map.empty')} />
              <div className="graph-legend" style={{ marginTop: 16 }}>
                <span><i style={{ background: NODE_COLOR }} /> {t('map.legendNode')}</span>
                <span>{t('map.legendLinked')}</span>
                <span>{t('map.legendArrow')}</span>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  )
}
