import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { gsap } from 'gsap'
import { projects } from '../data/projects'
import type { Project } from '../data/projects'
import { ProjectOverlay } from '../components/Overlay/ProjectOverlay'
import { isMobileDevice } from '../utils/device'

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
  const hoverPreviewRef = useRef<HTMLDivElement>(null)
  const hoverPreviewImgRef = useRef<HTMLImageElement>(null)
  const [isMobile] = useState(isMobileDevice)

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

    // Scrolling/dragging moves the rows out from under a stationary cursor
    // via a transform, which never fires a real mouseleave — so without this
    // the last-hovered item's preview would stay stuck on screen. Force it
    // to hide as soon as the list actually moves; it only comes back once
    // the cursor genuinely re-enters a row (onMouseEnter below).
    const hidePreviewImmediately = () => {
      if (hoverPreviewRef.current) {
        gsap.to(hoverPreviewRef.current, { opacity: 0, duration: 0.15, overwrite: true })
      }
    }

    const onWheelScroll = (event: WheelEvent) => {
      currentScrollPosition -= event.deltaY
      hidePreviewImmediately()
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
      hidePreviewImmediately()
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

  // Cursor-following preview image — desktop only, hidden on mobile since
  // there's no hover/mouse there (the mobile feed keeps its current,
  // separate card layout untouched).
  useEffect(() => {
    if (isMobile) return
    const preview = hoverPreviewRef.current
    if (!preview) return

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const smooth = { x: mouse.x, y: mouse.y }

    const onMouseMove = (event: MouseEvent) => {
      mouse.x = event.clientX
      mouse.y = event.clientY
    }
    window.addEventListener('mousemove', onMouseMove)

    let rafId = 0
    const loop = () => {
      rafId = requestAnimationFrame(loop)
      smooth.x += (mouse.x - smooth.x) * 0.15
      smooth.y += (mouse.y - smooth.y) * 0.15
      preview.style.transform = `translate(${smooth.x}px, ${smooth.y}px) translate(-50%, -50%)`
    }
    loop()

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(rafId)
    }
  }, [isMobile])

  // Hide the preview immediately if the overlay opens while the cursor is
  // still hovering an item (e.g. right after a click).
  useEffect(() => {
    if (activeProject && hoverPreviewRef.current) {
      gsap.to(hoverPreviewRef.current, { opacity: 0, duration: 0.2, overwrite: true })
    }
  }, [activeProject])

  const showHoverPreview = (imageUrl: string) => {
    if (isMobile || !hoverPreviewRef.current) return
    if (hoverPreviewImgRef.current) hoverPreviewImgRef.current.src = imageUrl
    gsap.to(hoverPreviewRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.45,
      ease: 'power3.out',
      overwrite: true,
    })
  }

  const hideHoverPreview = () => {
    if (isMobile || !hoverPreviewRef.current) return
    gsap.to(hoverPreviewRef.current, {
      opacity: 0,
      scale: 0.85,
      duration: 0.3,
      ease: 'power3.out',
      overwrite: true,
    })
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
              onMouseEnter={() => {
                handleHoverImage(project.bgImage)
                showHoverPreview(project.bgImage)
              }}
              onMouseLeave={hideHoverPreview}
              onClick={() => navigate(`/full/projects/${project.slug}`)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                padding: isMobile ? '1.3em 20px' : '4em 40px',
                display: 'flex',
                gap: isMobile ? '0.8em' : '2em',
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
                    fontSize: isMobile ? 10 : 16,
                    letterSpacing: isMobile ? '0.04em' : '0.08em',
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
                    fontSize: isMobile ? 'clamp(20px, 7.5vw, 34px)' : 'clamp(32px, 6.5vw, 100px)',
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

      {!isMobile && (
        <div
          ref={hoverPreviewRef}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: 260,
            height: 170,
            borderRadius: 10,
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 5,
            opacity: 0,
            transform: 'translate(-50%, -50%) scale(0.85)',
            willChange: 'transform, opacity',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          <img
            ref={hoverPreviewImgRef}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      )}

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
