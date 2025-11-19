import { motion } from 'framer-motion';
import { experience } from '../data/data';

const Experience = () => {
  return (
    <section id="experience" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          className="text-4xl md:text-5xl font-bold mb-12 text-white"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Experience
        </motion.h2>

        <div className="relative">
          {/* Timeline Line with Circuit Pattern */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-white/30 via-white/20 to-transparent" />
          
          {/* Circuit Nodes on Timeline - positioned relative to cards */}
          {experience.map((_, index) => (
            <motion.div
              key={`node-${index}`}
              className="absolute left-6 w-4 h-4 bg-white rounded-full border-4 border-black"
              style={{ 
                top: `${index === 0 ? '8%' : index === 1 ? '58%' : '100%'}` 
              }}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              animate={{ 
                opacity: [0.6, 1, 0.6],
                boxShadow: ['0 0 0 0 rgba(255, 255, 255, 0.4)', '0 0 0 8px rgba(255, 255, 255, 0)']
              }}
              transition={{ 
                scale: { duration: 0.4, delay: index * 0.2 + 0.3 },
                opacity: { duration: 2, repeat: Infinity },
                boxShadow: { duration: 2, repeat: Infinity }
              }}
            />
          ))}

          <div className="space-y-12">
            {experience.map((exp, index) => (
              <motion.div
                key={index}
                className="relative pl-20"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >

                {/* Experience Card */}
                <div className="glass-card glass-card-hover p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-semibold text-white mb-1">
                        {exp.company}
                      </h3>
                      <p className="text-white/80 font-medium">{exp.role}</p>
                    </div>
                    <p className="text-sm text-white/60 mt-2 md:mt-0">
                      {exp.period}
                    </p>
                  </div>
                  <ul className="space-y-2 mt-4">
                    {exp.description.map((item, i) => (
                      <li key={i} className="text-white/70 flex items-start">
                        <span className="text-white/60 mr-2">▹</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;

