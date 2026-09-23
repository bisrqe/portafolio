import { useMemo, useState } from 'react'
import { firestoreApi } from '../../hooks/useFirestore'
import { getImages } from '../shared/media'
import { sortItems } from '../shared/sort'
import { Field, FramingEditor, ImagesField, LangTabs, ListInput, TText } from './fields'
import { migrateLegacy, toPayload } from './translate'
import { autoTranslate, countPending } from './autoTranslate'

const CONFIG = {
  projects: { singular: 'proyecto', title: 'Proyectos', hasRole: false, hasSdg: false },
  leadership: { singular: 'experiencia de liderazgo', title: 'Liderazgo', hasRole: true, hasSdg: true },
}

const emptyItem = () => ({
  title: '', role: '', description: '', link: '', images: [], tags: [], sdg: [],
  featured: false, order: '', positionX: 0, positionY: 0, zoom: 1, translations: {}, i18nMeta: {},
})

const schemaFor = cfg => ({ fields: cfg.hasRole ? ['title', 'role', 'description'] : ['title', 'description'] })

function toForm(item) {
  const images = getImages(item)
  const form = { ...emptyItem(), ...item, images, order: item.order ?? '', translations: item.translations || {}, i18nMeta: item.i18nMeta || {} }
  return migrateLegacy(form, ['title', 'role', 'description'])
}

export default function ItemsEditor({ collectionName, items, notify }) {
  const cfg = CONFIG[collectionName]
  const [form, setForm] = useState(null) // null = list view
  const [lang, setLang] = useState('base')
  const [busy, setBusy] = useState('') // '' | 'saving' | 'translating' | 'bulk'
  const sorted = useMemo(() => sortItems(items), [items])
  const schema = useMemo(() => schemaFor(cfg), [cfg])
  const pendingItems = useMemo(() => sorted.map(toForm).filter(item => countPending(item, schema) > 0), [sorted, schema])

  const openNew = () => { setForm(emptyItem()); setLang('base') }
  const openEdit = item => { setForm(toForm(item)); setLang('base') }
  const close = () => setForm(null)

  const translateNow = async () => {
    setBusy('translating')
    const { result, count, error } = await autoTranslate(form, schema)
    setForm(result)
    setBusy('')
    if (error) notify(`Traducción automática incompleta: ${error}`, 'error')
    else notify(count ? `${count === 1 ? '1 texto traducido' : `${count} textos traducidos`}. Revísalos en las pestañas ES y FR.` : 'No había textos pendientes de traducir.')
  }

  // Translates every saved item that still has missing or outdated automatic translations
  const translateAll = async () => {
    setBusy('bulk')
    let done = 0
    let failed = ''
    for (const item of pendingItems) {
      const { result, error } = await autoTranslate(item, schema)
      if (error) { failed = error; break }
      const { translations, i18nMeta } = toPayload(result)
      try {
        await firestoreApi.update(collectionName, item.id, { translations, i18nMeta })
        done++
      } catch (err) {
        failed = err.message
        break
      }
    }
    setBusy('')
    if (failed) notify(`Se tradujeron ${done} elementos; después falló: ${failed}`, 'error')
    else notify(`${done} elementos traducidos al español y al francés.`)
  }

  const save = async e => {
    e.preventDefault()
    setBusy('saving')
    const { result: translated, count, error } = await autoTranslate(form, schema)
    setForm(translated)
    const payload = toPayload(translated)
    payload.image = payload.images[0] || ''
    payload.order = payload.order === '' ? null : Number(payload.order)
    if (!cfg.hasRole) delete payload.role
    if (!cfg.hasSdg) delete payload.sdg
    try {
      if (form.id) await firestoreApi.update(collectionName, form.id, payload)
      else await firestoreApi.add(collectionName, payload)
      const base = form.id ? 'Cambios guardados' : `Nuevo ${cfg.singular} publicado`
      if (error) notify(`${base}, pero la traducción automática falló (${error}). Se mostrará el inglés hasta traducir.`, 'error')
      else notify(count ? `${base}; ${count === 1 ? '1 texto traducido' : `${count} textos traducidos`} automáticamente.` : `${base}.`)
      close()
    } catch (err) {
      notify(`No se pudo guardar: ${err.message}`, 'error')
    } finally {
      setBusy('')
    }
  }

  const remove = async item => {
    if (!window.confirm(`¿Eliminar «${item.title || 'sin título'}»? Esta acción no se puede deshacer.`)) return
    try {
      await firestoreApi.remove(collectionName, item.id)
      notify('Elemento eliminado.')
    } catch (err) {
      notify(`No se pudo eliminar: ${err.message}`, 'error')
    }
  }

  if (form) {
    const cover = form.images[0]
    return (
      <form className="adm-panel" onSubmit={save}>
        <div className="adm-panel-head">
          <h2>{form.id ? `Editar ${cfg.singular}` : `Nuevo ${cfg.singular}`}</h2>
          <div className="adm-row">
            <button type="button" className="adm-btn" onClick={translateNow} disabled={Boolean(busy) || countPending(form, schema) === 0}>
              {busy === 'translating' ? 'Traduciendo…' : 'Traducir ahora'}
            </button>
            <LangTabs value={lang} onChange={setLang} />
          </div>
        </div>
        <p className="adm-hint">
          Escribe en inglés. Al guardar, el español y el francés se traducen automáticamente; puedes corregirlos en sus pestañas.
          Imágenes, enlaces y etiquetas son comunes a todos los idiomas.
        </p>

        <div className={cfg.hasRole ? 'adm-grid-2' : ''}>
          <Field label="Título *">
            <TText obj={form} field="title" lang={lang} onChange={setForm} required />
          </Field>
          {cfg.hasRole && (
            <Field label="Rol *">
              <TText obj={form} field="role" lang={lang} onChange={setForm} required placeholder="Coordinador de iniciativas" />
            </Field>
          )}
        </div>
        <Field label="Descripción">
          <TText obj={form} field="description" lang={lang} onChange={setForm} multiline rows={5} />
        </Field>

        <div className="adm-grid-2">
          <Field label="Enlace">
            <input type="url" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} placeholder="https://…" />
          </Field>
          <Field label="Etiquetas (separadas por comas)" hint="Los nombres de las etiquetas se traducen en la pestaña «Etiquetas».">
            <ListInput value={form.tags} onChange={tags => setForm({ ...form, tags })} placeholder="Professional Experience, Hackathons" />
          </Field>
        </div>

        {cfg.hasSdg && (
          <Field label="ODS (opcional, separados por comas)">
            <ListInput value={form.sdg} onChange={sdg => setForm({ ...form, sdg })} placeholder="ODS 4, ODS 13" />
          </Field>
        )}

        <Field label="Imágenes" hint="La primera imagen es la portada; las demás aparecen en el carrusel.">
          <ImagesField images={form.images} onChange={images => setForm({ ...form, images })} />
        </Field>

        {cover && (
          <Field label="Encuadre de la portada">
            <FramingEditor src={cover} value={form} onChange={framing => setForm({ ...form, ...framing })} />
          </Field>
        )}

        <div className="adm-grid-2">
          <label className="adm-check">
            <input type="checkbox" checked={Boolean(form.featured)} onChange={e => setForm({ ...form, featured: e.target.checked })} />
            Destacar en la página de inicio
          </label>
          <Field label="Orden (opcional)" hint="Número menor = aparece primero. Vacío = más reciente primero.">
            <input type="number" className="adm-w-sm" value={form.order ?? ''} onChange={e => setForm({ ...form, order: e.target.value })} />
          </Field>
        </div>

        <div className="adm-actions">
          <button type="button" className="adm-btn" onClick={close}>Cancelar</button>
          <button type="submit" className="adm-btn adm-btn--primary adm-btn--lg" disabled={Boolean(busy)}>{busy === 'saving' ? 'Guardando y traduciendo…' : 'Guardar'}</button>
        </div>
      </form>
    )
  }

  return (
    <section className="adm-panel">
      <div className="adm-panel-head">
        <h2>{cfg.title}</h2>
        <div className="adm-row">
          {pendingItems.length > 0 && (
            <button type="button" className="adm-btn" onClick={translateAll} disabled={Boolean(busy)} title="Traduce al español y al francés los elementos que aún no tienen traducción">
              {busy === 'bulk' ? 'Traduciendo…' : `Traducir pendientes (${pendingItems.length})`}
            </button>
          )}
          <button type="button" className="adm-btn adm-btn--primary" onClick={openNew}>+ Agregar</button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="adm-empty">Aún no hay elementos.</p>
      ) : (
        <ul className="adm-list">
          {sorted.map(item => {
            const cover = getImages(item)[0]
            const langs = Object.keys(item.translations || {}).filter(l => l !== 'en')
            return (
              <li key={item.id} className="adm-list-item">
                <div className="adm-list-thumb">{cover ? <img src={cover} alt="" /> : <span>—</span>}</div>
                <div className="adm-list-body">
                  <strong>{item.title || 'Sin título'}</strong>
                  {item.role && <span className="adm-muted adm-small">{item.role}</span>}
                  <div className="adm-badges">
                    {item.featured && <span className="adm-badge adm-badge--accent">Destacado</span>}
                    {item.order != null && item.order !== '' && <span className="adm-badge">#{item.order}</span>}
                    {['es', 'fr'].map(l => (
                      <span key={l} className={`adm-badge ${langs.includes(l) ? 'adm-badge--ok' : 'adm-badge--off'}`} title={langs.includes(l) ? 'Traducción guardada' : 'Sin traducción'}>
                        {l.toUpperCase()}
                      </span>
                    ))}
                    {(item.tags || []).map(tag => <span key={tag} className="adm-badge">{tag}</span>)}
                  </div>
                </div>
                <div className="adm-list-actions">
                  <button type="button" className="adm-btn" onClick={() => openEdit(item)}>Editar</button>
                  <button type="button" className="adm-btn adm-btn--danger" onClick={() => remove(item)}>Eliminar</button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
