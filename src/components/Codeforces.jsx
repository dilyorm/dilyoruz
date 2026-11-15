import { useMemo, useRef, useState } from 'react'

// Codeforces' own rank bands, so the chart reads like the real profile.
const BANDS = [
  { from: 0, to: 1200, name: 'Newbie', fill: '#E3E3E3', ink: '#808080' },
  { from: 1200, to: 1400, name: 'Pupil', fill: '#C9F7C9', ink: '#008000' },
  { from: 1400, to: 1600, name: 'Specialist', fill: '#C4EEE3', ink: '#03A89E' },
  { from: 1600, to: 1900, name: 'Expert', fill: '#D8D8FF', ink: '#0000FF' },
  { from: 1900, to: 2100, name: 'Candidate master', fill: '#F7D2F7', ink: '#AA00AA' },
  { from: 2100, to: 3000, name: 'Master', fill: '#FFE2B8', ink: '#FF8C00' },
]
export const bandOf = (r) => BANDS.find((b) => r >= b.from && r < b.to) ?? BANDS[BANDS.length - 1]
const title = (s) => s.replace(/(^|\s)\S/g, (c) => c.toUpperCase())

const W = 720
const H = 400
const PAD = { l: 52, r: 16, t: 20, b: 34 }
const fmtDate = (t) => new Date(t * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

function RatingChart({ history }) {
  const wrap = useRef(null)
  const [hover, setHover] = useState(null)

  const { pts, x, y, yMin, yMax, years, peak } = useMemo(() => {
    const t0 = history[0].t
    const t1 = history[history.length - 1].t
    const rs = history.map((h) => h.r)
    const yMin = Math.floor((Math.min(...rs) - 100) / 200) * 200
    const yMax = Math.ceil((Math.max(...rs) + 150) / 100) * 100
    const x = (t) => PAD.l + ((t - t0) / (t1 - t0 || 1)) * (W - PAD.l - PAD.r)
    const y = (r) => PAD.t + (1 - (r - yMin) / (yMax - yMin)) * (H - PAD.t - PAD.b)
    const pts = history.map((h) => ({ ...h, px: x(h.t), py: y(h.r) }))
    const years = []
    for (let yr = new Date(t0 * 1000).getFullYear() + 1; yr <= new Date(t1 * 1000).getFullYear(); yr++) {
      years.push({ yr, px: x(Date.UTC(yr, 0, 1) / 1000) })
    }
    const peak = pts.reduce((a, b) => (b.r > a.r ? b : a))
    return { pts, x, y, yMin, yMax, years, peak }
  }, [history])

  const last = pts[pts.length - 1]
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p.px.toFixed(1)} ${p.py.toFixed(1)}`).join(' ')

  const onMove = (e) => {
    const b = e.currentTarget.getBoundingClientRect()
    const vx = ((e.clientX - b.left) / b.width) * W
    let best = pts[0]
    for (const p of pts) if (Math.abs(p.px - vx) < Math.abs(best.px - vx)) best = p
    setHover(best)
  }

  return (
    <figure className="cf-chart" ref={wrap}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Codeforces rating over ${pts.length} contests, peak ${peak.r}, now ${last.r}`}>
        {BANDS.filter((b) => b.to > yMin && b.from < yMax).map((b) => {
          const top = y(Math.min(b.to, yMax))
          const bottom = y(Math.max(b.from, yMin))
          return (
            <g key={b.name}>
              <rect x={PAD.l} y={top} width={W - PAD.l - PAD.r} height={bottom - top} fill={b.fill} />
              {bottom - top > 22 && (
                // high bands are empty on the left (early contests), low bands on the right
                <text
                  x={b.from >= 1400 ? PAD.l + 8 : W - PAD.r - 8}
                  y={top + 16}
                  textAnchor={b.from >= 1400 ? 'start' : 'end'}
                  className="cf-band-label"
                >
                  {b.name}
                </text>
              )}
            </g>
          )
        })}
        {BANDS.filter((b) => b.from > yMin && b.from < yMax).map((b) => (
          <text key={b.from} x={PAD.l - 8} y={y(b.from) + 4} textAnchor="end" className="cf-axis">
            {b.from}
          </text>
        ))}
        {years.map((g) => (
          <g key={g.yr}>
            <line x1={g.px} x2={g.px} y1={PAD.t} y2={H - PAD.b} className="cf-grid" />
            <text x={g.px} y={H - PAD.b + 22} textAnchor="middle" className="cf-axis">
              {g.yr}
            </text>
          </g>
        ))}

        <path d={line} fill="none" stroke="#0E1E5B" strokeWidth="2" strokeLinejoin="round" />
        {hover && <line x1={hover.px} x2={hover.px} y1={PAD.t} y2={H - PAD.b} className="cf-cross" />}
        {pts.map((p) => (
          <circle
            key={p.t}
            cx={p.px}
            cy={p.py}
            r={hover === p ? 6 : 4}
            fill={hover === p ? '#FFE500' : '#FFFFFF'}
            stroke="#0E1E5B"
            strokeWidth="2"
          />
        ))}
        {[peak, last].map((p) => (
          <text
            key={p.t}
            x={p.px}
            y={p === last ? p.py + 24 : p.py - 14}
            textAnchor={p === last ? 'end' : 'middle'}
            className="cf-direct"
          >
            {p === peak ? `${p.r} peak` : `${p.r} now`}
          </text>
        ))}
        <rect
          x={PAD.l}
          y={0}
          width={W - PAD.l - PAD.r}
          height={H}
          fill="transparent"
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        />
      </svg>
      {hover && (
        <div
          className="cf-tip"
          style={{ left: `${(hover.px / W) * 100}%`, top: `${(hover.py / H) * 100}%` }}
          data-flip={hover.px > W * 0.6 || undefined}
        >
          <strong>{hover.name}</strong>
          <span>{fmtDate(hover.t)}</span>
          <span>
            {hover.r}{' '}
            <em className={hover.d >= 0 ? 'up' : 'down'}>
              {hover.d >= 0 ? '+' : ''}
              {hover.d}
            </em>
            , place {hover.place.toLocaleString('en-US')}
          </span>
        </div>
      )}
      <table className="sr-only">
        <caption>Codeforces rating by contest</caption>
        <thead>
          <tr>
            <th>Contest</th>
            <th>Date</th>
            <th>Rating</th>
            <th>Change</th>
          </tr>
        </thead>
        <tbody>
          {pts.map((p) => (
            <tr key={p.t}>
              <td>{p.name}</td>
              <td>{fmtDate(p.t)}</td>
              <td>{p.r}</td>
              <td>{p.d}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}

export default function CodeforcesPanel({ data }) {
  const now = bandOf(data.rating)
  const best = bandOf(data.maxRating)
  return (
    <article className="panel panel-cf" aria-labelledby="h-cf">
      <div className="panel-copy">
        <h3 id="h-cf" className="panel-title">
          Codeforces
        </h3>
        <p className="panel-lede">
          Where the ICPC habit lives on. {data.history.length} rated contests, {data.solved} problems solved, and one peak I
          keep chasing.
        </p>
        <div className="stats">
          <dl aria-label="Codeforces stats">
            <div>
              <dt>Rating</dt>
              <dd>{data.rating}</dd>
              <span className="cf-rank" style={{ '--rank': now.ink }}>
                {title(data.rank)}
              </span>
            </div>
            <div>
              <dt>Peak</dt>
              <dd>{data.maxRating}</dd>
              <span className="cf-rank" style={{ '--rank': best.ink }}>
                {title(data.maxRank)}
              </span>
            </div>
            <div>
              <dt>Contests</dt>
              <dd>{data.history.length}</dd>
            </div>
            <div>
              <dt>Solved</dt>
              <dd>{data.solved}</dd>
            </div>
          </dl>
        </div>
        <a className="cf-link" href="https://codeforces.com/profile/dilyorbek" target="_blank" rel="noreferrer">
          See the profile
        </a>
      </div>
      <RatingChart history={data.history} />
    </article>
  )
}
