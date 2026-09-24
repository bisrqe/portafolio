import { useCallback, useEffect, useState } from 'react'
import HomeEditor from './HomeEditor'
import ItemsEditor from './ItemsEditor'
import TagSettings from './TagSettings'
import { onPublishState, publishNow } from './publish'

const TABS = [
  { id: 'home', label: 'Inicio' },
  { id: 'projects', label: 'Proyectos' },
  { id: 'leadership', label: 'Liderazgo' },
  { id: 'tags', label: 'Etiquetas' },
]

export default function AdminDashboard({ home, projects, leadership, user, onSignOut }) {
  const [tab, setTab] = useState('projects')
  const [notice, setNotice] = useState(null)

  const notify = useCallback((text, type = 'success') => setNotice({ text, type, at: Date.now() }), [])

  useEffect(() => {
    if (!notice) return undefined
    const id = setTimeout(() => setNotice(null), 4500)
    return () => clearTimeout(id)
  }, [notice])

  const counts = { projects: projects.length, leadership: leadership.length }

  // Status of the static-site rebuild that follows each save (see publish.js)
  const [publish, setPublish] = useState({ state: 'idle' })
  useEffect(() => { onPublishState(setPublish) }, [])
  const PUBLISH_TEXT = {
    scheduled: 'Versión pública: se actualizará en unos segundos…',
    running: 'Versión pública: solicitando actualización…',
    done: 'Versión pública: actualizándose en Vercel (1–2 min).',
    disabled: 'Versión pública sin actualización automática: configura VERCEL_DEPLOY_HOOK_URL en Vercel.',
    error: `No se pudo actualizar la versión pública: ${publish.reason || ''}`,
  }

  return (
    <div className="adm">
      <header className="adm-header">
        <div>
          <p className="adm-mono adm-accent">&gt; bisrqe/admin</p>
          <h1>Panel de administración</h1>
        </div>
        <div className="adm-row">
          <span className="adm-muted adm-small">{user?.email}</span>
          <a href="/" className="adm-btn" target="_blank" rel="noopener noreferrer">Ver sitio</a>
          <button type="button" className="adm-btn" onClick={onSignOut}>Cerrar sesión</button>
        </div>
      </header>

      {publish.state !== 'idle' && (
        <div className={`adm-publish adm-publish--${publish.state}`} role="status">
          <span>{PUBLISH_TEXT[publish.state]}</span>
          {publish.state === 'scheduled' && <button type="button" className="adm-textbtn" onClick={publishNow}>Actualizar ahora</button>}
          {publish.state === 'error' && <button type="button" className="adm-textbtn" onClick={publishNow}>Reintentar</button>}
        </div>
      )}

      <nav className="adm-tabs" role="tablist">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={tab === t.id ? 'is-active' : ''}
            onClick={() => setTab(t.id)}
          >
            {t.label}{counts[t.id] != null && <span className="adm-count">{counts[t.id]}</span>}
          </button>
        ))}
      </nav>

      <main className="adm-main">
        {tab === 'home' && <HomeEditor home={home} notify={notify} />}
        {tab === 'projects' && <ItemsEditor key="projects" collectionName="projects" items={projects} notify={notify} />}
        {tab === 'leadership' && <ItemsEditor key="leadership" collectionName="leadership" items={leadership} notify={notify} />}
        {tab === 'tags' && <TagSettings projects={projects} leadership={leadership} notify={notify} />}
      </main>

      {notice && (
        <div className={`adm-toast adm-toast--${notice.type}`} role="status" key={notice.at}>{notice.text}</div>
      )}
    </div>
  )
}
