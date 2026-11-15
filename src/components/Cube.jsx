import { motion, useAnimationFrame, useMotionTemplate, useMotionValue, useReducedMotion } from 'framer-motion'
import { useRef, useState } from 'react'

const COLORS = ['#FFFFFF', '#FFD500', '#C41E3A', '#FF5800', '#0051BA', '#009E60']
const FACES = ['front', 'back', 'right', 'left', 'top', 'bottom']
const solved = () => FACES.map((_, f) => Array(9).fill(COLORS[f]))

function shuffle(faces) {
  const all = faces.flat()
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[all[i], all[j]] = [all[j], all[i]]
  }
  return FACES.map((_, f) => all.slice(f * 9, f * 9 + 9))
}

export default function Cube() {
  const reduce = useReducedMotion()
  const rx = useMotionValue(-24)
  const ry = useMotionValue(36)
  const transform = useMotionTemplate`rotateX(${rx}deg) rotateY(${ry}deg)`
  const drag = useRef(null)
  const [faces, setFaces] = useState(solved)

  useAnimationFrame((_, delta) => {
    if (!drag.current && !reduce) ry.set(ry.get() + delta * 0.012)
  })

  const onDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, y: e.clientY, rx: rx.get(), ry: ry.get() }
  }
  const onMove = (e) => {
    const d = drag.current
    if (!d) return
    ry.set(d.ry + (e.clientX - d.x) * 0.5)
    rx.set(Math.max(-80, Math.min(80, d.rx - (e.clientY - d.y) * 0.5)))
  }
  const onUp = () => (drag.current = null)

  return (
    <div className="cube-wrap">
      <div
        className="cube-stage"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        role="img"
        aria-label="A Rubik's cube you can drag to turn"
      >
        <motion.div className="cube" style={{ transform }}>
          {FACES.map((name, f) => (
            <div key={name} className={`cube-face cube-${name}`}>
              {faces[f].map((c, i) => (
                <span key={i} style={{ background: c }} />
              ))}
            </div>
          ))}
        </motion.div>
      </div>
      <div className="cube-actions">
        <button type="button" onClick={() => setFaces(shuffle)}>
          Scramble
        </button>
        <button type="button" onClick={() => setFaces(solved)}>
          Solve
        </button>
      </div>
    </div>
  )
}
