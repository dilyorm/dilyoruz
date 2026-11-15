import { motion, useScroll } from 'framer-motion'
import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useApi } from '../api'
import { ME } from '../data'
import Markdown from './Markdown'

const fmtDate = (t) =>
  t ? new Date(t * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Draft'

function ZineBar({ children }) {
  return (
    <header className="zine-bar">
      <Link to="/" className="zine-home">
        <img src="/kyosan.png" alt="" />
        <span>{ME.nick}</span>
      </Link>
      {children}
    </header>
  )
}

export function BlogIndex({ notFound = false }) {
  const { data: posts, loading, error } = useApi('/api/posts', [])
  useEffect(() => {
    document.title = notFound ? 'Lost · kyosan' : 'Notes · kyosan'
  }, [notFound])

  return (
    <div className="zine">
      <ZineBar>
        <Link to="/#contact" className="zine-link">
          Say hi
        </Link>
      </ZineBar>
      <main className="zine-main">
        {notFound && (
          <p className="zine-404">
            <span className="pixel-label">404</span> That page fell off the board. Here are the notes instead.
          </p>
        )}
        <h1 className="zine-title">
          Notes<span aria-hidden="true">.</span>
        </h1>
        <p className="zine-lede">Things I build, break and learn along the way. Mostly ML, sometimes robots, now and then chess.</p>

        {loading ? (
          <p className="zine-empty pixel-label">Loading…</p>
        ) : error && !posts.length ? (
          <p className="zine-empty">The notes server is resting. Try again in a minute.</p>
        ) : !posts.length ? (
          <p className="zine-empty">Nothing posted yet. The first one is still in drafts.</p>
        ) : (
          <ol className="zine-list">
            {posts.map((p, i) => (
              <motion.li
                key={p.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: Math.min(i, 4) * 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link to={`/blog/${p.slug}`} className="zine-entry">
                  <span className="zine-meta pixel-label">
                    {fmtDate(p.published_at)} · {p.minutes} min
                  </span>
                  <span className="zine-entry-title">
                    <span>{p.title}</span>
                  </span>
                  {p.excerpt && <span className="zine-excerpt">{p.excerpt}</span>}
                  {p.tags.length > 0 && (
                    <span className="zine-tags">
                      {p.tags.map((t) => (
                        <span key={t}>#{t}</span>
                      ))}
                    </span>
                  )}
                </Link>
              </motion.li>
            ))}
          </ol>
        )}
      </main>
      <footer className="zine-foot pixel-label">
        {ME.nick}, {new Date().getFullYear()}
      </footer>
    </div>
  )
}

export function BlogPost() {
  const { slug } = useParams()
  const { data: post, loading, error } = useApi(`/api/posts/${encodeURIComponent(slug)}`, null)
  const { scrollYProgress } = useScroll()

  useEffect(() => {
    if (post) document.title = `${post.title} · kyosan`
  }, [post])

  return (
    <div className="zine">
      <motion.span className="zine-progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />
      <ZineBar>
        <Link to="/blog" className="zine-link">
          All notes
        </Link>
      </ZineBar>
      <main className="zine-main zine-main--post">
        {loading ? (
          <p className="zine-empty pixel-label">Loading…</p>
        ) : error || !post ? (
          <div className="zine-missing">
            <h1 className="zine-title">Gone.</h1>
            <p className="zine-lede">
              {error?.status === 404 ? 'No note lives at this address.' : 'The notes server is resting.'}{' '}
              <Link to="/blog">See all notes</Link>.
            </p>
          </div>
        ) : (
          <article>
            <header className="post-head">
              <p className="zine-meta pixel-label">
                {fmtDate(post.published_at)} · {post.minutes} min read
              </p>
              <h1 className="post-title">{post.title}</h1>
              {post.excerpt && <p className="post-lede">{post.excerpt}</p>}
              {post.tags.length > 0 && (
                <p className="zine-tags">
                  {post.tags.map((t) => (
                    <span key={t}>#{t}</span>
                  ))}
                </p>
              )}
            </header>
            {post.cover && <img className="post-cover" src={post.cover} alt="" />}
            <Markdown className="prose" source={post.body} />
            <footer className="post-foot">
              <img src="/kyosan.png" alt="" />
              <p>
                Written by <strong>{ME.nick}</strong>. Questions or corrections?{' '}
                <a href={ME.links.find((l) => l.label === 'Telegram')?.href}>Message me on Telegram</a>.
              </p>
            </footer>
          </article>
        )}
      </main>
    </div>
  )
}
