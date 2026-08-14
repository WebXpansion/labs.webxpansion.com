import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { CustomEase } from 'gsap/CustomEase'
import type { Project } from '../../data/projects'

gsap.registerPlugin(SplitText, CustomEase)
CustomEase.create('osmo-ease', '0.625, 0.05, 0, 1')

interface ProjectOverlayProps {
  project: Project | null
}

export function ProjectOverlay({ project }: ProjectOverlayProps) {
  const navigate = useNavigate()
  const titleRef = useRef<HTMLHeadingElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)

  // "Lines" mask-reveal on the title + description, adapted from Osmo's
  // SplitText demo (https://osmo.supply/) — lines-only, no words/letters
  // mode, no cursor/body styling from the original pen.
  useEffect(() => {
    if (!project) return
    const targets = ([titleRef.current, descRef.current] as (HTMLElement | null)[]).filter(
      (el): el is HTMLElement => !!el,
    )
    if (!targets.length) return

    let splits: SplitText[] = []
    let tween: gsap.core.Tween | null = null
    let cancelled = false

    document.fonts.ready.then(() => {
      if (cancelled) return
      splits = targets.map(
        (el) =>
          new SplitText(el, {
            type: 'lines',
            mask: 'lines',
            linesClass: 'overlay-line',
          }),
      )
      const lines = splits.flatMap((split) => split.lines)
      tween = gsap.fromTo(
        lines,
        { yPercent: 110 },
        { yPercent: 0, duration: 0.8, stagger: 0.08, ease: 'osmo-ease' },
      )
    })

    return () => {
      cancelled = true
      tween?.kill()
      splits.forEach((split) => split.revert())
    }
  }, [project])

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          key={project.id}
          className="project-overlay"
          initial={{ opacity: 0, scale: 0.9, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed',
            inset: '3vh 4vw',
            background: '#fff',
            color: '#111',
            borderRadius: 18,
            zIndex: 30,
            overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 380px) 1fr',
            boxShadow: '0 40px 120px rgba(0,0,0,0.5)',
          }}
        >
          <button
            onClick={() => navigate('/')}
            aria-label="Close"
            className="project-overlay-close"
            style={{
              position: 'absolute',
              top: 24,
              right: 24,
              width: 44,
              height: 44,
              boxSizing: 'border-box',
              borderRadius: '50%',
              background: '#111',
              color: '#fff',
              border: '1px solid transparent',
              cursor: 'pointer',
              fontSize: 18,
              zIndex: 2,
              transition: 'background-color 0.35s ease, color 0.35s ease, border-color 0.35s ease',
            }}
          >
            ×
          </button>

          <div
            className="overlay-text"
            style={{
              padding: '64px 48px',
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <h1
              ref={titleRef}
              className="overlay-title"
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: 42,
                margin: 0,
                marginBottom: 20,
                lineHeight: 1.1,
              }}
            >
              {project.title}
            </h1>
            <p ref={descRef} style={{ fontSize: 15, lineHeight: 1.6, color: '#333', maxWidth: 320 }}>
              {project.description}
            </p>

            <div style={{ display: 'flex', gap: 10, marginTop: 32, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Not every project has a live link — only render this when
                  project.url is set for this project. */}
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Voir le site"
                  className="overlay-link"
                  style={{
                    width: 32,
                    height: 32,
                    boxSizing: 'border-box',
                    borderRadius: '50%',
                    background: '#111',
                    color: '#fff',
                    border: '1px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_2194_45)">
                      <path
                        d="M32.2791 4.78012L14.1558 4.78012C12.9079 4.78012 11.8978 5.79027 11.9275 7.00839C11.9275 8.25623 12.9376 9.26638 14.1558 9.23667L26.9312 9.23667L5.6586 30.5093C4.797 31.3709 4.79699 32.797 5.6586 33.6586C6.5202 34.5202 7.94629 34.5202 8.80789 33.6586L30.0508 12.4157L30.0805 25.1614C30.0805 26.4093 31.0907 27.4194 32.3088 27.3897C32.903 27.3897 33.4972 27.152 33.9132 26.7361C34.3291 26.3201 34.5668 25.7853 34.5668 25.1317L34.5668 6.94897C34.5668 6.35477 34.3291 5.76056 33.9132 5.34462C33.4675 5.0178 32.8733 4.78012 32.2791 4.78012Z"
                        fill="currentColor"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_2194_45">
                        <rect width="40" height="40" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </a>
              )}
              <span
                style={{
                  padding: '8px 16px',
                  borderRadius: 20,
                  background: '#f1f1f1',
                  fontSize: 12,
                  letterSpacing: '0.05em',
                }}
              >
                {project.category.toUpperCase()}
              </span>
              <span
                style={{
                  padding: '8px 16px',
                  borderRadius: 20,
                  background: '#f1f1f1',
                  fontSize: 12,
                  letterSpacing: '0.05em',
                }}
              >
                {project.year}
              </span>
            </div>
          </div>

          <div
            className="overlay-media"
            style={{
              overflowY: 'auto',
              padding: '24px 92px',
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
            }}
          >
            {project.video ? (
              <video
                key={project.video}
                src={project.video}
                autoPlay
                muted
                loop
                playsInline
                style={{ width: '100%', borderRadius: 10, display: 'block', background: '#000' }}
              />
            ) : (
              <img
                src={project.bgImage}
                alt={project.title}
                style={{ width: '100%', borderRadius: 10, display: 'block' }}
              />
            )}
          </div>

          <style>{`
            .project-overlay-close:hover {
              background: #fff !important;
              color: #111 !important;
              border-color: #111 !important;
            }
            .overlay-link:hover {
              background: #fff !important;
              color: #111 !important;
              border-color: #111 !important;
            }
            @media (max-width: 820px) {
              .project-overlay {
                inset: 0 !important;
                bottom: auto !important;
                height: auto !important;
                min-height: 100vh !important;
                border-radius: 0 !important;
                grid-template-columns: 1fr !important;
                grid-template-rows: auto auto;
                align-content: start;
                overflow-y: auto !important;
              }
              .overlay-media {
                padding: 16px !important;
              }
              .overlay-text {
                height: auto !important;
                padding: 84px 24px 40px !important;
              }
              .overlay-title {
                font-size: 28px !important;
                margin-bottom: 14px !important;
              }
              .project-overlay-close {
                top: 16px !important;
                right: 16px !important;
                width: 38px !important;
                height: 38px !important;
              }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
