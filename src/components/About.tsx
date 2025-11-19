import { motion } from 'framer-motion';
import { about } from '../data/data';

const About = () => {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          className="text-4xl md:text-5xl font-bold mb-8 text-white"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          About
        </motion.h2>

        <motion.p
          className="text-lg text-white/70 mb-12 max-w-3xl leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {about.description}
        </motion.p>

        {/* Education Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {about.education.map((edu, index) => (
            <motion.div
              key={index}
              className="glass-card glass-card-hover p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
            >
              <h3 className="text-xl font-semibold mb-2 text-white">
                {edu.institution}
              </h3>
              <p className="text-white/80 mb-2">{edu.degree}</p>
              <p className="text-sm text-white/60">{edu.period}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;

