import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { STEAM } from '../data'
import { useHobbies, useMedia } from '../hooks'
import CodeforcesPanel from './Codeforces'
import Cube from './Cube'
import TypingPanel from './Typing'

function Stats({ data, label }) {
  return (
    <div className="stats">
      {data.sample && <span className="pixel-label stats-sample">Sample numbers</span>}
      <dl aria-label={label}>
        {data.stats.map((s) => (
          <div key={s.k}>
            <dt>{s.k}</dt>
            <dd>{s.v}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/* ---------- Chess: white page, checkerboard, a knight that keeps hopping ---------- */

const KNIGHT = [
  '...OO.....',
  '..OYYOO...',
  '.OYYYYYO..',
  'OYYOYYYYO.',
  'OYYYYYYYO.',
  '.OOOYYYYO.',
  '...OYYYYO.',
  '..OYYYYO..',
  '..OYYYYO..',
  '.OYYYYYYO.',
  'OOOOOOOOOO',
  'OYYYYYYYYO',
  'OOOOOOOOOO',
]
// A closed knight's walk: every step is a legal L.
const TOUR = [
  [1, 7], [2, 5], [4, 4], [6, 5], [7, 7], [5, 6], [3, 5], [1, 4], [2, 6], [0, 7], [1, 5], [3, 6],
]

function PixelPiece({ map }) {
  return (
    <svg viewBox={`0 0 ${map[0].length} ${map.length}`} shapeRendering="crispEdges" aria-hidden="true">
      {map.flatMap((row, y) =>
        [...row].map((c, x) =>
          c === '.' ? null : <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill={c === 'O' ? '#0E1E5B' : '#FFE500'} />,
        ),
      )}
    </svg>
  )
}

function ChessBoard() {
  const reduce = useReducedMotion()
  const [step, setStep] = useState(0)
  useEffect(() => {
    if (reduce) return
    const id = setInterval(() => setStep((s) => (s + 1) % TOUR.length), 1100)
    return () => clearInterval(id)
  }, [reduce])
  const [cx, cy] = TOUR[step]
  const trail = [1, 2, 3].map((k) => TOUR[(step - k + TOUR.length) % TOUR.length])
  return (
    <div className="chessboard" aria-hidden="true">
      {Array.from({ length: 64 }, (_, i) => {
        const x = i % 8
        const y = Math.floor(i / 8)
        const t = trail.findIndex(([tx, ty]) => tx === x && ty === y)
        return <span key={i} className={(x + y) % 2 ? 'sq dark' : 'sq'} data-trail={t >= 0 ? t : undefined} />
      })}
      <motion.div
        className="knight"
        animate={{ left: `${cx * 12.5}%`, top: `${cy * 12.5}%`, y: [0, -18, 0] }}
        transition={{ left: { duration: 0.45, ease: [0.3, 0, 0.2, 1] }, top: { duration: 0.45, ease: [0.3, 0, 0.2, 1] }, y: { duration: 0.45 } }}
        key="knight"
      >
        <PixelPiece map={KNIGHT} />
      </motion.div>
    </div>
  )
}

function ChessPanel({ data }) {
  return (
    <article className="panel panel-chess" aria-labelledby="h-chess">
      <div className="panel-copy">
        <h3 id="h-chess" className="panel-title">Chess</h3>
        <p className="panel-lede">Bullet, mostly: over 900 games of it. Rapid when I actually want to think. The knight on the right never stops.</p>
        <Stats data={data} label="Chess stats" />
      </div>
      <ChessBoard />
    </article>
  )
}

/* ---------- Dota 2: blood-red page, a minimap with a hero walking mid ---------- */

function Minimap() {
  return (
    <svg className="minimap" viewBox="0 0 300 300" aria-hidden="true">
      <rect width="300" height="300" rx="10" fill="#1C0907" />
      <path d="M0 300 L0 0 L300 300 Z" fill="#1B3A20" />
      <path d="M300 0 L300 300 L0 0 Z" fill="#3D1310" opacity="0.9" />
      <path d="M0 0 L40 0 L300 260 L300 300 L260 300 L0 40 Z" fill="#0F2A3E" opacity="0.85" />
      <g stroke="#C7A770" strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.8">
        <path d="M34 266 L34 34 L266 34" />
        <path d="M34 266 L266 34" />
        <path d="M34 266 L266 266 L266 34" />
      </g>
      {[
        [34, 190], [34, 110], [110, 34], [190, 34], [266, 110], [266, 190], [110, 266], [190, 266], [100, 200], [200, 100],
      ].map(([x, y], i) => (
        <rect key={i} x={x - 6} y={y - 6} width="12" height="12" fill={x + y < 300 || (x + y === 300 && x < 150) ? '#64D46B' : '#E5432B'} />
      ))}
      <circle cx="34" cy="266" r="16" fill="#64D46B" stroke="#F6E7D3" strokeWidth="3" />
      <circle cx="266" cy="34" r="16" fill="#E5432B" stroke="#F6E7D3" strokeWidth="3" />
      <motion.circle
        cx="0"
        cy="0"
        r="8"
        fill="#FFE500"
        stroke="#1C0907"
        strokeWidth="3"
        initial={{ x: 52, y: 248 }}
        animate={{ x: [52, 150, 150, 52], y: [248, 150, 150, 248] }}
        transition={{ duration: 7, times: [0, 0.45, 0.6, 1], repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  )
}

function DotaPanel({ data }) {
  return (
    <article className="panel panel-dota" aria-labelledby="h-dota">
      <div className="panel-copy">
        <h3 id="h-dota" className="panel-title">Dota 2</h3>
        <p className="panel-lede">Five heroes, three lanes, and always one more game.</p>
        {!data.sample && (
          <p className="dota-rank">
            <span>Rank</span>
            {data.rank}
          </p>
        )}
        <Stats data={data} label="Dota 2 stats" />
        <a className="steam-link" href={STEAM.dota} target="_blank" rel="noreferrer">
          Steam profile
        </a>
      </div>
      <Minimap />
    </article>
  )
}

/* ---------- CS2: slate page, crosshair cursor, click to shoot ---------- */

// FACEIT CS2 level bands (elo floor of each level) and their colours.
const FACEIT_FLOORS = [0, 501, 751, 901, 1051, 1201, 1351, 1531, 1751, 2001]
const FACEIT_INK = ['#eeeeee', '#1ce400', '#1ce400', '#ffc800', '#ffc800', '#ffc800', '#ffc800', '#ff6309', '#ff6309', '#fe1f00']

function Faceit({ data }) {
  const lvl = Math.min(10, Math.max(1, data.level || 1))
  const ink = FACEIT_INK[lvl - 1]
  const next = FACEIT_FLOORS[lvl]
  const r = 26
  const arc = 2 * Math.PI * r
  return (
    <a className="faceit" href={data.url} target="_blank" rel="noreferrer" style={{ '--lvl': ink }}>
      <svg className="faceit-ring" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(233,237,242,.15)" strokeWidth="6" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={ink}
          strokeWidth="6"
          strokeDasharray={`${(arc * lvl) / 10} ${arc}`}
          transform="rotate(-90 32 32)"
        />
        <text x="32" y="40" textAnchor="middle">
          {lvl}
        </text>
      </svg>
      <span className="faceit-copy">
        <span className="pixel-label">FACEIT level {lvl}</span>
        <strong>
          {data.elo} <small>elo</small>
        </strong>
        <span className="faceit-next">
          {next ? `${next - data.elo} to level ${lvl + 1}` : 'Top level'}
          {data.stats && ` · K/D ${data.stats.kd} · ${data.stats.win_rate}% wins`}
        </span>
      </span>
      <span className="faceit-go" aria-hidden="true">
        ↗
      </span>
    </a>
  )
}

const BOTS = ['BOT Gabe', 'BOT Vladimir', 'BOT Rip', 'BOT Moe', 'BOT Zach', 'BOT Ringo', 'BOT Hank']

function CsPanel({ data, faceit }) {
  const ref = useRef(null)
  const [holes, setHoles] = useState([])
  const sx = useSpring(0, { stiffness: 500, damping: 40 })
  const sy = useSpring(0, { stiffness: 500, damping: 40 })
  const [aiming, setAiming] = useState(false)
  const [feed, setFeed] = useState([])

  const pos = (e) => {
    const b = ref.current.getBoundingClientRect()
    return { x: e.clientX - b.left, y: e.clientY - b.top }
  }
  const onMove = (e) => {
    const p = pos(e)
    sx.set(p.x)
    sy.set(p.y)
  }
  const onShoot = (e) => {
    if (e.target.closest('a, button')) return
    const p = pos(e)
    const id = Date.now() + Math.random()
    setHoles((h) => [...h.slice(-11), { ...p, id }])
    setFeed((f) => [{ id, bot: BOTS[Math.floor(Math.random() * BOTS.length)], hs: Math.random() < 0.47 }, ...f].slice(0, 4))
  }

  return (
    <article
      className="panel panel-cs"
      aria-labelledby="h-cs"
      ref={ref}
      onPointerMove={onMove}
      onPointerEnter={() => setAiming(true)}
      onPointerLeave={() => setAiming(false)}
      onClick={onShoot}
    >
      <div className="panel-copy">
        <h3 id="h-cs" className="panel-title">CS2</h3>
        <p className="panel-lede">
          Aim, utility, clutches. I liked mine enough to build{' '}
          <a href="https://github.com/dilyorm" target="_blank" rel="noreferrer">
            a tool
          </a>{' '}
          that clips every ace and clutch and sends it to Telegram.
        </p>
        <Faceit data={faceit} />
        <Stats data={data} label="CS2 stats" />
        <a className="steam-link" href={STEAM.cs2} target="_blank" rel="noreferrer">
          Steam profile
        </a>
        <p className="pixel-label cs-hint">Click to shoot, {holes.length} shots fired</p>
      </div>
      <ol className="killfeed" aria-live="polite">
        <AnimatePresence initial={false}>
          {feed.map((k) => (
            <motion.li
              key={k.id}
              layout
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span className="kf-me">kyosan</span>
              <span className="kf-gun" aria-label="shot">
                ▬▬▸
              </span>
              {k.hs && <span className="kf-hs">headshot</span>}
              <span className="kf-bot">{k.bot}</span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
      <div className="cs-target" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <AnimatePresence>
        {holes.map((h) => (
          <motion.span
            key={h.id}
            className="bullet-hole"
            style={{ left: h.x, top: h.y }}
            initial={{ scale: 1.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          />
        ))}
      </AnimatePresence>
      <motion.span className="scope" style={{ x: sx, y: sy, opacity: aiming ? 1 : 0 }} aria-hidden="true" />
    </article>
  )
}

/* ---------- Rubik's: light page, a cube you can turn ---------- */

function CubePanel({ data }) {
  return (
    <article className="panel panel-cube" aria-labelledby="h-cube">
      <div className="panel-copy">
        <h3 id="h-cube" className="panel-title">Rubik's</h3>
        <p className="panel-lede">
          Strictly a hobby: never been to a competition, just a timer at home. Drag the cube, scramble it, then cheat
          with the solve button.
        </p>
        <Stats data={data} label="Cubing stats" />
      </div>
      <Cube />
    </article>
  )
}

/* ---------- Music: yellow page, a record that spins while you hold it ---------- */

const ago = (iso) => {
  // avj stores naive UTC times; without a zone suffix JS would read them as local time.
  const t = Date.parse(iso && !/[zZ]|[+-]\d\d:?\d\d$/.test(iso) ? `${iso}Z` : iso)
  if (!t) return ''
  const m = Math.round((Date.now() - t) / 60000)
  if (m < 2) return 'right now'
  if (m < 60) return `${m} min ago`
  if (m < 48 * 60) return `${Math.round(m / 60)} h ago`
  return `${Math.round(m / 1440)} days ago`
}

const trackKey = (t) => `${t.song}|${t.artist}`

function PlayButton({ track, playing, onPlay }) {
  if (!track?.preview_url) return null
  const on = playing === trackKey(track)
  return (
    <button
      type="button"
      className={on ? 'play-btn is-on' : 'play-btn'}
      onClick={() => onPlay(track)}
      aria-label={on ? `Pause ${track.song}` : `Play a 30 second clip of ${track.song} by ${track.artist}`}
    >
      <span aria-hidden="true" />
    </button>
  )
}

function Listening({ data, playing, onPlay }) {
  if (!data) {
    return <p className="music-wait pixel-label">Asking avj what's playing…</p>
  }
  if (data.failed) {
    return (
      <p className="music-wait pixel-label">
        avj is not answering right now. <a href="https://avj.dilyor.dev">Open it yourself</a>
      </p>
    )
  }
  const songs = (data.top_songs ?? []).slice(0, 3)
  const artists = data.top_artists ?? []
  const most = Math.max(1, ...artists.map((a) => a.play_count || 0))
  const when = data.now && ago(data.now.last_listened_at)
  return (
    <div className="listening">
      {data.now && (
        <div className="music-now">
          {data.now.artwork && <img src={data.now.artwork} alt="" />}
          <p>
            <span className="pixel-label">{when === 'right now' ? 'Playing now' : 'Last played'}</span>
            <strong>{data.now.song}</strong>
            <span>
              {data.now.artist}
              {when && when !== 'right now' && `, ${when}`}
            </span>
          </p>
          <PlayButton track={data.now} playing={playing} onPlay={onPlay} />
        </div>
      )}
      <div className="music-cols">
        {songs.length > 0 && (
          <div>
            <p className="pixel-label">On repeat</p>
            <ol className="music-songs">
              {songs.map((t) => (
                <li key={`${t.song}-${t.artist}`}>
                  <PlayButton track={t} playing={playing} onPlay={onPlay} />
                  <span>
                    <strong>{t.song}</strong>
                    {t.artist}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
        {artists.length > 0 && (
          <div>
            <p className="pixel-label">{data.from_likes ? 'Liked artists' : 'Top artists, 30 days'}</p>
            <ol className="music-top">
              {artists.map((a) => (
                <li key={a.artist}>
                  <span className="music-artist">{a.artist}</span>
                  {a.play_count ? <span className="music-bar" style={{ '--w': a.play_count / most }} aria-hidden="true" /> : null}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
      {data.plays_30d > 0 && (
        <p className="pixel-label music-count">
          {data.plays_30d} plays in 30 days, {data.plays_7d} this week
        </p>
      )}
    </div>
  )
}

// Plays Apple's public 30-second preview clips (via avj); one song at a time.
function MusicPanel({ data }) {
  const audio = useRef(null)
  const [playing, setPlaying] = useState(null)
  const [label, setLabel] = useState(null)
  const live = data && !data.failed
  const first = live ? [data.now, ...(data.top_songs ?? [])].find((t) => t?.preview_url) : null

  useEffect(() => () => audio.current?.pause(), [])

  const play = (track) => {
    if (!track?.preview_url) return
    if (!audio.current) {
      audio.current = new Audio()
      audio.current.volume = 0.7
      audio.current.addEventListener('ended', () => setPlaying(null))
    }
    const a = audio.current
    if (playing === trackKey(track)) {
      a.pause()
      setPlaying(null)
      return
    }
    a.src = track.preview_url
    a.play().then(
      () => {
        setPlaying(trackKey(track))
        setLabel(track)
      },
      () => setPlaying(null),
    )
  }

  const spinning = playing !== null
  const disc = label ?? first
  return (
    <article className="panel panel-music" aria-labelledby="h-music">
      <div className="panel-copy">
        <h3 id="h-music" className="panel-title">Music</h3>
        <p className="panel-lede">
          Headphones on, always (see the portrait). Pulled live from{' '}
          <a href="https://avj.dilyor.dev" target="_blank" rel="noreferrer">
            avj
          </a>
          , the app I built so friends can see what each other is playing.
        </p>
        <Listening data={data} playing={playing} onPlay={play} />
      </div>
      <div className="record-wrap">
        <button
          type="button"
          className={spinning ? 'record is-spinning' : 'record is-idle'}
          onClick={() => (disc ? play(spinning ? label : disc) : null)}
          aria-pressed={spinning}
          aria-label={spinning ? 'Stop the record' : disc ? `Play ${disc.song}` : 'Record'}
          disabled={!first}
        >
          <span className="record-label" style={disc?.artwork ? { backgroundImage: `url(${disc.artwork})` } : undefined}>
            {!disc?.artwork && (
              <>
                <span>{'kyosan'}</span>
                <span>FM</span>
              </>
            )}
          </span>
        </button>
        <div className={spinning ? 'eq is-on' : 'eq'} aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} style={{ animationDelay: `${(i * 137) % 600}ms` }} />
          ))}
        </div>
        <p className="record-hint pixel-label" aria-live="polite">
          {spinning && label ? `${label.song} · ${label.artist}` : first ? 'Tap the record to play' : ' '}
        </p>
      </div>
    </article>
  )
}

/* ---------- Intro panel + pinned horizontal scroll ---------- */

function IntroPanel() {
  return (
    <article className="panel panel-intro" aria-labelledby="h-play">
      <div className="panel-copy">
        <h2 id="h-play" className="intro-title">Off the clock</h2>
        <p className="panel-lede">Seven things I do when the laptop closes. Keep scrolling, each one has its own room.</p>
        <ul className="intro-chips">
          {['Chess', 'Dota 2', 'Codeforces', 'CS2', 'Typing', "Rubik's cube", 'Music'].map((h) => (
            <li key={h} className="pixel-label">
              {h}
            </li>
          ))}
        </ul>
      </div>
      <img className="intro-sprite" src="/kyosan.png" alt="" />
    </article>
  )
}

export default function Hobbies() {
  const data = useHobbies()
  const ref = useRef(null)
  const wide = useMedia('(min-width: 900px)')
  const reduce = useReducedMotion()
  const panels = [
    <IntroPanel key="intro" />,
    <ChessPanel key="chess" data={data.chess} />,
    <DotaPanel key="dota" data={data.dota} />,
    <CodeforcesPanel key="cf" data={data.cf} />,
    <CsPanel key="cs" data={data.cs2} faceit={data.faceit} />,
    <TypingPanel key="typing" data={data.typing} />,
    <CubePanel key="cube" data={data.cube} />,
    <MusicPanel key="music" data={data.music} />,
  ]
  const n = panels.length
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, [0, 1], ['0%', `-${((n - 1) / n) * 100}%`])
  const bar = useTransform(scrollYProgress, [0, 1], [0, 1])
  const pinned = wide && !reduce

  if (!pinned) {
    return (
      <section className="play play--stacked" id="play">
        {panels}
      </section>
    )
  }

  return (
    <section className="play" id="play" ref={ref} style={{ height: `${n * 100}svh` }}>
      <div className="play-sticky">
        <motion.div className="play-track" style={{ x, width: `${n * 100}vw` }}>
          {panels}
        </motion.div>
        <motion.span className="play-progress" style={{ scaleX: bar }} aria-hidden="true" />
      </div>
    </section>
  )
}
