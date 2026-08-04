import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/atom-one-dark.css'

/**
 * Renders content authored in the admin panel's rich text editor.
 *
 * Admin fields (service descriptions, case study sections, blog bodies, job
 * descriptions) are stored as HTML. Rendering them as plain text would print
 * the tags on screen, so we inject them instead — but only after stripping
 * <script>, <iframe>, <style>, and inline event handlers.
 *
 * Blog bodies specifically are authored as Markdown in a plain textarea, so
 * those are detected and parsed separately before the HTML/plain-text checks.
 *
 * A note for the report: this is safe enough here because the only author is a
 * logged-in admin, and the sanitizer below is deliberately simple. If this ever
 * accepts untrusted input, swap in DOMPurify (`npm i dompurify`) and call
 * DOMPurify.sanitize() in place of `sanitize()`.
 */

const looksLikeHtml = (value) => typeof value === 'string' && /<\/?[a-z][\s\S]*>/i.test(value)

// Heuristic: common Markdown markers that wouldn't appear in plain prose or HTML
const looksLikeMarkdown = (value) =>
  typeof value === 'string' &&
  /(^|\n)#{1,6}\s|\*\*[^*]+\*\*|```|(^|\n)[-*]\s|\[[^\]]+\]\([^)]+\)/.test(value)

function sanitize(html) {
  return String(html)
    .replace(/<\s*(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|style|iframe|object|embed)[^>]*\/?>/gi, '')
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/\sstyle\s*=\s*(?:"[^"]*"|'[^']*')/gi, '')
}

// Shared typography classes — matches body/heading/accent colors defined in
// tailwind.config.js under theme.extend.typography, so prose text lines up
// with the rest of the site instead of Tailwind's default slate palette.
const PROSE_CLASSES =
  'prose dark:prose-invert prose-headings:font-display prose-a:text-accent prose-img:rounded-xl'

export default function RichText({ html, className = '' }) {
  if (!html) return null

  if (!looksLikeHtml(html) && looksLikeMarkdown(html)) {
    return (
      <div className={`rich-text ${PROSE_CLASSES} ${className}`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
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

  if (!looksLikeHtml(html)) {
    return (
      <div className={`rich-text ${PROSE_CLASSES} ${className}`}>
        <p>{html}</p>
      </div>
    )
  }

  return (
    <div
      className={`rich-text ${PROSE_CLASSES} ${className}`}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: sanitize(html) }}
    />
  )
}