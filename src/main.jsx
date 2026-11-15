import React, { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { AnimatePresence, MotionConfig, useReducedMotion } from 'framer-motion'
import { BrowserRouter, Route as Path, Routes, useLocation } from 'react-router-dom'
import Loader from './components/Loader'
import Hero from './components/Hero'
import Hobbies from './components/Hobbies'
import { About, Contact, Marquee, Nav, Route, Trophies, Work } from './components/Sections'
import { BlogIndex, BlogPost } from './components/Blog'
import './styles.css'

const Admin = lazy(() => import('./components/Admin'))

function Home() {
  const reduce = useReducedMotion()
  const [ready, setReady] = useState(false)
  const done = useCallback(() => setReady(true), [])

  useEffect(() => {
    if (reduce) setReady(true)
  }, [reduce])

  useEffect(() => {
    document.documentElement.style.overflow = ready ? '' : 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [ready])

  useEffect(() => {
    document.title = 'kyosan · Dilyor'
  }, [])

  return (
    <>
      <AnimatePresence>{!ready && <Loader key="loader" onDone={done} />}</AnimatePresence>
      <div className="page">
        <Nav ready={ready} />
        <Hero ready={ready} />
        <Marquee />
        <About />
        <Route />
        <Work />
        <Trophies />
        <Hobbies />
        <Contact />
      </div>
    </>
  )
}

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Path path="/" element={<Home />} />
          <Path path="/blog" element={<BlogIndex />} />
          <Path path="/blog/:slug" element={<BlogPost />} />
          <Path
            path="/admin/*"
            element={
              <Suspense fallback={null}>
                <Admin />
              </Suspense>
            }
          />
          <Path path="*" element={<BlogIndex notFound />} />
        </Routes>
      </BrowserRouter>
    </MotionConfig>
  )
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
