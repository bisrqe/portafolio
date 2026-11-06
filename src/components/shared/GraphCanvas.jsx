import { useEffect, useMemo, useRef, useState } from 'react'
import { useForceLayout } from './useForceLayout'
import './graphCanvas.css'

/**
 * Pannable, zoomable force-directed graph (Obsidian-style). Presentational: the caller supplies
 * nodes/edges and decides what a click or hover means.
 * nodes: [{ key, label, color, linked? }]   edges: [{ from, to }]
 */
export default function GraphCanvas({ nodes, edges, onNodeClick, activeKey, draggable = true, emptyText }) {
  const wrapRef = useRef(null)
  const [size, setSize] = useState({ width: 800, height: 460 })
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 })
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

  const { positions, startDrag, dragTo, endDrag } = useForceLayout(nodes, edges, size.width, size.height)

  const connected = key => {
    const set = new Set([key])
    edges.forEach(e => { if (e.from === key) set.add(e.to); if (e.to === key) set.add(e.from) })
    return set
  }
  const highlight = useMemo(() => (hoverKey ? connected(hoverKey) : null), [hoverKey, edges])

  const toLocal = (clientX, clientY) => {
    const rect = wrapRef.current.getBoundingClientRect()
    return { x: (clientX - rect.left - view.x) / view.scale, y: (clientY - rect.top - view.y) / view.scale }
  }

  const onNodePointerDown = (e, key) => {
    e.stopPropagation()
    if (!draggable) return
    e.currentTarget.setPointerCapture(e.pointerId)
    startDrag(key)
  }
  const onNodePointerMove = (e, key) => {
    if (!draggable || e.buttons !== 1) return
    const { x, y } = toLocal(e.clientX, e.clientY)
    dragTo(key, x, y)
  }
  const onNodePointerUp = () => draggable && endDrag()

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

  return (
    <div
      className="graph-canvas"
      ref={wrapRef}
      onPointerDown={onBackgroundPointerDown}
      onPointerMove={onBackgroundPointerMove}
      onPointerUp={onBackgroundPointerUp}
      onPointerLeave={onBackgroundPointerUp}
      onWheel={onWheel}
    >
      <svg width={size.width} height={size.height}>
        <defs>
          <marker id="graph-arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
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
                className={`graph-edge${dim ? ' is-dim' : ''}`}
                markerEnd="url(#graph-arrow)"
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
                className={`graph-node${dim ? ' is-dim' : ''}${activeKey === n.key ? ' is-active' : ''}${n.linked ? ' is-linked' : ''}`}
                onPointerDown={e => onNodePointerDown(e, n.key)}
                onPointerMove={e => onNodePointerMove(e, n.key)}
                onPointerUp={onNodePointerUp}
                onPointerEnter={() => setHoverKey(n.key)}
                onPointerLeave={() => setHoverKey(null)}
                onClick={() => onNodeClick?.(n.key)}
              >
                <circle r={r} fill={n.color} />
                <text x={r + 6} y={4}>{n.label}</text>
              </g>
            )
          })}
        </g>
      </svg>
      {nodes.length === 0 && <p className="graph-empty">{emptyText}</p>}
    </div>
  )
}
