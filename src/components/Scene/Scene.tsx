import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { gsap } from 'gsap'
import { createHorizontalSlider } from './horizontalSlider'
import { projects } from '../../data/projects'
import type { Project } from '../../data/projects'

interface SceneProps {
  onSelect: (project: Project) => void
  dimmed: boolean
}

// TEMP: vidéo de test locale utilisée pour toutes les cartes tant que le
// CORS n'est pas réglé sur webxpansion.com (voir commentaire plus bas).
// Réencodée en 720p/H.264/MP4 avec fast-start pour tester le poids/la
// vitesse de chargement réels sur le site déployé.
const TEMP_TEST_VIDEO = '/test-video.mp4'

export function Scene({ onSelect, dimmed }: SceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const titleWrapRef = useRef<HTMLDivElement>(null)
  const categoryWrapRef = useRef<HTMLDivElement>(null)
  const bgARef = useRef<HTMLImageElement>(null)
  const bgBRef = useRef<HTMLImageElement>(null)
  const activeBgIndex = useRef(0)
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  useEffect(() => {
    if (!canvasRef.current) return

    const slider = createHorizontalSlider({
      canvas: canvasRef.current,
      projects: projects.map((p) => ({
        title: p.title,
        category: p.category,
        year: p.year,
        // TEMP: les vidéos de prod (webxpansion.com) sont bloquées par CORS
        // en local, donc on utilise une seule vidéo locale pour toutes les
        // cartes le temps de vérifier que l'affichage fonctionne bien.
        // À retirer (remettre `video: p.video`) une fois le CORS réglé côté serveur.
        video: TEMP_TEST_VIDEO,
        image: p.bgImage,
      })),
      onSelect: (index) => onSelectRef.current(projects[index]),
      onActiveChange: (_index, sliderProject) => {
        rollText(titleWrapRef.current, sliderProject.title.toUpperCase())
        rollText(categoryWrapRef.current, sliderProject.category)
        setBackgroundImage(bgARef.current, bgBRef.current, activeBgIndex, sliderProject.image)
      },
    })

    return () => slider.destroy()
  }, [])

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
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0 }}>
        <img ref={bgARef} alt="" style={bgImageStyle} />
        <img ref={bgBRef} alt="" style={bgImageStyle} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle, rgba(0,0,0,0) 55%, rgba(0,0,0,0.75) 100%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          cursor: 'grab',
          touchAction: 'none',
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '30vh',
          background: 'linear-gradient(rgb(0 0 0) 30%, rgb(0 0 0 / 0%) 100%)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '30vh',
          background: 'linear-gradient(to top, rgb(0, 0, 0) 30%, rgba(0, 0, 0, 0) 100%)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      <div
        className="scene-footer"
        style={{
          position: 'fixed',
          bottom: 28,
          left: 40,
          right: 40,
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          pointerEvents: 'none',
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
          color: '#fff',
        }}
      >
        <div
          ref={titleWrapRef}
          className="scene-title"
          style={{
            position: 'relative',
            overflow: 'hidden',
            height: 64,
            width: 'min(70vw, 820px)',
            fontSize: 44,
            fontWeight: 600,
            letterSpacing: '0.02em',
            flexShrink: 0,
          }}
        />
        <div
          ref={categoryWrapRef}
          className="scene-category"
          style={{
            position: 'relative',
            overflow: 'hidden',
            height: '1.3em',
            width: 220,
            textAlign: 'right',
            fontSize: 13,
            opacity: 0.55,
            flexShrink: 0,
          }}
        />
      </div>

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

function rollText(wrap: HTMLDivElement | null, text: string) {
  if (!wrap) return
  const existing = wrap.querySelectorAll('p')
  gsap.killTweensOf(existing)
  existing.forEach((el, i) => {
    if (i < existing.length - 1) el.remove()
  })

  const current = wrap.querySelector('p')
  const next = document.createElement('p')
  next.textContent = text
  next.style.position = 'absolute'
  next.style.top = '0'
  next.style.left = '0'
  next.style.width = '100%'
  next.style.margin = '0'
  next.style.whiteSpace = 'nowrap'
  wrap.appendChild(next)

  gsap.fromTo(next, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.55, ease: 'power3.out' })
  if (current) {
    gsap.to(current, {
      yPercent: -100,
      opacity: 0,
      duration: 0.55,
      ease: 'power3.out',
      onComplete: () => current.remove(),
    })
  }
}
