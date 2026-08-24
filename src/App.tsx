import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { Full } from './pages/Full'
import { Header } from './components/Header'
import { Loader } from './components/Loader'
import { VideoPreloader } from './components/VideoPreloader'
import { FluidDistortion, type FluidDistortionOptions } from './components/canvasui/FluidDistortion'
import { isMobileDevice, isSafariBrowser } from './utils/device'

// Site-wide fluid pointer effect — desktop only, per request (skips mobile
// entirely: no wrapper, no WebGL2 fluid sim, no extra listeners there).
const isMobile = isMobileDevice()

// Also skipped on desktop Safari: the effect drives its CSS filter by
// re-encoding a PNG + swapping an SVG <feImage> href every frame (see
// isSafariBrowser's comment in utils/device.ts for why that's specifically
// bad in Safari) — this was causing heavy scroll lag on both the slider and
// list pages in Safari while Chrome ran the same code smoothly.
const isSafariDesktop = !isMobile && isSafariBrowser()

// Final tuned values for the site-wide liquid effect (found via the old
// temporary debug panel, now removed since the tuning is done).
const LIQUID_OPTIONS: Required<FluidDistortionOptions> = {
  force: 2.75,
  radius: 0.25,
  curl: 6,
  pressureIterations: 1,
  pressure: 0,
  densityDissipation: 0.66,
  velocityDissipation: 1,
  simResolution: 512,
  dyeResolution: 512,
  distortion: 200,
  updateEveryNFrames: 1,
}

export default function App() {
  // The heavy WebGL scene is only mounted once the Loader says it's safe to
  // (either the loading animation has started fading out, or it's already
  // been seen this session) — see the comment in Loader.tsx for why.
  const [siteReady, setSiteReady] = useState(false)

  const siteContent = siteReady && (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects/:slug" element={<Home />} />
        <Route path="/full" element={<Full />} />
        <Route path="/full/projects/:slug" element={<Full />} />
      </Routes>
    </>
  )

  return (
    <>
      {/* Starts fetching the first few project videos as soon as the app
          boots, so the loading screen's ~3.5s isn't wasted network-wise.
          Kept mounted for good — removing it would cancel any in-flight
          request instead of letting it finish in the background. */}
      <VideoPreloader />

      {isMobile || isSafariDesktop ? (
        siteContent
      ) : (
        <FluidDistortion
          {...LIQUID_OPTIONS}
          // The whole layout is a fixed-viewport SPA (no page scroll), so
          // pinning this wrapper to exactly 100vh keeps position:fixed
          // descendants (Header, Scene, overlays) anchored exactly as if
          // this wrapper weren't here — `filter` makes it a containing
          // block for them, so its box must match the viewport precisely.
          style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}
        >
          {siteContent}
        </FluidDistortion>
      )}
      <Loader onReveal={() => setSiteReady(true)} />
    </>
  )
}
