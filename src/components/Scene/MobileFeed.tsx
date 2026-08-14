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
const CARD_HEIGHT_VH = 58
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
                  padding: '0 18px 18px',
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  background: 'linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0))',
                  paddingTop: 48,
                }}
              >
                <span
                  style={{
                    color: '#fff',
                    fontSize: 20,
                    fontWeight: 600,
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
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 15,
                    flexShrink: 0,
                  }}
                >
                  →
                </span>
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
