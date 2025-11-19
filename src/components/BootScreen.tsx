import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BootScreenProps {
  onBootComplete: () => void;
}

const BootScreen = ({ onBootComplete }: BootScreenProps) => {
  const [phase, setPhase] = useState<'typing' | 'circuits' | 'complete'>('typing');
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [progress, setProgress] = useState(0);
  const [bootLog, setBootLog] = useState('');

  const fullText = 'kyosan';
  const bootMessages = [
    'initializing ai_layer...',
    'loading modules: CV, NLP, RAG, speech...',
    'status: online',
  ];

  // Phase 1: Typing animation
  useEffect(() => {
    if (phase === 'typing') {
      let currentIndex = 0;
      const typingInterval = setInterval(() => {
        if (currentIndex < fullText.length) {
          setTypedText(fullText.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          setTimeout(() => {
            setPhase('circuits');
          }, 1000);
        }
      }, 150);

      return () => clearInterval(typingInterval);
    }
  }, [phase]);

  // Progress indicator
  useEffect(() => {
    if (phase === 'typing') {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 200);
      return () => clearInterval(progressInterval);
    }
  }, [phase]);

  // Boot log messages
  useEffect(() => {
    if (phase === 'typing') {
      let messageIndex = 0;
      const logInterval = setInterval(() => {
        if (messageIndex < bootMessages.length) {
          setBootLog(bootMessages[messageIndex]);
          messageIndex++;
        } else {
          clearInterval(logInterval);
        }
      }, 600);
      return () => clearInterval(logInterval);
    }
  }, [phase]);

  // Cursor blink
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  // Phase 2: Circuit animation
  useEffect(() => {
    if (phase === 'circuits') {
      const timer = setTimeout(() => {
        setPhase('complete');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Phase 3: Complete and fade out
  useEffect(() => {
    if (phase === 'complete') {
      const timer = setTimeout(() => {
        onBootComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [phase, onBootComplete]);

  // Circuit nodes for phase 2
  const circuitNodes = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 0.5,
  }));

  return (
    <AnimatePresence>
      {phase !== 'complete' && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 bg-black z-[100] flex items-center justify-center"
        >
          {/* Phase 1: Typing */}
          {phase === 'typing' && (
            <motion.div
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.h1
                className="text-6xl md:text-8xl font-bold font-mono text-white mb-4"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                {typedText}
                <motion.span
                  animate={{ opacity: showCursor ? 1 : 0 }}
                  className="inline-block ml-2"
                >
                  |
                </motion.span>
              </motion.h1>

              <motion.p
                className="text-white/60 font-mono text-sm md:text-base mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {bootLog}
              </motion.p>

              <motion.div
                className="w-64 mx-auto h-1 bg-white/10 rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <motion.div
                  className="h-full bg-white"
                  initial={{ width: '0%' }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
              <motion.p
                className="text-white/40 font-mono text-xs mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                {Math.round(progress)}%
              </motion.p>
            </motion.div>
          )}

          {/* Phase 2: Circuit Animation */}
          {phase === 'circuits' && (
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <svg className="w-full h-full" viewBox="0 0 1000 1000">
                {/* Circuit Lines */}
                {[
                  { x1: 100, y1: 200, x2: 300, y2: 200 },
                  { x1: 300, y1: 200, x2: 300, y2: 400 },
                  { x1: 300, y1: 400, x2: 500, y2: 400 },
                  { x1: 700, y1: 300, x2: 900, y2: 300 },
                  { x1: 700, y1: 300, x2: 700, y2: 600 },
                  { x1: 200, y1: 600, x2: 400, y2: 600 },
                  { x1: 500, y1: 500, x2: 700, y2: 500 },
                ].map((line, i) => (
                  <motion.line
                    key={i}
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="1"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.2 }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                  />
                ))}

                {/* Circuit Nodes */}
                {circuitNodes.map((node) => (
                  <motion.circle
                    key={node.id}
                    cx={`${node.x}%`}
                    cy={`${node.y}%`}
                    r="3"
                    fill="rgba(255, 255, 255, 0.4)"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0.2, 0.6, 0.2],
                      scale: [1, 1.3, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: node.delay,
                    }}
                  />
                ))}

                {/* Signal Pulses */}
                {[0, 1, 2].map((i) => (
                  <motion.circle
                    key={`pulse-${i}`}
                    cx="100"
                    cy="200"
                    r="2"
                    fill="white"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0, 1, 1, 0],
                      cx: ['100', '300', '300', '500'],
                      cy: ['200', '200', '400', '400'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.7,
                      times: [0, 0.3, 0.6, 1],
                    }}
                  />
                ))}
              </svg>

              {/* Debug Text */}
              <motion.div
                className="absolute bottom-8 left-8 font-mono text-xs text-white/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div>loading modules: CV, NLP, RAG, speech...</div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  status: online
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BootScreen;

