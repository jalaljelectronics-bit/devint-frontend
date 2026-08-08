// src/pages/BlogDetail.jsx
import { useParams } from 'react-router-dom'
import Seo from '../components/ui/Seo.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Button from '../components/ui/Button.jsx'
import Reveal from '../components/ui/Reveal.jsx'
import { useAsync } from '../lib/useAsync.js'
import { getBlogBySlug } from '../lib/api.js'
import RichText from '../components/ui/RichText.jsx'

function readingTime(content) {
  if (!content || typeof content !== 'string') return 1
  const words = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<[^>]+>/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

export default function BlogDetail() {
  const { slug } = useParams()
  const post = useAsync(() => getBlogBySlug(slug), [slug])

  if (post.status === 'loading') return <Spinner className="py-32" />
  if (post.status === 'error') return <div className="container-page py-20"><ErrorState onRetry={post.retry} /></div>
  if (post.status === 'success' && !post.data) {
    return (
      <div className="container-page py-20">
        <EmptyState title="Article not found" description="This post may have been unpublished or moved." />
      </div>
    )
  }

  const b = post.data || {}

  return (
    <>
      <Seo title={b.title || 'Blog Post'} description={b.excerpt || ''} />

      <article className="container-page max-w-3xl py-20">
        <Reveal>
          <p className="text-xs font-medium uppercase tracking-wide text-accent">{b.category || 'General'}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">{b.title || ''}</h1>
          <p className="mt-4 text-sm">
            {b.authorName || 'Admin'} · {b.publishedAt ? new Date(b.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : ''} · {readingTime(b.content)} min read
          </p>
        </Reveal>
        
        {b.coverImage && (
          <Reveal delay={100}>
            <img src={b.coverImage} alt={b.title || 'Cover image'} className="mt-10 h-64 w-full rounded-2xl object-cover sm:h-96" loading="lazy" />
          </Reveal>
        )}

        <Reveal delay={150}>
          <RichText html={b.content || ''} className="mt-10" />
        </Reveal>

        {/* NEW — related service / portfolio links, populated once
            blog.util.js's serializer passes relatedService/relatedPortfolio
            through (each shaped { id, title, slug } or null). */}
        {(b.relatedService || b.relatedPortfolio) && (
          <Reveal delay={175}>
            <div className="mt-10 flex flex-wrap gap-3">
              {b.relatedService && (
                <Button to={`/services/${b.relatedService.slug}`} variant="outline">
                  Related service: {b.relatedService.title}
                </Button>
              )}
              {b.relatedPortfolio && (
                <Button to={`/portfolio/${b.relatedPortfolio.slug}`} variant="outline">
                  Related project: {b.relatedPortfolio.title}
                </Button>
              )}
            </div>
          </Reveal>
        )}

        <Reveal>
          <div className="mt-14 border-t border-slate-200/70 dark:border-slate-700/60 pt-8">
            <Button to="/blog" variant="outline">Back to all articles</Button>
          </div>
        </Reveal>
      </article>
    </>
  )
}