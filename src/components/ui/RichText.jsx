import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/atom-one-dark.css'

function sanitize(html) {
  return String(html)
    .replace(/<\s*(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|style|iframe|object|embed)[^>]*\/?>/gi, '')
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/\sstyle\s*=\s*(?:"[^"]*"|'[^']*')/gi, '')
}

const PROSE_CLASSES =
  'prose dark:prose-invert prose-headings:font-display prose-a:text-accent prose-img:rounded-xl'

export default function RichText({ html, isHtml = false, className = '' }) {
  if (!html) return null

  if (isHtml) {
    return (
      <div
        className={`rich-text ${PROSE_CLASSES} ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitize(html) }}
      />
    )
  }

  return (
    <div className={`rich-text ${PROSE_CLASSES} ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" />
          ),
        }}
      >
        {html}
      </ReactMarkdown>
    </div>
  )
}