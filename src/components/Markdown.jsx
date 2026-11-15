import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { useMemo } from 'react'

marked.setOptions({ gfm: true, breaks: false })

// External links open in a new tab; everything passes through DOMPurify first.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && /^https?:/i.test(node.getAttribute('href') || '')) {
    node.setAttribute('target', '_blank')
    node.setAttribute('rel', 'noreferrer noopener')
  }
  if (node.tagName === 'IMG') node.setAttribute('loading', 'lazy')
})

export default function Markdown({ source, className }) {
  const html = useMemo(() => DOMPurify.sanitize(marked.parse(source || '')), [source])
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
