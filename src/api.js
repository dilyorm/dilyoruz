import { useEffect, useState } from 'react'

export async function api(path, { method = 'GET', body, form } = {}) {
  const init = { method, credentials: 'same-origin', headers: {} }
  if (form) init.body = form
  else if (body !== undefined) {
    init.headers['Content-Type'] = 'application/json'
    init.body = JSON.stringify(body)
  }
  const r = await fetch(path, init)
  const data = r.headers.get('content-type')?.includes('json') ? await r.json() : null
  if (!r.ok) {
    const detail = data?.detail
    const msg = Array.isArray(detail) ? detail.map((d) => `${d.loc?.slice(-1)[0]}: ${d.msg}`).join(', ') : detail
    throw Object.assign(new Error(msg || `Request failed (${r.status})`), { status: r.status })
  }
  return data
}

// Reads `path`; until it answers (or if it fails) you get `fallback`.
export function useApi(path, fallback) {
  const [state, setState] = useState({ data: fallback, live: false, error: null, loading: true })
  useEffect(() => {
    let alive = true
    api(path)
      .then((data) => alive && setState({ data, live: true, error: null, loading: false }))
      .catch((error) => alive && setState((s) => ({ ...s, error, loading: false })))
    return () => {
      alive = false
    }
  }, [path])
  return state
}
