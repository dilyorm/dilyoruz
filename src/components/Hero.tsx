import { motion } from 'framer-motion';
import { personalInfo } from '../data/data';

const Hero = () => {
  const techStack = ['Python', 'C++', 'SQL', 'PyTorch', 'TensorFlow', 'OpenCV', 'Numpy', 'Pandas'];

  return (
    <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden circuit-pattern">
      {/* Animated Circuit Background */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          {/* Circuit Lines */}
          {[
            { d: 'M 100 100 L 300 100 L 300 200 L 500 200' },
            { d: 'M 700 150 L 900 150 L 900 300 L 1100 300' },
            { d: 'M 200 400 L 400 400 L 400 600 L 600 600' },
            { d: 'M 800 500 L 1000 500 L 1000 700' },
          ].map((path, i) => (
            <motion.path
              key={i}
              d={path.d}
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="1.5"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.15 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', delay: i * 0.3 }}
            />
          ))}
          
          {/* Circuit Nodes */}
          {[
            { cx: 100, cy: 100 },
            { cx: 500, cy: 200 },
            { cx: 1100, cy: 300 },
            { cx: 600, cy: 600 },
            { cx: 1000, cy: 700 },
          ].map((node, i) => (
            <motion.circle
              key={i}
              cx={node.cx}
              cy={node.cy}
              r="4"
              fill="rgba(255, 255, 255, 0.3)"
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
            />
          ))}
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.p
              className="text-white/60 text-sm font-mono mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {personalInfo.role}
            </motion.p>
            
            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Hi, I'm{' '}
              <span className="text-white">Dilyorbek</span>.
            </motion.h1>
            
            <motion.p
              className="text-lg md:text-xl text-white/70 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {personalInfo.tagline}
            </motion.p>

            {/* Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.a
                href="#projects"
                className="px-8 py-3 bg-white text-black font-semibold rounded-lg text-center"
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(255, 255, 255, 0.3)' }}
                whileTap={{ scale: 0.95 }}
              >
                View Projects
              </motion.a>
              <motion.a
                href="/Dilyorbek.pdf"
                download="Dilyorbek.pdf"
                className="px-8 py-3 border-2 border-white/30 text-white font-semibold rounded-lg text-center hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Download Resume
              </motion.a>
            </motion.div>

            {/* Tech Stack Chips */}
            <motion.div
              className="flex flex-wrap gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {techStack.map((tech, index) => (
                <motion.span
                  key={tech}
                  className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-white/70"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.1, borderColor: 'rgba(255, 255, 255, 0.3)' }}
                >
                  {tech}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>

          {/* Right - Avatar/Illustration */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto">
              {/* Circular Avatar Placeholder */}
              <motion.div
                className="w-full h-full rounded-full bg-white/5 border-2 border-white/20 flex items-center justify-center"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 8, repeat: Infinity, repeatType: 'reverse' }}
              >
                <div className="text-6xl md:text-8xl font-bold text-white/30">
                  DM
                </div>
              </motion.div>

              {/* Floating Circuit Nodes */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white/40 rounded-full"
                  style={{
                    top: `${20 + i * 15}%`,
                    left: `${i % 2 === 0 ? 10 : 90}%`,
                  }}
                  animate={{
                    opacity: [0.2, 0.6, 0.2],
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

