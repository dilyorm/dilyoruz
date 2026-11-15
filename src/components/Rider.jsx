import { motion } from 'framer-motion'
import { useMemo } from 'react'

// Pixel skateboard, side view. One character = one art pixel.
// Rows 0-5 deck, 6-7 truck, 8-12 wheel. The rail's top edge sits at the axle, row 10.
const BOARD = [
  'KK....................................................KK',
  'YKK..................................................KKY',
  'YYKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKYY',
  'OYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYO',
  '.OYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYO.',
  '..OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO..',
  '..........ssssss.......................ssssss...........',
  '...........OSSO.........................OSSO............',
  '............OOO..........................OOO............',
  '...........OWWWO........................OWWWO...........',
  '...........OWHWO........................OWHWO...........',
  '...........OWWWO........................OWWWO...........',
  '............OOO..........................OOO............',
]
export const BOARD_W = BOARD[0].length // 56
export const BOARD_H = BOARD.length // 13
export const RAIL_ROW = 10
const TRUCKS = [13, 42]

const FILL = {
  K: '#0E1E5B',
  O: '#0E1E5B',
  Y: '#FFE500',
  s: '#7D8BA6',
  S: '#DCE3EE',
  W: '#FFFFFF',
  H: '#0E1E5B',
}

function Sparks({ x, y }) {
  const sparks = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        dx: -(3 + Math.random() * 9),
        dy: -1 - Math.random() * 4,
        delay: Math.random() * 0.3,
        white: i % 3 === 0,
      })),
    [],
  )
  return sparks.map((s, i) => (
    <motion.rect
      key={i}
      width="1"
      height="1"
      fill={s.white ? '#FFFFFF' : '#FFE500'}
      initial={{ x, y, opacity: 0 }}
      animate={{ x: [x, x + s.dx], y: [y, y + s.dy, y + s.dy + 3], opacity: [1, 1, 0] }}
      transition={{ duration: 0.35, delay: s.delay, repeat: Infinity, repeatDelay: 0.08, ease: 'easeOut' }}
    />
  ))
}

export function PixelBoard({ sparking = false, className = '' }) {
  const rects = useMemo(() => {
    const out = []
    BOARD.forEach((row, y) =>
      [...row].forEach((c, x) => {
        if (c !== '.') out.push(<rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill={FILL[c]} />)
      }),
    )
    return out
  }, [])
  return (
    <svg
      className={`pixel-board ${className}`}
      viewBox={`0 0 ${BOARD_W} ${BOARD_H}`}
      shapeRendering="crispEdges"
      overflow="visible"
      aria-hidden="true"
    >
      {rects}
      {sparking && TRUCKS.map((x) => <Sparks key={x} x={x} y={RAIL_ROW} />)}
    </svg>
  )
}

/**
 * Kyosan on a board. Board lies along whatever the parent is rotated to;
 * the rider counter-rotates by `lean` so he stays upright.
 */
export default function Rider({ sparking, lean = 0, boardStyle, bodyStyle, sprite = '/kyosan.png' }) {
  return (
    <div className="rider">
      <motion.div className="rider-body" style={{ rotate: -lean, ...bodyStyle }}>
        <img src={sprite} alt="" draggable="false" />
      </motion.div>
      <motion.div className="rider-board" style={boardStyle}>
        <PixelBoard sparking={sparking} />
      </motion.div>
    </div>
  )
}
