import { useEffect, useMemo, useState } from 'react'
import { firestoreApi } from '../../hooks/useFirestore'
import { SETTINGS_PATH, useSiteSettings } from '../../hooks/useSiteSettings'
import { translateStrings } from './autoTranslate'
import { schedulePublish } from './publish'

const LANGS = ['es', 'fr']
const collectTags = items => [...new Set(items.flatMap(item => item.tags || []))].sort((a, b) => a.localeCompare(b))

export default function TagSettings({ projects, leadership, notify }) {
  const { visibleTags, tagLabels } = useSiteSettings()
  const [visible, setVisible] = useState(visibleTags)
  const [labels, setLabels] = useState(tagLabels)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)

  // Refresh from Firestore while there are no local edits (compared by value)
  const remoteKey = JSON.stringify([visibleTags, tagLabels])
  useEffect(() => {
    if (!dirty) {
      const [v, l] = JSON.parse(remoteKey)
      setVisible(v)
      setLabels(l)
    }
  }, [remoteKey, dirty])

  const groups = useMemo(() => [
    { kind: 'projects', title: 'Proyectos', tags: collectTags(projects) },
    { kind: 'leadership', title: 'Liderazgo', tags: collectTags(leadership) },
  ], [projects, leadership])

  const toggle = (kind, tag) => {
    const list = visible[kind]
    setVisible({ ...visible, [kind]: list.includes(tag) ? list.filter(t => t !== tag) : [...list, tag] })
    setDirty(true)
  }
  const setLabel = (tag, lang, value) => {
    setLabels({ ...labels, [tag]: { ...(labels[tag] || {}), [lang]: value } })
    setDirty(true)
  }

  const allTags = [...new Set(groups.flatMap(g => g.tags))]

  // Machine-translates the tag names that have no Spanish/French label yet
  const fillMissing = async current => {
    let next = current
    let count = 0
    for (const lang of LANGS) {
      const missing = allTags.filter(tag => !next[tag]?.[lang]?.trim())
      if (missing.length === 0) continue
      const translated = await translateStrings(missing, lang)
      missing.forEach((tag, i) => {
        next = { ...next, [tag]: { ...(next[tag] || {}), [lang]: translated[i] } }
        count++
      })
    }
    return { next, count }
  }

  const translateNow = async () => {
    setSaving(true)
    try {
      const { next, count } = await fillMissing(labels)
      setLabels(next)
      setDirty(true)
      notify(count ? `${count} nombres traducidos. Revísalos antes de guardar.` : 'Todas las etiquetas ya tienen traducción.')
    } catch (err) {
      notify(`Traducción automática fallida: ${err.message}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  const save = async () => {
    setSaving(true)
    let toSave = labels
    let warning = ''
    try {
      toSave = (await fillMissing(labels)).next
      setLabels(toSave)
    } catch (err) {
      warning = ` (la traducción automática falló: ${err.message})`
    }
    try {
      await firestoreApi.save(SETTINGS_PATH, { visibleTags: visible, tagLabels: toSave })
      setDirty(false)
      schedulePublish()
      notify(`Configuración de etiquetas guardada para todos los visitantes${warning}.`, warning ? 'error' : 'success')
    } catch (err) {
      notify(`No se pudo guardar: ${err.message}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="adm-panel">
      <div className="adm-panel-head">
        <h2>Etiquetas</h2>
        <button type="button" className="adm-btn" onClick={translateNow} disabled={saving}>Traducir vacías</button>
      </div>
      <p className="adm-hint">
        Marca qué etiquetas aparecen como filtros en cada página. Los nombres se escriben en inglés; al guardar, los que no tengan
        traducción al español o al francés se traducen automáticamente y puedes corregirlos aquí.
      </p>

      {groups.map(group => (
        <div key={group.kind} className="adm-card">
          <h3 className="adm-subhead">{group.title}</h3>
          {group.tags.length === 0 ? (
            <p className="adm-muted">No hay etiquetas todavía.</p>
          ) : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr><th>Filtro visible</th><th>Etiqueta (EN)</th>{LANGS.map(l => <th key={l}>{l.toUpperCase()}</th>)}</tr>
                </thead>
                <tbody>
                  {group.tags.map(tag => (
                    <tr key={tag}>
                      <td><input type="checkbox" checked={visible[group.kind].includes(tag)} onChange={() => toggle(group.kind, tag)} aria-label={`Mostrar ${tag}`} /></td>
                      <td className="adm-mono">{tag}</td>
                      {LANGS.map(l => (
                        <td key={l}>
                          <input type="text" value={labels[tag]?.[l] || ''} placeholder={tag} onChange={e => setLabel(tag, l, e.target.value)} aria-label={`${tag} (${l})`} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}

      <div className="adm-actions">
        {dirty && <span className="adm-muted adm-small">Cambios sin guardar</span>}
        <button type="button" className="adm-btn adm-btn--primary adm-btn--lg" onClick={save} disabled={saving || !dirty}>
          {saving ? 'Guardando…' : 'Guardar etiquetas'}
        </button>
      </div>
    </section>
  )
}
