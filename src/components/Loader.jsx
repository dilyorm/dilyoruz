import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { useEffect } from 'react'
import { ME } from '../data'
import Rider from './Rider'

const DURATION = 1.3
const EASE = [0.65, 0, 0.35, 1]

export default function Loader({ onDone }) {
  const count = useMotionValue(0)
  const shown = useTransform(count, (v) => String(Math.round(v)).padStart(3, '0'))
  const left = useTransform(count, (v) => `${v}%`)

  useEffect(() => {
    const c = animate(count, 100, { duration: DURATION, ease: EASE, onComplete: () => setTimeout(onDone, 150) })
    return () => c.stop()
  }, [count, onDone])

  return (
    <motion.div
      className="loader"
      initial={{ y: 0 }}
      exit={{ y: '-100%', transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] } }}
    >
      <div className="loader-top">
        <span className="logo logo-navy">{ME.short}</span>
        <span className="pixel-label">Dropping in</span>
      </div>
      <motion.div className="loader-count">{shown}</motion.div>
      <div className="loader-track">
        <motion.div className="loader-rider" style={{ left }}>
          <Rider />
        </motion.div>
      </div>
    </motion.div>
  )
}
