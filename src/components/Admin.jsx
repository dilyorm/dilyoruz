import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import Markdown from './Markdown'
import '../admin.css'

const EMPTY_PROJECT = { name: '', slug: '', tag: '', what: '', body: '', stack: [], links: [], year: '', hidden: false }
const EMPTY_POST = { title: '', slug: '', excerpt: '', body: '', cover: '', tags: [], published: false }
const csv = (s) =>
  s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)

/* ---------- login ---------- */

function Login({ onIn }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setErr('')
    try {
      await api('/api/admin/login', { method: 'POST', body: { password: pw } })
      onIn()
    } catch (e2) {
      setErr(e2.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="adm-login">
      <form onSubmit={submit} className="adm-login-card">
        <img src="/kyosan.png" alt="" />
        <h1>Back office</h1>
        <label>
          Password
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus autoComplete="current-password" />
        </label>
        {err && (
          <p className="adm-err" role="alert">
            {err}
          </p>
        )}
        <button className="adm-btn adm-btn--primary" disabled={busy || !pw}>
          {busy ? 'Checking…' : 'Log in'}
        </button>
        <Link to="/" className="adm-quiet">
          Back to the site
        </Link>
      </form>
    </div>
  )
}

/* ---------- shared bits ---------- */

function Field({ label, hint, children }) {
  return (
    <label className="adm-field">
      <span>
        {label}
        {hint && <em>{hint}</em>}
      </span>
      {children}
    </label>
  )
}

function ConfirmDelete({ onConfirm, label = 'Delete' }) {
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    if (!armed) return
    const t = setTimeout(() => setArmed(false), 4000)
    return () => clearTimeout(t)
  }, [armed])
  return armed ? (
    <button type="button" className="adm-btn adm-btn--danger" onClick={onConfirm}>
      Sure? Delete for good
    </button>
  ) : (
    <button type="button" className="adm-btn adm-btn--ghost" onClick={() => setArmed(true)}>
      {label}
    </button>
  )
}

async function uploadImage(file) {
  const form = new FormData()
  form.append('file', file)
  const { url } = await api('/api/admin/upload', { method: 'POST', form })
  return url
}

// Markdown textarea with an image button and a live preview.
function BodyEditor({ value, onChange, rows = 18 }) {
  const ta = useRef(null)
  const file = useRef(null)
  const [tab, setTab] = useState('write')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const insert = (text) => {
    const el = ta.current
    const at = el ? el.selectionStart : value.length
    onChange(value.slice(0, at) + text + value.slice(at))
    requestAnimationFrame(() => {
      if (!el) return
      el.focus()
      el.selectionStart = el.selectionEnd = at + text.length
    })
  }
  const onFile = async (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    setBusy(true)
    setErr('')
    try {
      insert(`\n![${f.name.replace(/\.[^.]+$/, '')}](${await uploadImage(f)})\n`)
    } catch (e2) {
      setErr(e2.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="adm-body">
      <div className="adm-body-bar">
        <div role="tablist" aria-label="Body view">
          {['write', 'preview'].map((t) => (
            <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>
              {t === 'write' ? 'Write' : 'Preview'}
            </button>
          ))}
        </div>
        <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => file.current?.click()} disabled={busy}>
          {busy ? 'Uploading…' : 'Add image'}
        </button>
        <input ref={file} type="file" accept="image/png,image/jpeg,image/gif,image/webp" hidden onChange={onFile} />
      </div>
      {err && <p className="adm-err">{err}</p>}
      {tab === 'write' ? (
        <textarea ref={ta} value={value} onChange={(e) => onChange(e.target.value)} rows={rows} spellCheck="true" placeholder="Markdown: **bold**, - lists, [links](https://…), ## headings" />
      ) : (
        <Markdown className="prose adm-preview" source={value || '*Nothing to preview yet.*'} />
      )}
    </div>
  )
}

// On narrow screens the editor sits under the list; bring it into view when opened.
function useRevealOnOpen() {
  const ref = useRef(null)
  useEffect(() => {
    if (window.matchMedia('(max-width: 860px)').matches) ref.current?.scrollIntoView({ block: 'start' })
  }, [])
  return ref
}

function useSaveShortcut(save) {
  useEffect(() => {
    const on = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        save()
      }
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [save])
}

/* ---------- projects ---------- */

function ProjectEditor({ initial, onSaved, onDeleted }) {
  const [p, setP] = useState(initial)
  const [stack, setStack] = useState(initial.stack.join(', '))
  const [msg, setMsg] = useState(null)
  const [dirty, setDirty] = useState(false)
  const set = (k) => (v) => {
    setP((x) => ({ ...x, [k]: v }))
    setDirty(true)
  }
  const setLink = (i, k, v) => set('links')(p.links.map((l, j) => (j === i ? { ...l, [k]: v } : l)))

  const save = useCallback(async () => {
    const body = { ...p, stack: csv(stack), links: p.links.filter((l) => l.label && l.href) }
    try {
      const out = p.id
        ? await api(`/api/admin/projects/${p.id}`, { method: 'PUT', body })
        : await api('/api/admin/projects', { method: 'POST', body })
      setP(out)
      setDirty(false)
      setMsg({ ok: true, text: 'Saved' })
      onSaved(out)
    } catch (e) {
      setMsg({ ok: false, text: e.message })
    }
  }, [p, stack, onSaved])
  useSaveShortcut(save)
  const reveal = useRevealOnOpen()

  return (
    <form
      ref={reveal}
      className="adm-editor"
      onSubmit={(e) => {
        e.preventDefault()
        save()
      }}
    >
      <div className="adm-editor-head">
        <h2>{p.id ? p.name || 'Untitled' : 'New project'}</h2>
        {dirty && <span className="adm-dirty">Unsaved</span>}
      </div>
      <div className="adm-grid">
        <Field label="Name">
          <input value={p.name} onChange={(e) => set('name')(e.target.value)} required maxLength={80} />
        </Field>
        <Field label="Tag" hint="one word">
          <input value={p.tag} onChange={(e) => set('tag')(e.target.value)} maxLength={24} />
        </Field>
        <Field label="Year">
          <input value={p.year} onChange={(e) => set('year')(e.target.value)} maxLength={20} />
        </Field>
      </div>
      <Field label="One line" hint="shown in the closed row">
        <input value={p.what} onChange={(e) => set('what')(e.target.value)} maxLength={200} />
      </Field>
      <Field label="Built with" hint="comma separated">
        <input
          value={stack}
          onChange={(e) => {
            setStack(e.target.value)
            setDirty(true)
          }}
        />
      </Field>
      <div className="adm-field">
        <span>Links</span>
        {p.links.map((l, i) => (
          <div className="adm-link" key={i}>
            <input aria-label="Link label" placeholder="GitHub" value={l.label} onChange={(e) => setLink(i, 'label', e.target.value)} maxLength={40} />
            <input aria-label="Link address" placeholder="https://" value={l.href} onChange={(e) => setLink(i, 'href', e.target.value)} />
            <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => set('links')(p.links.filter((_, j) => j !== i))}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm adm-add" onClick={() => set('links')([...p.links, { label: '', href: '' }])}>
          Add link
        </button>
      </div>
      <div className="adm-field">
        <span>Details <em>shown when the row opens</em></span>
        <BodyEditor value={p.body} onChange={set('body')} rows={10} />
      </div>
      <label className="adm-check">
        <input type="checkbox" checked={p.hidden} onChange={(e) => set('hidden')(e.target.checked)} />
        Hide from the site
      </label>
      <div className="adm-actions">
        <button className="adm-btn adm-btn--primary">Save</button>
        {msg && <span className={msg.ok ? 'adm-ok' : 'adm-err'}>{msg.text}</span>}
        {p.id && (
          <ConfirmDelete
            onConfirm={async () => {
              await api(`/api/admin/projects/${p.id}`, { method: 'DELETE' })
              onDeleted(p.id)
            }}
          />
        )}
      </div>
    </form>
  )
}

function Projects() {
  const [list, setList] = useState(null)
  const [sel, setSel] = useState(null)
  const [err, setErr] = useState('')
  useEffect(() => {
    api('/api/admin/projects').then(setList, (e) => setErr(e.message))
  }, [])

  const move = async (i, d) => {
    const ids = list.map((p) => p.id)
    ;[ids[i], ids[i + d]] = [ids[i + d], ids[i]]
    setList(await api('/api/admin/projects/order', { method: 'PUT', body: { ids } }))
  }
  if (err) return <p className="adm-err">{err}</p>
  if (!list) return <p className="adm-quiet">Loading…</p>

  return (
    <div className="adm-split">
      <aside className="adm-list">
        <button type="button" className="adm-btn adm-btn--primary adm-new" onClick={() => setSel({ ...EMPTY_PROJECT })}>
          New project
        </button>
        <ol>
          {list.map((p, i) => (
            <li key={p.id} className={sel?.id === p.id ? 'is-sel' : ''}>
              <button type="button" className="adm-item" onClick={() => setSel(p)}>
                <strong>{p.name}</strong>
                <span>
                  {p.tag}
                  {p.hidden && <em className="adm-pill">Hidden</em>}
                </span>
              </button>
              <span className="adm-order">
                <button type="button" aria-label={`Move ${p.name} up`} disabled={i === 0} onClick={() => move(i, -1)}>
                  ↑
                </button>
                <button type="button" aria-label={`Move ${p.name} down`} disabled={i === list.length - 1} onClick={() => move(i, 1)}>
                  ↓
                </button>
              </span>
            </li>
          ))}
        </ol>
      </aside>
      {sel ? (
        <ProjectEditor
          key={sel.id ?? 'new'}
          initial={sel}
          onSaved={(out) => {
            setList((l) => (l.some((x) => x.id === out.id) ? l.map((x) => (x.id === out.id ? out : x)) : [...l, out]))
            setSel(out)
          }}
          onDeleted={(id) => {
            setList((l) => l.filter((x) => x.id !== id))
            setSel(null)
          }}
        />
      ) : (
        <p className="adm-hint">Pick a project to edit, drag order with the arrows, or start a new one.</p>
      )}
    </div>
  )
}

/* ---------- posts ---------- */

function PostEditor({ initial, onSaved, onDeleted }) {
  const [p, setP] = useState(initial)
  const [tags, setTags] = useState(initial.tags.join(', '))
  const [msg, setMsg] = useState(null)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const set = (k) => (v) => {
    setP((x) => ({ ...x, [k]: v }))
    setDirty(true)
  }

  const save = useCallback(
    async (override = {}) => {
      const body = { ...p, ...override, tags: csv(tags) }
      try {
        const out = p.id
          ? await api(`/api/admin/posts/${p.id}`, { method: 'PUT', body })
          : await api('/api/admin/posts', { method: 'POST', body })
        setP(out)
        setDirty(false)
        setMsg({ ok: true, text: out.published ? 'Saved and live' : 'Saved as draft' })
        onSaved(out)
      } catch (e) {
        setMsg({ ok: false, text: e.message })
      }
    },
    [p, tags, onSaved],
  )
  useSaveShortcut(save)
  const reveal = useRevealOnOpen()

  const onCover = async (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    setBusy(true)
    try {
      set('cover')(await uploadImage(f))
    } catch (e2) {
      setMsg({ ok: false, text: e2.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form
      ref={reveal}
      className="adm-editor"
      onSubmit={(e) => {
        e.preventDefault()
        save()
      }}
    >
      <div className="adm-editor-head">
        <h2>{p.id ? 'Edit post' : 'New post'}</h2>
        <span className={p.published ? 'adm-pill adm-pill--live' : 'adm-pill'}>{p.published ? 'Live' : 'Draft'}</span>
        {dirty && <span className="adm-dirty">Unsaved</span>}
        {p.id && p.published && (
          <Link className="adm-quiet" to={`/blog/${p.slug}`} target="_blank">
            View ↗
          </Link>
        )}
      </div>
      <Field label="Title">
        <input className="adm-title-input" value={p.title} onChange={(e) => set('title')(e.target.value)} required maxLength={160} />
      </Field>
      <div className="adm-grid adm-grid--2">
        <Field label="Address" hint={`/blog/${p.slug || 'from-the-title'}`}>
          <input value={p.slug} onChange={(e) => set('slug')(e.target.value)} placeholder="from-the-title" maxLength={80} />
        </Field>
        <Field label="Tags" hint="comma separated">
          <input
            value={tags}
            onChange={(e) => {
              setTags(e.target.value)
              setDirty(true)
            }}
          />
        </Field>
      </div>
      <Field label="Summary" hint="one or two sentences for the list">
        <textarea value={p.excerpt} onChange={(e) => set('excerpt')(e.target.value)} rows={2} maxLength={400} />
      </Field>
      <div className="adm-field">
        <span>Cover image</span>
        <div className="adm-cover">
          {p.cover && <img src={p.cover} alt="" />}
          <label className="adm-btn adm-btn--ghost adm-btn--sm">
            {busy ? 'Uploading…' : p.cover ? 'Replace' : 'Upload'}
            <input type="file" accept="image/png,image/jpeg,image/gif,image/webp" hidden onChange={onCover} />
          </label>
          {p.cover && (
            <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => set('cover')('')}>
              Remove
            </button>
          )}
        </div>
      </div>
      <div className="adm-field">
        <span>Body</span>
        <BodyEditor value={p.body} onChange={set('body')} />
      </div>
      <div className="adm-actions">
        {p.published ? (
          <>
            <button className="adm-btn adm-btn--primary">Save</button>
            <button type="button" className="adm-btn adm-btn--ghost" onClick={() => save({ published: false })}>
              Unpublish
            </button>
          </>
        ) : (
          <>
            <button type="button" className="adm-btn adm-btn--primary" onClick={() => save({ published: true })}>
              Publish
            </button>
            <button className="adm-btn adm-btn--ghost">Save draft</button>
          </>
        )}
        {msg && <span className={msg.ok ? 'adm-ok' : 'adm-err'}>{msg.text}</span>}
        {p.id && (
          <ConfirmDelete
            onConfirm={async () => {
              await api(`/api/admin/posts/${p.id}`, { method: 'DELETE' })
              onDeleted(p.id)
            }}
          />
        )}
      </div>
    </form>
  )
}

function Posts() {
  const [list, setList] = useState(null)
  const [sel, setSel] = useState(null)
  const [err, setErr] = useState('')
  useEffect(() => {
    api('/api/admin/posts').then(setList, (e) => setErr(e.message))
  }, [])
  const open = async (id) => setSel(await api(`/api/admin/posts/${id}`))

  if (err) return <p className="adm-err">{err}</p>
  if (!list) return <p className="adm-quiet">Loading…</p>
  return (
    <div className="adm-split">
      <aside className="adm-list">
        <button type="button" className="adm-btn adm-btn--primary adm-new" onClick={() => setSel({ ...EMPTY_POST })}>
          New post
        </button>
        {list.length === 0 && <p className="adm-quiet">No posts yet.</p>}
        <ol>
          {list.map((p) => (
            <li key={p.id} className={sel?.id === p.id ? 'is-sel' : ''}>
              <button type="button" className="adm-item" onClick={() => open(p.id)}>
                <strong>{p.title}</strong>
                <span>
                  <em className={p.published ? 'adm-pill adm-pill--live' : 'adm-pill'}>{p.published ? 'Live' : 'Draft'}</em>
                  {p.minutes} min
                </span>
              </button>
            </li>
          ))}
        </ol>
      </aside>
      {sel ? (
        <PostEditor
          key={sel.id ?? 'new'}
          initial={sel}
          onSaved={(out) => {
            const { body: _b, ...row } = out
            setList((l) => [row, ...l.filter((x) => x.id !== out.id)])
          }}
          onDeleted={(id) => {
            setList((l) => l.filter((x) => x.id !== id))
            setSel(null)
          }}
        />
      ) : (
        <p className="adm-hint">Pick a post or write a new one. Ctrl+S saves.</p>
      )}
    </div>
  )
}

/* ---------- shell ---------- */

export default function Admin() {
  const [state, setState] = useState('checking')
  const [tab, setTab] = useState('projects')
  const check = useCallback(() => {
    api('/api/admin/me').then(
      () => setState('in'),
      (e) => setState(e.status === 401 ? 'out' : 'down'),
    )
  }, [])
  useEffect(() => {
    document.title = 'Admin · kyosan'
    check()
  }, [check])

  if (state === 'checking') return <div className="adm-login" />
  if (state === 'down')
    return (
      <div className="adm-login">
        <p className="adm-login-card">The API is not reachable. Start it with server/dev.sh, then reload.</p>
      </div>
    )
  if (state === 'out') return <Login onIn={() => setState('in')} />

  return (
    <div className="adm">
      <header className="adm-top">
        <Link to="/" className="adm-brand">
          <img src="/kyosan.png" alt="" />
          kyosan <span>admin</span>
        </Link>
        <nav role="tablist" aria-label="Sections">
          {[
            ['projects', 'Projects'],
            ['posts', 'Blog posts'],
          ].map(([k, label]) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>
              {label}
            </button>
          ))}
        </nav>
        <div className="adm-top-end">
          <Link to={tab === 'posts' ? '/blog' : '/#work'} className="adm-quiet" target="_blank">
            View site ↗
          </Link>
          <button
            type="button"
            className="adm-btn adm-btn--ghost adm-btn--sm"
            onClick={async () => {
              await api('/api/admin/logout', { method: 'POST' })
              setState('out')
            }}
          >
            Log out
          </button>
        </div>
      </header>
      <main className="adm-main">{tab === 'projects' ? <Projects /> : <Posts />}</main>
    </div>
  )
}
