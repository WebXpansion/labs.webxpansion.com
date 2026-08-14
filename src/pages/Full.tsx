import { useEffect, useMemo, useRef } from 'react'
import type { CSSProperties } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { gsap } from 'gsap'
import { projects } from '../data/projects'
import type { Project } from '../data/projects'
import { ProjectOverlay } from '../components/Overlay/ProjectOverlay'

// Infinite vertical scroll list — adapted from Codegrid's "Advanced Infinite
// Scroll" demo (wheel/drag physics + GSAP wrap-around positioning + a
// scale/rotate distortion driven by scroll speed), wired up to our real
// project data instead of the original placeholder items.
export function Full() {
  const navigate = useNavigate()
  const { slug } = useParams()
  const menuRef = useRef<HTMLDivElement>(null)
  const bgARef = useRef<HTMLImageElement>(null)
  const bgBRef = useRef<HTMLImageElement>(null)
  const activeBgIndex = useRef(0)

  const activeProject: Project | null = useMemo(
    () => projects.find((p) => p.slug === slug) ?? null,
    [slug],
  )

  useEffect(() => {
    const menuElement = menuRef.current
    if (!menuElement) return
    const itemElements = Array.from(
      menuElement.querySelectorAll<HTMLLIElement>('.full-menu-item'),
    )
    if (!itemElements.length) return

    let menuItemHeight = itemElements[0].clientHeight
    let totalMenuHeight = itemElements.length * menuItemHeight

    let currentScrollPosition = 0
    let lastScrollY = 0
    let smoothScrollY = 0

    const interpolate = (start: number, end: number, factor: number) =>
      start * (1 - factor) + end * factor

    const adjustItemsPosition = (scroll: number) => {
      gsap.set(itemElements, {
        y: (index) => index * menuItemHeight + scroll,
        modifiers: {
          y: (y: string) => {
            const wrappedY = gsap.utils.wrap(
              -menuItemHeight,
              totalMenuHeight - menuItemHeight,
              parseInt(y, 10),
            )
            return `${wrappedY}px`
          },
        },
      })
    }
    adjustItemsPosition(0)

    const onWheelScroll = (event: WheelEvent) => {
      currentScrollPosition -= event.deltaY
    }

    let startY = 0
    let currentY = 0
    let isDragging = false

    const getClientY = (event: MouseEvent | TouchEvent) =>
      'touches' in event ? event.touches[0].clientY : (event as MouseEvent).clientY

    const onDragStart = (event: MouseEvent | TouchEvent) => {
      startY = getClientY(event)
      isDragging = true
      menuElement.classList.add('is-dragging')
    }
    const onDragMove = (event: MouseEvent | TouchEvent) => {
      if (!isDragging) return
      currentY = getClientY(event)
      currentScrollPosition += (currentY - startY) * 3
      startY = currentY
    }
    const onDragEnd = () => {
      isDragging = false
      menuElement.classList.remove('is-dragging')
    }

    let rafId = 0
    const animate = () => {
      rafId = requestAnimationFrame(animate)
      smoothScrollY = interpolate(smoothScrollY, currentScrollPosition, 0.1)
      adjustItemsPosition(smoothScrollY)

      const scrollSpeed = smoothScrollY - lastScrollY
      lastScrollY = smoothScrollY

      gsap.to(itemElements, {
        scale: 1 - Math.min(100, Math.abs(scrollSpeed)) * 0.0075,
        rotate: scrollSpeed * 0.2,
        duration: 0.3,
        overwrite: true,
      })
    }
    animate()

    menuElement.addEventListener('wheel', onWheelScroll, { passive: true })
    menuElement.addEventListener('touchstart', onDragStart)
    menuElement.addEventListener('touchmove', onDragMove)
    menuElement.addEventListener('touchend', onDragEnd)
    menuElement.addEventListener('mousedown', onDragStart)
    menuElement.addEventListener('mousemove', onDragMove)
    menuElement.addEventListener('mouseleave', onDragEnd)
    menuElement.addEventListener('mouseup', onDragEnd)

    const onResize = () => {
      menuItemHeight = itemElements[0].clientHeight
      totalMenuHeight = itemElements.length * menuItemHeight
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafId)
      menuElement.removeEventListener('wheel', onWheelScroll)
      menuElement.removeEventListener('touchstart', onDragStart)
      menuElement.removeEventListener('touchmove', onDragMove)
      menuElement.removeEventListener('touchend', onDragEnd)
      menuElement.removeEventListener('mousedown', onDragStart)
      menuElement.removeEventListener('mousemove', onDragMove)
      menuElement.removeEventListener('mouseleave', onDragEnd)
      menuElement.removeEventListener('mouseup', onDragEnd)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const handleHoverImage = (url: string) => {
    setBackgroundImage(bgARef.current, bgBRef.current, activeBgIndex, url)
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#000',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transition: 'opacity 0.5s ease',
          opacity: activeProject ? 0.15 : 1,
          pointerEvents: activeProject ? 'none' : 'auto',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
          <img ref={bgARef} alt="" style={bgImageStyle} />
          <img ref={bgBRef} alt="" style={bgImageStyle} />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,0.75) 50%, rgba(0,0,0,1) 100%)',
              pointerEvents: 'none',
            }}
          />
        </div>

        <div
          ref={menuRef}
          className="full-menu"
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            cursor: 'grab',
            userSelect: 'none',
            zIndex: 1,
          }}
        >
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {projects.map((project) => (
            <li
              key={project.id}
              className="full-menu-item"
              onMouseEnter={() => handleHoverImage(project.bgImage)}
              onClick={() => navigate(`/full/projects/${project.slug}`)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                padding: '4em 40px',
                display: 'flex',
                gap: '2em',
                cursor: 'pointer',
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                color: '#fff',
              }}
            >
              <div
                style={{
                  flex: 2,
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'flex-end',
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 16,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.55)',
                  }}
                >
                  {project.category}
                </p>
              </div>
              <div style={{ flex: 6, display: 'flex', alignItems: 'flex-end' }}>
                <p
                  style={{
                    margin: 0,
                    fontFamily: 'Georgia, serif',
                    fontSize: 'clamp(32px, 6.5vw, 100px)',
                    lineHeight: 0.9,
                  }}
                >
                  {project.title}
                </p>
              </div>
            </li>
          ))}
        </ul>
        </div>
      </div>

      <ProjectOverlay project={activeProject} onClose={() => navigate('/full')} />

      <style>{`
        .full-menu.is-dragging {
          cursor: grabbing !important;
        }
      `}</style>
    </div>
  )
}

const bgImageStyle: CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: '130%',
  height: '130%',
  transform: 'translate(-50%, -50%)',
  objectFit: 'cover',
  filter: 'blur(80px)',
  opacity: 0,
}

function setBackgroundImage(
  imgA: HTMLImageElement | null,
  imgB: HTMLImageElement | null,
  activeIndexRef: { current: number },
  url?: string,
) {
  if (!url || !imgA || !imgB) return
  const images = [imgA, imgB]
  const current = images[activeIndexRef.current]
  const next = images[1 - activeIndexRef.current]

  if (next.src === url) return

  next.onload = () => {
    gsap.to(next, { opacity: 1, duration: 1, ease: 'power2.out' })
    gsap.to(current, { opacity: 0, duration: 1, ease: 'power2.out' })
    activeIndexRef.current = 1 - activeIndexRef.current
  }
  next.src = url
}
