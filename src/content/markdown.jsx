// Small, safe Markdown subset for project texts (no raw HTML is ever injected):
//   paragraphs (blank line), line breaks, **bold**, *italic*, `code`, [links](https://…),
//   bullet lists ("- item") and numbered lists ("1. item").
import { Fragment } from 'react'

const INLINE = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|_[^_\s][^_]*_|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g
const SAFE_URL = /^(https?:|mailto:|\/)/i

function inline(text, keyPrefix) {
  return text.split(INLINE).filter(Boolean).map((part, i) => {
    const key = `${keyPrefix}-${i}`
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) return <strong key={key}>{part.slice(2, -2)}</strong>
    if (part.startsWith('`') && part.endsWith('`')) return <code key={key}>{part.slice(1, -1)}</code>
    if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) return <em key={key}>{part.slice(1, -1)}</em>
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part)
    if (link && SAFE_URL.test(link[2])) {
      const external = /^https?:/i.test(link[2])
      return <a key={key} href={link[2]} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{link[1]}</a>
    }
    // keep single line breaks inside a paragraph
    const lines = part.split('\n')
    return <Fragment key={key}>{lines.map((line, j) => (j ? [<br key={j} />, line] : line))}</Fragment>
  })
}

const BULLET = /^\s*[-*•]\s+/
const NUMBER = /^\s*\d+[.)]\s+/
const HEADING = /^#{2,3}\s+/

// Splits a block into runs: plain lines (one paragraph), bullet lists, numbered lists and headings
function segments(block) {
  const out = []
  block.split('\n').forEach(line => {
    const kind = HEADING.test(line) ? 'h' : BULLET.test(line) ? 'ul' : NUMBER.test(line) ? 'ol' : 'p'
    const last = out[out.length - 1]
    if (last && last.kind === kind && kind !== 'h') last.lines.push(line)
    else out.push({ kind, lines: [line] })
  })
  return out
}

export function Markdown({ text = '', className }) {
  const blocks = text.replace(/\r\n/g, '\n').trim().split(/\n\s*\n/).filter(Boolean)
  const nodes = []
  blocks.forEach((block, i) => segments(block).forEach((seg, j) => {
    const key = `${i}-${j}`
    if (seg.kind === 'ul') nodes.push(<ul key={key}>{seg.lines.map((l, k) => <li key={k}>{inline(l.replace(BULLET, ''), `${key}-${k}`)}</li>)}</ul>)
    else if (seg.kind === 'ol') nodes.push(<ol key={key}>{seg.lines.map((l, k) => <li key={k}>{inline(l.replace(NUMBER, ''), `${key}-${k}`)}</li>)}</ol>)
    else if (seg.kind === 'h') nodes.push(<h3 key={key}>{inline(seg.lines[0].replace(HEADING, ''), key)}</h3>)
    else nodes.push(<p key={key}>{inline(seg.lines.join('\n'), key)}</p>)
  }))
  return <div className={className}>{nodes}</div>
}

/** Plain text version (cards, meta descriptions) */
export function stripMarkdown(text = '') {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(^|\s)[*_]([^*_]+)[*_]/g, '$1$2')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*([-*•]|\d+[.)])\s+/gm, '')
}
