import { AnimatePresence, motion } from 'framer-motion'
import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import SEED_PROJECTS from '../../server/seed_projects.json'
import { useApi } from '../api'
import { FACTS, ME, ROUTE, TROPHIES } from '../data'
import Markdown from './Markdown'
import { PixelBoard } from './Rider'

const LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Route', href: '#route' },
  { label: 'Work', href: '#work' },
  { label: 'Play', href: '#play' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact', href: '#contact' },
]

export function Nav({ ready }) {
  return (
    <motion.header
      className="nav"
      initial={{ opacity: 0, y: -12 }}
      animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: -12 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 1.6 }}
    >
      <a href="#top" className="logo">
        {ME.short}
      </a>
      <nav aria-label="Main">
        {LINKS.map((l) =>
          l.to ? (
            <Link key={l.to} to={l.to}>
              {l.label}
            </Link>
          ) : (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ),
        )}
      </nav>
    </motion.header>
  )
}

export function Marquee() {
  const line = ['Train it', 'Ship it', 'Break it', 'Fix it', 'Skate it']
  const run = [...line, ...line]
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-run">
        {[0, 1].map((k) => (
          <span key={k} className="marquee-group">
            {run.map((w, i) => (
              <span key={i} className="marquee-item">
                {w}
                <PixelBoard className="marquee-board" />
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ---------- About: white page, game character card ---------- */

export function About() {
  return (
    <section className="about" id="about">
      <div className="about-top">
        <p className="about-lede">
          I build intelligent systems. Speech recognition for Uzbek, search that answers customers, robots that take
          orders in plain language.
        </p>
        <figure className="player-card">
          <div className="player-card-art">
            <img src="/kyosan-portrait.png" alt="Pixel-art portrait of Dilyor: glasses, headphones, scarf" />
          </div>
          <figcaption>
            <span className="player-card-name">{ME.nick}</span>
            <dl>
              <div>
                <dt>Class</dt>
                <dd>ML engineer</dd>
              </div>
              <div>
                <dt>Base</dt>
                <dd>{ME.city}</dd>
              </div>
              <div>
                <dt>Party</dt>
                <dd>Team XYLO</dd>
              </div>
            </dl>
          </figcaption>
        </figure>
      </div>
      <dl className="facts">
        {FACTS.map((f) => (
          <div key={f.k}>
            <dt>{f.k}</dt>
            <dd>{f.v}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

/* ---------- Route: yellow page, a route map of the career ---------- */

export function Route() {
  return (
    <section className="route" id="route">
      <h2 className="route-title">The route</h2>
      <ol className="route-list">
        {ROUTE.map((s, i) => (
          <li key={s.where} className={i === 0 ? 'route-stop is-now' : 'route-stop'}>
            <span className="route-when">{s.when}</span>
            <span className="route-pin" aria-hidden="true">
              {i === 0 && <PixelBoard className="route-board" />}
            </span>
            <div className="route-body">
              <h3>
                {s.where}
                {i === 0 && <span className="pixel-label route-here">You are here</span>}
              </h3>
              <p className="route-what">{s.what}</p>
              {s.notes.length > 0 && (
                <ul>
                  {s.notes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

/* ---------- Work: sky page, project list ---------- */

// Rows open in place. Content comes from the admin API; the seed file is the fallback.
function WorkRow({ p, open, onToggle, index }) {
  const id = useId()
  return (
    <li className={open ? 'work-item is-open' : 'work-item'}>
      <h3 className="work-h">
        <button type="button" className="work-row" aria-expanded={open} aria-controls={id} onClick={onToggle}>
          <span className="work-num pixel-label">{String(index + 1).padStart(2, '0')}</span>
          <span className="work-name">{p.name}</span>
          <span className="work-what">{p.what}</span>
          <span className="work-tag">{p.tag}</span>
          <span className="work-plus" aria-hidden="true" />
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            className="work-detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="work-detail-in">
              <Markdown className="work-body" source={p.body || p.what} />
              <aside className="work-side">
                {p.year && (
                  <p className="work-meta">
                    <span className="pixel-label">Year</span>
                    {p.year}
                  </p>
                )}
                {p.stack?.length > 0 && (
                  <div className="work-meta">
                    <span className="pixel-label">Built with</span>
                    <ul className="work-stack">
                      {p.stack.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {p.links?.length > 0 && (
                  <div className="work-links">
                    {p.links.map((l) => (
                      <a key={l.href} href={l.href} target="_blank" rel="noreferrer">
                        {l.label}
                        <span aria-hidden="true"> ↗</span>
                      </a>
                    ))}
                  </div>
                )}
              </aside>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

export function Work() {
  const { data: projects } = useApi('/api/projects', SEED_PROJECTS)
  const [open, setOpen] = useState(null)
  return (
    <section className="work" id="work">
      <h2 className="section-title">Work</h2>
      <ul className="work-list">
        {projects.map((p, i) => (
          <WorkRow
            key={p.slug || p.name}
            p={p}
            index={i}
            open={open === (p.slug || p.name)}
            onToggle={() => setOpen((o) => (o === (p.slug || p.name) ? null : p.slug || p.name))}
          />
        ))}
      </ul>
    </section>
  )
}

/* ---------- Trophies: navy page, lift-pass tickets ---------- */

export function Trophies() {
  return (
    <section className="trophies" id="trophies">
      <h2 className="trophies-title">Passes earned</h2>
      <ul className="passes">
        {TROPHIES.map((t, i) => (
          <motion.li
            key={t.title}
            className="pass"
            style={{ '--tilt': `${[-3, 2, -1.5, 3, -2][i % 5]}deg`, '--rank-scale': t.rank.length > 4 ? 0.62 : 1 }}
            whileHover={{ rotate: 0, y: -6, transition: { type: 'spring', stiffness: 300, damping: 18 } }}
          >
            <span className="pass-rank">{t.rank}</span>
            <span className="pass-title">{t.title}</span>
            <span className="pass-detail">{t.detail}</span>
            <span className="pass-hole" aria-hidden="true" />
          </motion.li>
        ))}
      </ul>
    </section>
  )
}

/* ---------- Contact ---------- */

export function Contact() {
  return (
    <footer className="contact" id="contact">
      <h2 className="contact-title">Let's roll</h2>
      <div className="contact-row">
        <p>Got a project, a job, or a good spot to skate? Write to me.</p>
        <a className="contact-btn" href={`mailto:${ME.email}`}>
          Write an email
        </a>
      </div>
      <div className="contact-foot">
        {ME.links.map((l) => (
          <a key={l.label} href={l.href} target="_blank" rel="noreferrer">
            {l.label}
          </a>
        ))}
        <span className="pixel-label">
          {ME.nick}, {new Date().getFullYear()}
        </span>
      </div>
    </footer>
  )
}
