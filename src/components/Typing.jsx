import { useMemo, useRef, useState } from 'react'
import { useMedia } from '../hooks'

const WORDS = (
  'train ship break fix skate model loss batch token agent robot speech rail board push kick flip ' +
  'grind code test deploy layer tensor prompt chess knight cube scramble record spin music night ' +
  'fast clean small sharp light quiet loud left right over under again still'
).split(' ')

const pick = (n) => Array.from({ length: n }, () => WORDS[Math.floor(Math.random() * WORDS.length)]).join(' ')
const fmtTime = (s) => {
  const h = Math.floor(s / 3600)
  const m = Math.round((s % 3600) / 60)
  return (h ? `${h} h ${m} min` : `${m} min`).replaceAll(' ', ' ')
}

// A 15-word race against the clock. Only listens while its own input has focus.
function TypingTest({ best }) {
  const [target, setTarget] = useState(() => pick(15))
  const [typed, setTyped] = useState('')
  const [start, setStart] = useState(null)
  const [end, setEnd] = useState(null)
  const input = useRef(null)
  const touch = useMedia('(hover: none)')

  const correct = useMemo(() => [...typed].filter((c, i) => c === target[i]).length, [typed, target])
  const done = end !== null
  const minutes = ((end ?? Date.now()) - (start ?? Date.now())) / 60000
  const wpm = start && minutes > 0 ? Math.round(correct / 5 / minutes) : 0
  const acc = typed.length ? Math.round((correct / typed.length) * 100) : 100

  const onChange = (e) => {
    if (done) return
    const v = e.target.value.slice(0, target.length)
    if (!start && v) setStart(Date.now())
    setTyped(v)
    if (v.length === target.length) setEnd(Date.now())
  }
  const restart = () => {
    setTarget(pick(15))
    setTyped('')
    setStart(null)
    setEnd(null)
    input.current?.focus()
  }

  return (
    <div className="typer">
      <label className={done ? 'typer-box is-done' : 'typer-box'}>
        <input
          ref={input}
          className="typer-input"
          value={typed}
          onChange={onChange}
          aria-label="Type the words shown"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
        />
        <span className="typer-words" aria-hidden="true">
          {[...target].map((c, i) => {
            const cls = i < typed.length ? (typed[i] === c ? 'ok' : 'bad') : ''
            return (
              <span key={i} className={cls} data-caret={i === typed.length || undefined}>
                {c}
              </span>
            )
          })}
        </span>
        {!start && <span className="typer-hint pixel-label">{touch ? 'Tap here and type' : 'Click here and type'}</span>}
      </label>
      <div className="typer-bar" aria-live="polite">
        <span>
          <b>{wpm}</b> wpm
        </span>
        <span>
          <b>{acc}</b>% acc
        </span>
        {done && (
          <span className="typer-verdict">
            {wpm > best ? 'Faster than me. Respect.' : `${Math.round(best - wpm)} wpm behind kyosan`}
          </span>
        )}
        <button type="button" onClick={restart}>
          {done ? 'Again' : 'New words'}
        </button>
      </div>
    </div>
  )
}

export default function TypingPanel({ data }) {
  const top = data.pbs.reduce((a, b) => (b.wpm > a.wpm ? b : a))
  const max = Math.max(...data.pbs.map((p) => p.wpm))
  const quick = data.pbs.find((p) => p.mode === '15 s') ?? top
  return (
    <article className="panel panel-typing" aria-labelledby="h-typing">
      <div className="panel-copy">
        <h3 id="h-typing" className="panel-title">
          Typing<span className="typing-caret" aria-hidden="true" />
        </h3>
        <p className="panel-lede">
          Warm-up before the real keyboard work. {data.tests} tests finished on{' '}
          <a href="https://monkeytype.com/profile/kyosand" target="_blank" rel="noreferrer">
            Monkeytype
          </a>
          , {fmtTime(data.seconds)} of pure typing.
        </p>
        <ul className="typing-pbs" aria-label="Personal bests">
          {data.pbs.map((p) => (
            <li key={p.mode}>
              <span className="pixel-label">{p.mode}</span>
              <span className="typing-bar" style={{ '--w': p.wpm / max }} aria-hidden="true" />
              <span className="typing-wpm">
                {Math.round(p.wpm)} <small>wpm</small>
              </span>
              <span className="typing-acc">{Math.round(p.acc)}%</span>
            </li>
          ))}
        </ul>
      </div>
      <TypingTest best={quick.wpm} />
    </article>
  )
}
