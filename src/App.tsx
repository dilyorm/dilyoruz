import { useState, useEffect } from 'react';
import ReactGA from "react-ga4";
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Achievements from './components/Achievements';
import Contact from './components/Contact';
import ScrollToTop from './components/ScrollToTop';
import BootScreen from './components/BootScreen';
import { personalInfo } from './data/data';
import LegoAvatar from './components/LegoAvatar';

function App() {
  const [isBooted, setIsBooted] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    // Initialize Google Analytics
    // Replace with your Measurement ID
    const gaId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;
    if (gaId && gaId !== 'G-MEASUREMENT_ID') {
      ReactGA.initialize(gaId);
      // Send pageview with a custom path
      ReactGA.send({ hitType: "pageview", page: window.location.pathname });
    }
  }, []);

  return (
    <>
      <AnimatePresence>
        {!isBooted && <BootScreen onBootComplete={() => setIsBooted(true)} />}
      </AnimatePresence>

      <AnimatePresence>
        {isBooted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen"
          >
            <Navbar />
            <main>
              <Hero />
              <About />
              <Experience />
              <Projects />
              <Skills />
              <Achievements />
              <Contact />
            </main>
            <footer className="py-8 px-4 text-center text-white/40 text-sm">
              <p>
                © {currentYear} Muhammadjonov Dilyorbek · Contact:{' '}
                <a
                  href={`mailto:${personalInfo.email}`}
                  className="text-white/60 hover:text-white underline underline-offset-4"
                >
                  {personalInfo.displayEmail || personalInfo.email}
                </a>{' '}
                · Telegram:{' '}
                <a
                  href={`https://${personalInfo.telegram}`}
                  className="text-white/60 hover:text-white underline underline-offset-4"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {personalInfo.telegram}
                </a>
              </p>
            </footer>
            <ScrollToTop />
            <LegoAvatar />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;

