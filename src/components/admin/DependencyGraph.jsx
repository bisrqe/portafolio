import { useEffect, useMemo, useRef, useState } from 'react'
import { firestoreApi } from '../../hooks/useFirestore'
import { schedulePublish } from './publish'

const KIND_LABEL = { projects: 'Proyecto', leadership: 'Liderazgo' }
const KIND_COLOR = { projects: '#5b8cff', leadership: '#f5a623' }

// Deterministic pseudo-random seed from a string, so a node's starting spot is stable across renders
function seedFrom(key) {
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0
  return Math.abs(h)
}

function buildNodes(projects, leadership) {
  const nodes = []
  projects.forEach(item => nodes.push({ key: `projects/${item.id}`, id: item.id, kind: 'projects', title: item.title || 'Sin título', dependsOn: item.dependsOn || [] }))
  leadership.forEach(item => nodes.push({ key: `leadership/${item.id}`, id: item.id, kind: 'leadership', title: item.title || 'Sin título', dependsOn: item.dependsOn || [] }))
  return nodes
}

/**
 * Simple force-directed layout (repulsion + spring edges + centering), run in a ref-backed
 * simulation and only committed to React state a few times a second — Obsidian's graph view
 * uses the same idea, just simpler here since node counts stay small (tens, not thousands).
 */
function useForceLayout(nodes, edges, width, height) {
  const posRef = useRef(new Map())
  const velRef = useRef(new Map())
  const dragRef = useRef(null)
  const [, bump] = useState(0)

  useEffect(() => {
    const pos = posRef.current
    const vel = velRef.current
    const keys = new Set(nodes.map(n => n.key))
    // Drop positions for nodes that no longer exist; seed new ones on a circle so they don't all stack at the center
    ;[...pos.keys()].forEach(k => { if (!keys.has(k)) { pos.delete(k); vel.delete(k) } })
    nodes.forEach((n, i) => {
      if (pos.has(n.key)) return
      const angle = (seedFrom(n.key) % 360) * (Math.PI / 180)
      const radius = Math.min(width, height) * 0.3
      pos.set(n.key, { x: width / 2 + Math.cos(angle) * radius + (i % 7) * 3, y: height / 2 + Math.sin(angle) * radius })
      vel.set(n.key, { x: 0, y: 0 })
    })
  }, [nodes, width, height])

  useEffect(() => {
    let raf
    let asleep = false
    const tick = () => {
      const pos = posRef.current
      const vel = velRef.current
      let energy = 0
      const keys = nodes.map(n => n.key)

      keys.forEach(a => {
        if (dragRef.current === a) return
        let fx = 0
        let fy = 0
        // Repulsion between every pair (keeps unconnected nodes from overlapping)
        keys.forEach(b => {
          if (a === b) return
          const pa = pos.get(a)
          const pb = pos.get(b)
          if (!pa || !pb) return
          const dx = pa.x - pb.x
          const dy = pa.y - pb.y
          const d2 = Math.max(dx * dx + dy * dy, 60)
          const f = 2600 / d2
          fx += (dx / Math.sqrt(d2)) * f
          fy += (dy / Math.sqrt(d2)) * f
        })
        // Gentle pull toward the canvas center
        const pa = pos.get(a)
        fx += (width / 2 - pa.x) * 0.004
        fy += (height / 2 - pa.y) * 0.004
        const v = vel.get(a)
        v.x = (v.x + fx) * 0.78
        v.y = (v.y + fy) * 0.78
      })

      // Springs pull dependency edges toward a resting length
      edges.forEach(({ from, to }) => {
        if (dragRef.current === from && dragRef.current === to) return
        const pa = pos.get(from)
        const pb = pos.get(to)
        if (!pa || !pb) return
        const dx = pb.x - pa.x
        const dy = pb.y - pa.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const rest = 150
        const pull = (dist - rest) * 0.02
        const ux = dx / dist
        const uy = dy / dist
        if (dragRef.current !== from) { const v = vel.get(from); v.x += ux * pull; v.y += uy * pull }
        if (dragRef.current !== to) { const v = vel.get(to); v.x -= ux * pull; v.y -= uy * pull }
      })

      keys.forEach(k => {
        if (dragRef.current === k) return
        const p = pos.get(k)
        const v = vel.get(k)
        p.x = Math.min(width - 24, Math.max(24, p.x + v.x))
        p.y = Math.min(height - 24, Math.max(24, p.y + v.y))
        energy += v.x * v.x + v.y * v.y
      })

      bump(n => n + 1)
      asleep = energy < 0.05 && !dragRef.current
      if (!asleep) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [nodes, edges, width, height])

  const wake = () => bump(n => n + 1)
  const startDrag = key => { dragRef.current = key; requestAnimationFrame(function loop() { if (dragRef.current) { wake(); requestAnimationFrame(loop) } }) }
  const dragTo = (key, x, y) => { posRef.current.set(key, { x, y }); bump(n => n + 1) }
  const endDrag = () => { dragRef.current = null }

  return { positions: posRef.current, startDrag, dragTo, endDrag }
}

function DependencyPanel({ node, nodesByKey, onClose, onSave }) {
  const [selected, setSelected] = useState(() => new Set(node.dependsOn))
  const [saving, setSaving] = useState(false)
  useEffect(() => setSelected(new Set(node.dependsOn)), [node.key])

  const others = useMemo(() => [...nodesByKey.values()].filter(n => n.key !== node.key).sort((a, b) => a.title.localeCompare(b.title)), [nodesByKey, node.key])
  const feeds = useMemo(() => [...nodesByKey.values()].filter(n => n.dependsOn.includes(node.key)), [nodesByKey, node.key])

  const toggle = key => setSelected(prev => {
    const next = new Set(prev)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    return next
  })

  const save = async () => {
    setSaving(true)
    try {
      await onSave(node, [...selected])
    } finally {
      setSaving(false)
    }
  }

  return (
    <aside className="adm-graph-panel">
      <div className="adm-panel-head">
        <h3>{node.title}</h3>
        <button type="button" className="adm-btn adm-btn--icon" onClick={onClose} aria-label="Cerrar">✕</button>
      </div>
      <p className="adm-hint">{KIND_LABEL[node.kind]} · marca de qué experiencias se alimenta esta.</p>

      <div className="adm-graph-deplist">
        {others.map(o => (
          <label key={o.key} className="adm-check adm-graph-depitem">
            <input type="checkbox" checked={selected.has(o.key)} onChange={() => toggle(o.key)} />
            <span className="adm-graph-dot" style={{ background: KIND_COLOR[o.kind] }} />
            {o.title}
          </label>
        ))}
        {others.length === 0 && <p className="adm-muted adm-small">No hay más elementos todavía.</p>}
      </div>

      {feeds.length > 0 && (
        <div className="adm-graph-feeds">
          <span className="adm-label">Alimenta a</span>
          <ul>
            {feeds.map(f => <li key={f.key} className="adm-muted adm-small">{f.title}</li>)}
          </ul>
        </div>
      )}

      <div className="adm-actions">
        <button type="button" className="adm-btn" onClick={onClose}>Cancelar</button>
        <button type="button" className="adm-btn adm-btn--primary" onClick={save} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
      </div>
    </aside>
  )
}

/** Obsidian-style graph: every project/leadership entry as a node, edges drawn from what feeds into what. */
export default function DependencyGraph({ projects, leadership, notify }) {
  const wrapRef = useRef(null)
  const [size, setSize] = useState({ width: 800, height: 520 })
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 })
  const [activeKey, setActiveKey] = useState(null)
  const [hoverKey, setHoverKey] = useState(null)
  const panRef = useRef(null)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return undefined
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      if (width > 0 && height > 0) setSize({ width, height: Math.max(420, height) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const nodes = useMemo(() => buildNodes(projects, leadership), [projects, leadership])
  const nodesByKey = useMemo(() => new Map(nodes.map(n => [n.key, n])), [nodes])
  const edges = useMemo(() => {
    const list = []
    nodes.forEach(n => n.dependsOn.forEach(dep => { if (nodesByKey.has(dep)) list.push({ from: dep, to: n.key }) }))
    return list
  }, [nodes, nodesByKey])

  const { positions, startDrag, dragTo, endDrag } = useForceLayout(nodes, edges, size.width, size.height)
  const activeNode = activeKey ? nodesByKey.get(activeKey) : null

  const connected = key => {
    const set = new Set([key])
    edges.forEach(e => { if (e.from === key) set.add(e.to); if (e.to === key) set.add(e.from) })
    return set
  }
  const highlight = hoverKey ? connected(hoverKey) : null

  const toLocal = (clientX, clientY) => {
    const rect = wrapRef.current.getBoundingClientRect()
    return { x: (clientX - rect.left - view.x) / view.scale, y: (clientY - rect.top - view.y) / view.scale }
  }

  const onNodePointerDown = (e, key) => {
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    startDrag(key)
  }
  const onNodePointerMove = (e, key) => {
    if (e.buttons !== 1) return
    const { x, y } = toLocal(e.clientX, e.clientY)
    dragTo(key, x, y)
  }
  const onNodePointerUp = () => endDrag()

  const onBackgroundPointerDown = e => { panRef.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y } }
  const onBackgroundPointerMove = e => {
    if (!panRef.current) return
    const dx = e.clientX - panRef.current.x
    const dy = e.clientY - panRef.current.y
    setView(v => ({ ...v, x: panRef.current.vx + dx, y: panRef.current.vy + dy }))
  }
  const onBackgroundPointerUp = () => { panRef.current = null }

  const onWheel = e => {
    e.preventDefault()
    const factor = e.deltaY < 0 ? 1.08 : 0.93
    setView(v => ({ ...v, scale: Math.min(2.5, Math.max(0.35, v.scale * factor)) }))
  }

  const saveDependencies = async (node, dependsOn) => {
    try {
      await firestoreApi.update(node.kind, node.id, { dependsOn })
      schedulePublish()
      notify(`Conexiones de «${node.title}» actualizadas.`)
      setActiveKey(null)
    } catch (err) {
      notify(`No se pudo guardar: ${err.message}`, 'error')
    }
  }

  return (
    <section className="adm-panel adm-graph-panel-wrap">
      <div className="adm-panel-head">
        <h2>Mapa de experiencias</h2>
        <p className="adm-hint">Arrastra los nodos para acomodarlos, usa la rueda del mouse para acercar, y haz clic en un nodo para marcar de qué se alimenta.</p>
      </div>

      <div className="adm-graph-layout">
        <div
          className="adm-graph-canvas"
          ref={wrapRef}
          onPointerDown={onBackgroundPointerDown}
          onPointerMove={onBackgroundPointerMove}
          onPointerUp={onBackgroundPointerUp}
          onPointerLeave={onBackgroundPointerUp}
          onWheel={onWheel}
        >
          <svg width={size.width} height={size.height}>
            <defs>
              <marker id="dep-arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 Z" fill="var(--text-soft)" />
              </marker>
            </defs>
            <g transform={`translate(${view.x} ${view.y}) scale(${view.scale})`}>
              {edges.map(({ from, to }) => {
                const a = positions.get(from)
                const b = positions.get(to)
                if (!a || !b) return null
                const dim = highlight && !(highlight.has(from) && highlight.has(to))
                return (
                  <line
                    key={`${from}→${to}`}
                    x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                    className={`adm-graph-edge${dim ? ' is-dim' : ''}`}
                    markerEnd="url(#dep-arrow)"
                  />
                )
              })}
              {nodes.map(n => {
                const p = positions.get(n.key)
                if (!p) return null
                const degree = edges.filter(e => e.from === n.key || e.to === n.key).length
                const r = 9 + Math.min(degree, 6) * 1.6
                const dim = highlight && !highlight.has(n.key)
                return (
                  <g
                    key={n.key}
                    transform={`translate(${p.x} ${p.y})`}
                    className={`adm-graph-node${dim ? ' is-dim' : ''}${activeKey === n.key ? ' is-active' : ''}`}
                    onPointerDown={e => onNodePointerDown(e, n.key)}
                    onPointerMove={e => onNodePointerMove(e, n.key)}
                    onPointerUp={onNodePointerUp}
                    onPointerEnter={() => setHoverKey(n.key)}
                    onPointerLeave={() => setHoverKey(null)}
                    onClick={() => setActiveKey(n.key)}
                  >
                    <circle r={r} fill={KIND_COLOR[n.kind]} />
                    <text x={r + 6} y={4}>{n.title}</text>
                  </g>
                )
              })}
            </g>
          </svg>
          {nodes.length === 0 && <p className="adm-empty">Agrega proyectos o experiencias de liderazgo para verlos aquí.</p>}
        </div>

        {activeNode && (
          <DependencyPanel node={activeNode} nodesByKey={nodesByKey} onClose={() => setActiveKey(null)} onSave={saveDependencies} />
        )}
      </div>

      <div className="adm-graph-legend">
        <span><i style={{ background: KIND_COLOR.projects }} /> Proyectos</span>
        <span><i style={{ background: KIND_COLOR.leadership }} /> Liderazgo</span>
        <span className="adm-muted adm-small">La flecha va de lo que alimenta hacia lo que depende de ello.</span>
      </div>
    </section>
  )
}
