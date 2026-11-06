import { useMemo, useState } from 'react'
import { firestoreApi } from '../../hooks/useFirestore'
import { schedulePublish } from './publish'
import { autoTranslate, countPending } from './autoTranslate'
import { cleanI18n, toPayload } from './translate'
import { Field, LangTabs, TText } from './fields'
import GraphCanvas from '../shared/GraphCanvas'

const NODE_COLOR = '#5b8cff'
const SCHEMA = { fields: ['title'], lists: {} }

const emptyNode = () => ({ title: '', experienceKind: '', experienceId: '', dependsOn: [], translations: {}, i18nMeta: {} })

function toForm(node) {
  return { ...emptyNode(), ...node, dependsOn: node.dependsOn || [], translations: node.translations || {}, i18nMeta: node.i18nMeta || {} }
}

/** Title + optional "jump to this page" link + dependency checklist — what the admin fills in when adding a node. */
function NodeForm({ form, setForm, lang, setLang, experiences, otherNodes, busy, onTranslate, onSave, onDelete, onClose }) {
  const toggleDep = key => setForm({ ...form, dependsOn: form.dependsOn.includes(key) ? form.dependsOn.filter(k => k !== key) : [...form.dependsOn, key] })
  const experienceValue = form.experienceKind ? `${form.experienceKind}/${form.experienceId}` : ''

  return (
    <aside className="adm-graph-panel">
      <div className="adm-panel-head">
        <h3>{form.id ? 'Editar nodo' : 'Nuevo nodo'}</h3>
        <button type="button" className="adm-btn adm-btn--icon" onClick={onClose} aria-label="Cerrar">✕</button>
      </div>

      <div className="adm-row">
        <button type="button" className="adm-btn" onClick={onTranslate} disabled={busy || countPending(form, SCHEMA) === 0}>
          {busy === 'translating' ? 'Traduciendo…' : 'Traducir ahora'}
        </button>
        <LangTabs value={lang} onChange={setLang} />
      </div>

      <Field label="Título *">
        <TText obj={form} field="title" lang={lang} onChange={setForm} required placeholder="Ej. CEIBA" />
      </Field>

      <Field label="Página a la que lleva (opcional)" hint="Si el nodo representa un proyecto o experiencia ya publicada, al hacer clic en él los visitantes irán a esa página.">
        <select
          value={experienceValue}
          onChange={e => {
            const [kind, id] = e.target.value ? e.target.value.split('/') : ['', '']
            setForm({ ...form, experienceKind: kind, experienceId: id })
          }}
        >
          <option value="">Ninguna — solo texto</option>
          <optgroup label="Proyectos">
            {experiences.filter(x => x.kind === 'projects').map(x => <option key={x.key} value={x.key}>{x.title}</option>)}
          </optgroup>
          <optgroup label="Liderazgo">
            {experiences.filter(x => x.kind === 'leadership').map(x => <option key={x.key} value={x.key}>{x.title}</option>)}
          </optgroup>
        </select>
      </Field>

      <Field label="Depende de (se alimenta de estos nodos)">
        <div className="adm-graph-deplist">
          {otherNodes.map(o => (
            <label key={o.id} className="adm-check adm-graph-depitem">
              <input type="checkbox" checked={form.dependsOn.includes(o.id)} onChange={() => toggleDep(o.id)} />
              <span className="adm-graph-dot" style={{ background: NODE_COLOR }} />
              {o.title || 'Sin título'}
            </label>
          ))}
          {otherNodes.length === 0 && <p className="adm-muted adm-small">No hay más nodos todavía.</p>}
        </div>
      </Field>

      <div className="adm-actions">
        {form.id && <button type="button" className="adm-btn adm-btn--danger" onClick={onDelete}>Eliminar</button>}
        <button type="button" className="adm-btn" onClick={onClose}>Cancelar</button>
        <button type="button" className="adm-btn adm-btn--primary" onClick={onSave} disabled={Boolean(busy) || !form.title.trim()}>
          {busy === 'saving' ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </aside>
  )
}

/**
 * Manual node editor for the public map (Mapa tab): every node is written by hand here and can
 * optionally point at a project/leadership page. Dependencies between nodes draw the arrows.
 */
export default function DependencyGraph({ nodes, projects, leadership, notify }) {
  const [selected, setSelected] = useState(null) // null | 'new' | node id
  const [form, setForm] = useState(null)
  const [lang, setLang] = useState('base')
  const [busy, setBusy] = useState('')

  const experiences = useMemo(() => [
    ...projects.map(i => ({ key: `projects/${i.id}`, kind: 'projects', title: i.title || 'Sin título' })),
    ...leadership.map(i => ({ key: `leadership/${i.id}`, kind: 'leadership', title: i.title || 'Sin título' })),
  ], [projects, leadership])
  const experienceTitle = key => experiences.find(e => e.key === key)?.title

  const graphNodes = useMemo(() => nodes.map(n => ({
    key: n.id, label: n.title || 'Sin título', color: NODE_COLOR, linked: Boolean(n.experienceKind),
  })), [nodes])
  const edges = useMemo(() => {
    const ids = new Set(nodes.map(n => n.id))
    const list = []
    nodes.forEach(n => (n.dependsOn || []).forEach(dep => { if (ids.has(dep)) list.push({ from: dep, to: n.id }) }))
    return list
  }, [nodes])

  const openNew = () => { setSelected('new'); setForm(toForm({})); setLang('base') }
  const openNode = key => {
    const node = nodes.find(n => n.id === key)
    if (!node) return
    setSelected(key)
    setForm(toForm(node))
    setLang('base')
  }
  const close = () => { setSelected(null); setForm(null) }

  const translateNow = async () => {
    setBusy('translating')
    const { result, error } = await autoTranslate(form, SCHEMA)
    setForm(result)
    setBusy('')
    if (error) notify(`Traducción automática incompleta: ${error}`, 'error')
    else notify('Título traducido. Revísalo en las pestañas ES y FR.')
  }

  const save = async () => {
    setBusy('saving')
    const { result: translated, error } = await autoTranslate(form, SCHEMA)
    const payload = toPayload(cleanI18n(translated))
    try {
      if (form.id) await firestoreApi.update('graphNodes', form.id, payload)
      else await firestoreApi.add('graphNodes', payload)
      schedulePublish()
      notify(error ? `Nodo guardado, pero la traducción automática falló (${error}).` : 'Nodo guardado.', error ? 'error' : 'success')
      close()
    } catch (err) {
      notify(`No se pudo guardar: ${err.message}`, 'error')
    } finally {
      setBusy('')
    }
  }

  const remove = async () => {
    if (!window.confirm(`¿Eliminar el nodo «${form.title || 'sin título'}»? Esta acción no se puede deshacer.`)) return
    try {
      await firestoreApi.remove('graphNodes', form.id)
      schedulePublish()
      notify('Nodo eliminado.')
      close()
    } catch (err) {
      notify(`No se pudo eliminar: ${err.message}`, 'error')
    }
  }

  const otherNodes = useMemo(() => nodes.filter(n => n.id !== form?.id), [nodes, form?.id])

  return (
    <section className="adm-panel adm-graph-panel-wrap">
      <div className="adm-panel-head">
        <div>
          <h2>Mapa de experiencias</h2>
          <p className="adm-hint">Escribe tú los nodos y conéctalos para mostrar cómo una experiencia lleva a otra (ej. GLF → EGS → CEIBA → capacitaciones). Es público: cualquiera que visite el sitio lo puede ver, pero solo tú puedes editarlo aquí.</p>
        </div>
        <button type="button" className="adm-btn adm-btn--primary" onClick={openNew}>+ Agregar nodo</button>
      </div>

      <div className="adm-graph-layout">
        <GraphCanvas
          nodes={graphNodes}
          edges={edges}
          activeKey={selected}
          onNodeClick={openNode}
          emptyText="Agrega tu primer nodo para empezar a dibujar el mapa."
        />
        {form && (
          <NodeForm
            form={form}
            setForm={setForm}
            lang={lang}
            setLang={setLang}
            experiences={experiences}
            otherNodes={otherNodes}
            busy={busy}
            onTranslate={translateNow}
            onSave={save}
            onDelete={remove}
            onClose={close}
          />
        )}
      </div>

      <div className="graph-legend">
        <span><i style={{ background: NODE_COLOR }} /> Nodo</span>
        <span>La flecha va de lo que alimenta hacia lo que depende de ello.</span>
        {nodes.length > 0 && (
          <span>
            {nodes.filter(n => n.experienceKind).length} de {nodes.length} nodos enlazan a una página
            {nodes.some(n => n.experienceKind && !experienceTitle(`${n.experienceKind}/${n.experienceId}`)) ? ' (algún enlace apunta a una experiencia eliminada)' : ''}.
          </span>
        )}
      </div>
    </section>
  )
}
