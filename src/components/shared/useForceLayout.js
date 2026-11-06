import { useEffect, useRef, useState } from 'react'

// Deterministic pseudo-random seed from a string, so a node's starting spot is stable across renders
function seedFrom(key) {
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0
  return Math.abs(h)
}

/**
 * Simple force-directed layout (repulsion + spring edges + centering), run in a ref-backed
 * simulation and only committed to React state once per frame — Obsidian's graph view uses the
 * same idea, just simpler here since node counts stay small (tens, not thousands).
 * `nodes`: [{ key }]  `edges`: [{ from, to }] (keys)
 */
export function useForceLayout(nodes, edges, width, height) {
  const posRef = useRef(new Map())
  const velRef = useRef(new Map())
  const dragRef = useRef(null)
  const [, bump] = useState(0)

  // Seeded synchronously (not in an effect) so the very first render — including on the server —
  // already places every node on its starting circle instead of leaving the graph empty until hydration.
  {
    const pos = posRef.current
    const vel = velRef.current
    const keys = new Set(nodes.map(n => n.key))
    ;[...pos.keys()].forEach(k => { if (!keys.has(k)) { pos.delete(k); vel.delete(k) } })
    nodes.forEach((n, i) => {
      if (pos.has(n.key)) return
      const angle = (seedFrom(n.key) % 360) * (Math.PI / 180)
      const radius = Math.min(width, height) * 0.3
      pos.set(n.key, { x: width / 2 + Math.cos(angle) * radius + (i % 7) * 3, y: height / 2 + Math.sin(angle) * radius })
      vel.set(n.key, { x: 0, y: 0 })
    })
  }

  useEffect(() => {
    let raf
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
      const asleep = energy < 0.05 && !dragRef.current
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
