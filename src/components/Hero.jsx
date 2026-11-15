import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { ME } from '../data'
import { useMedia } from '../hooks'
import Rider from './Rider'

const WORD = ME.nick.toUpperCase()
const BASE = 0.45 // s, lets the loader panel clear before the hero plays

function Word({ ready, as: Tag = 'div', ...rest }) {
  return (
    <Tag className="word" {...rest}>
      {WORD.split('').map((c, i) => (
        <span className="char-mask" key={i}>
          <motion.span
            className="char"
            initial={{ y: '110%' }}
            animate={{ y: ready ? '0%' : '110%' }}
            transition={{ type: 'spring', stiffness: 210, damping: 20, delay: BASE + 0.15 + i * 0.06 }}
          >
            {c}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}

const fade = (ready, delay) => ({
  initial: { opacity: 0, y: 14 },
  animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay },
})

export default function Hero({ ready }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const mobile = useMedia('(max-width: 720px)')
  const lean = mobile ? 8 : 6 // rail angle; keep in sync with --rail-angle in CSS
  const [landed, setLanded] = useState(false)

  // White disc that recolours the letters it covers.
  const r = useMotionValue(0)
  const clip = useMotionTemplate`circle(${r}vw at var(--cx) var(--cy))`
  const hole = useMotionTemplate`radial-gradient(circle ${r}vw at var(--cx) var(--cy), transparent 100%, #000 100%)`
  const discSize = useTransform(r, (v) => `${v * 2}vw`)
  useEffect(() => {
    if (!ready) return
    const target = mobile ? 62 : 34
    if (reduce) return void r.set(target)
    const c = animate(r, target, { type: 'spring', stiffness: 55, damping: 15, delay: BASE })
    return () => c.stop()
  }, [ready, reduce, mobile, r])

  // Pointer parallax.
  const mx = useSpring(0, { stiffness: 60, damping: 20 })
  const my = useSpring(0, { stiffness: 60, damping: 20 })
  const onMove = (e) => {
    if (reduce || e.pointerType !== 'mouse') return
    const b = ref.current.getBoundingClientRect()
    mx.set((e.clientX - b.left) / b.width - 0.5)
    my.set((e.clientY - b.top) / b.height - 0.5)
  }
  const wordX = useTransform(mx, (v) => v * -14)
  const wordY = useTransform(my, (v) => v * -8)
  const railX = useTransform(mx, (v) => v * 22)
  const railY = useTransform(my, (v) => v * 14)

  // Scrolling away = ollie off the rail with a kickflip.
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const lift = useTransform(p, [0, 0.6], ['0svh', reduce ? '0svh' : '-26svh'])
  const flip = useTransform(p, [0.05, 0.25, 0.45], reduce ? [1, 1, 1] : [1, -1, 1])
  const hop = useTransform(p, [0.05, 0.25, 0.45], reduce ? [0, 0, 0] : [0, -26, 0])

  const t = (d) => (reduce ? 0 : d + BASE)

  return (
    <section className="hero" id="top" ref={ref} onPointerMove={onMove} aria-label="Intro">
      <motion.div className="disc" style={{ width: discSize, height: discSize }} />

      <motion.div className="word-layer" style={{ maskImage: hole, WebkitMaskImage: hole }}>
        <motion.div style={{ x: wordX, y: wordY }}>
          <Word ready={ready} as="h1" aria-label={`${ME.nick}, also known as ${ME.name}`} />
        </motion.div>
      </motion.div>
      <motion.div className="word-layer word-navy" style={{ clipPath: clip }} aria-hidden="true">
        <motion.div style={{ x: wordX, y: wordY }}>
          <Word ready={ready} />
        </motion.div>
      </motion.div>

      <motion.div className="rail-wrap" style={{ x: railX, y: railY }}>
        <div className="rail-track">
          <motion.div
            className="rail"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: ready ? 1 : 0 }}
            transition={{ duration: t(1.0), ease: [0.65, 0, 0.35, 1], delay: t(0.3) }}
          />
          <motion.div className="rider-slot" style={{ y: lift }}>
            <motion.div
              initial={{ x: '-140vw' }}
              animate={{ x: ready ? '0vw' : '-140vw' }}
              transition={{ duration: t(1.3), ease: [0.12, 0.9, 0.25, 1], delay: t(0.7) }}
              onAnimationComplete={() => ready && setLanded(true)}
            >
              <motion.div
                className={landed ? 'is-landed' : ''}
                animate={landed && !reduce ? { scaleY: [1, 0.9, 1.03, 1] } : {}}
                transition={{ duration: 0.45 }}
                style={{ transformOrigin: '50% 100%' }}
              >
                <Rider
                  lean={lean}
                  sparking={ready && !landed && !reduce}
                  boardStyle={{ scaleY: flip }}
                  bodyStyle={{ y: hop }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <motion.p className="hero-note hero-note--a" {...fade(ready, t(1.5))}>
        {ME.role}
        <br />
        at SQB, {ME.city}
      </motion.p>
      <motion.p className="hero-note hero-note--b" {...fade(ready, t(1.6))}>
        Speech, LLMs, agents
        <br />
        and robots that listen
      </motion.p>
      <motion.p className="hero-note hero-note--c" {...fade(ready, t(1.7))}>
        aka Dilyorbek
        <br />
        Muhammadjonov
      </motion.p>

      <motion.a
        href="#contact"
        className="cta-disc"
        initial={{ scale: 0, rotate: -40 }}
        animate={ready ? { scale: 1, rotate: -8 } : { scale: 0, rotate: -40 }}
        transition={{ type: 'spring', stiffness: 160, damping: 13, delay: t(1.9) }}
        whileHover={{ scale: 1.07, rotate: 0 }}
        whileTap={{ scale: 0.95 }}
      >
        Say hi
      </motion.a>
    </section>
  )
}
