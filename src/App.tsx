import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { Full } from './pages/Full'
import { Header } from './components/Header'
import { Loader } from './components/Loader'
import { VideoPreloader } from './components/VideoPreloader'

export default function App() {
  // The heavy WebGL scene is only mounted once the Loader says it's safe to
  // (either the loading animation has started fading out, or it's already
  // been seen this session) — see the comment in Loader.tsx for why.
  const [siteReady, setSiteReady] = useState(false)

  return (
    <>
      {/* Starts fetching the first few project videos as soon as the app
          boots, so the loading screen's ~3.5s isn't wasted network-wise.
          Kept mounted for good — removing it would cancel any in-flight
          request instead of letting it finish in the background. */}
      <VideoPreloader />

      {siteReady && (
        <>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects/:slug" element={<Home />} />
            <Route path="/full" element={<Full />} />
            <Route path="/full/projects/:slug" element={<Full />} />
          </Routes>
        </>
      )}
      <Loader onReveal={() => setSiteReady(true)} />
    </>
  )
}
