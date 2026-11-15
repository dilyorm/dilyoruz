import { useEffect, useState } from 'react'
import { HANDLES, HOBBIES } from './data'
import CF_SNAPSHOT from './codeforces-snapshot.json'

export function useMedia(query) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const m = window.matchMedia(query)
    const on = () => setMatch(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [query])
  return match
}

const getJSON = (url) => fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`${r.status} ${url}`))))

async function chessCom(user) {
  const s = await getJSON(`https://api.chess.com/pub/player/${encodeURIComponent(user)}/stats`)
  return {
    sample: false,
    stats: [
      { k: 'Rapid', v: s.chess_rapid?.last?.rating ?? '—' },
      { k: 'Blitz', v: s.chess_blitz?.last?.rating ?? '—' },
      { k: 'Bullet', v: s.chess_bullet?.last?.rating ?? '—' },
      { k: 'Puzzles peak', v: s.tactics?.highest?.rating ?? '—' },
    ],
  }
}

const MT_MODES = [
  ['time', '15', '15 s'],
  ['time', '30', '30 s'],
  ['time', '60', '60 s'],
  ['time', '120', '120 s'],
  ['words', '10', '10 words'],
]

async function monkeytype(user) {
  const { data } = await getJSON(`https://api.monkeytype.com/users/${encodeURIComponent(user)}/profile`)
  const best = (arr = []) => arr.reduce((a, b) => (b.wpm > (a?.wpm ?? 0) ? b : a), null)
  return {
    pbs: MT_MODES.map(([kind, len, mode]) => {
      const pb = best(data.personalBests?.[kind]?.[len])
      return pb && { mode, wpm: pb.wpm, acc: pb.acc }
    }).filter(Boolean),
    tests: data.typingStats?.completedTests ?? 0,
    seconds: data.typingStats?.timeTyping ?? 0,
  }
}

// Rating + history are light calls; the solved count needs every submission,
// so it stays on the snapshot in codeforces-snapshot.json.
async function codeforces(handle) {
  const api = (m) => getJSON(`https://codeforces.com/api/${m}`).then((r) => (r.status === 'OK' ? r.result : Promise.reject(new Error(r.comment))))
  const [[info], hist] = await Promise.all([api(`user.info?handles=${handle}`), api(`user.rating?handle=${handle}`)])
  return {
    rating: info.rating,
    maxRating: info.maxRating,
    rank: info.rank,
    maxRank: info.maxRank,
    history: hist.map((h) => ({
      t: h.ratingUpdateTimeSeconds,
      name: h.contestName,
      r: h.newRating,
      d: h.newRating - h.oldRating,
      place: h.rank,
    })),
  }
}

// Saved numbers first, then live ones for any hobby with a handle set.
export function useHobbies(handles = HANDLES) {
  const [data, setData] = useState(() => ({ ...HOBBIES, cf: CF_SNAPSHOT }))
  useEffect(() => {
    let alive = true
    const jobs = [
      handles.chessCom && ['chess', chessCom(handles.chessCom)],
      handles.codeforces && ['cf', codeforces(handles.codeforces)],
      handles.monkeytype && ['typing', monkeytype(handles.monkeytype)],
      // These two go through our own API: FACEIT has no CORS, avj needs its server.
      ['faceit', getJSON('/api/faceit')],
      ['music', getJSON('/api/music')],
    ].filter(Boolean)
    jobs.forEach(([key, job]) =>
      job
        .then((live) => alive && setData((d) => ({ ...d, [key]: { ...d[key], ...live, live: true } })))
        .catch((e) => {
          console.warn(`[hobbies] ${key} stayed on saved numbers:`, e.message)
          // No saved numbers to fall back on: say so instead of waiting forever.
          if (alive) setData((d) => (d[key] ? d : { ...d, [key]: { failed: true } }))
        }),
    )
    return () => {
      alive = false
    }
  }, [handles])
  return data
}
