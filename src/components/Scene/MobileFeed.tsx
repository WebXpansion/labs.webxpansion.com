import { useEffect, useRef } from 'react'
import { projects } from '../../data/projects'
import type { Project } from '../../data/projects'

interface MobileFeedProps {
  onSelect: (project: Project) => void
  dimmed: boolean
}

// Plain-HTML infinite-feel vertical feed for mobile — no WebGL, no shader.
// Native <video> tags don't need CORS headers to just play on screen (only
// reading their pixels into a canvas/WebGL texture does), so this sidesteps
// the CORS issue entirely and is far more robust on real devices.
const REPEATS = 3

// Card height and the gap between cards are two independent knobs (each
// slide's height is CARD_HEIGHT + GAP, and the card fills 100% of that
// minus GAP) — change CARD_HEIGHT to resize cards, GAP to tighten/loosen
// the space between them.
const CARD_HEIGHT_VH = 46
const GAP_PX = 12
const SLIDE_HEIGHT = `calc(${CARD_HEIGHT_VH}vh + ${GAP_PX}px)`

export function MobileFeed({ onSelect, dimmed }: MobileFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const slideHeightPx = (CARD_HEIGHT_VH / 100) * window.innerHeight + GAP_PX
    const setHeight = projects.length * slideHeightPx
    el.scrollTop = setHeight // start in the middle copy

    function onScroll() {
      if (!el) return
      if (el.scrollTop < setHeight * 0.5) {
        el.scrollTop += setHeight
      } else if (el.scrollTop > setHeight * (REPEATS - 1.5)) {
        el.scrollTop -= setHeight
      }
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  // Only the card near the vertical centre of the screen should actually
  // play its video — same idea as the desktop slider's ACTIVE_RANGE, ported
  // to plain DOM here. A thin IntersectionObserver band means a video
  // starts as its card crosses into the centre and stops the moment it
  // leaves, even when scrolling fast, instead of every card autoplaying at
  // once.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement
          if (entry.isIntersecting) {
            video.play().catch(() => {})
          } else {
            video.pause()
          }
        })
      },
      { rootMargin: '-42% 0px -42% 0px', threshold: 0 },
    )
    videoRefs.current.forEach((video) => video && observer.observe(video))
    return () => observer.disconnect()
  }, [])

  const items = Array.from({ length: REPEATS }, () => projects).flat()

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        transition: 'opacity 0.5s ease',
        opacity: dimmed ? 0.15 : 1,
        pointerEvents: dimmed ? 'none' : 'auto',
      }}
    >
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          inset: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {items.map((project, i) => (
          <div
            key={`${project.id}-${i}`}
            style={{
              height: SLIDE_HEIGHT,
              display: 'flex',
              alignItems: 'flex-start',
              padding: `0 4vw ${GAP_PX}px`,
              boxSizing: 'border-box',
            }}
          >
            <button
              type="button"
              onClick={() => onSelect(project)}
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                borderRadius: 20,
                overflow: 'hidden',
                background: '#111',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                display: 'block',
              }}
            >
              {project.video ? (
                <video
                  ref={(el) => {
                    videoRefs.current[i] = el
                  }}
                  src={project.video}
                  poster={project.bgImage}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <img
                  src={project.bgImage}
                  alt={project.title}
                  loading="lazy"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}

              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  padding: '48px 18px 24px',
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  background: 'linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0))',
                }}
              >
                <span
                  style={{
                    color: '#fff',
                    fontSize: 18,
                    fontWeight: 400,
                    letterSpacing: '0.01em',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '75%',
                  }}
                >
                  {project.title}
                </span>
                <span
                  aria-hidden
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#mobile-arrow-clip)">
                      <path
                        d="M39.0481 17.9183L26.233 5.10317C25.3507 4.22082 23.9221 4.22082 23.0818 5.10317C22.1994 5.98552 22.1994 7.4141 23.0818 8.25443L32.1154 17.288H2.03133C0.812847 17.288 -0.195557 18.2964 -0.195557 19.5149C-0.195557 20.7334 0.812847 21.7418 2.03133 21.7418L32.0734 21.7418L23.0818 30.7754C22.1994 31.6578 22.1994 33.0864 23.0818 33.9267C23.5019 34.3469 24.0902 34.599 24.6784 34.599C25.2666 34.599 25.8128 34.3889 26.275 33.9267L39.1322 21.0696C39.5523 20.6494 39.8044 20.0612 39.8044 19.4729C39.7204 18.9267 39.4683 18.3385 39.0481 17.9183Z"
                        fill="white"
                      />
                    </g>
                    <defs>
                      <clipPath id="mobile-arrow-clip">
                        <rect width="40" height="40" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </span>
              </div>
            </button>
          </div>
        ))}
      </div>

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '18vh',
          background: 'linear-gradient(rgb(0 0 0) 30%, rgb(0 0 0 / 0%) 100%)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '18vh',
          background: 'linear-gradient(to top, rgb(0, 0, 0) 30%, rgba(0, 0, 0, 0) 100%)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />
    </div>
  )
}
