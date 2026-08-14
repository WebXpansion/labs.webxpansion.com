import { useCallback, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Scene } from '../components/Scene/Scene'
import { MobileFeed } from '../components/Scene/MobileFeed'
import { ProjectOverlay } from '../components/Overlay/ProjectOverlay'
import { projects } from '../data/projects'
import type { Project } from '../data/projects'
import { isMobileDevice } from '../utils/device'

export function Home() {
  const navigate = useNavigate()
  const { slug } = useParams()
  const [hint, setHint] = useState(true)
  const [isMobile] = useState(isMobileDevice)

  const activeProject: Project | null = useMemo(
    () => projects.find((p) => p.slug === slug) ?? null,
    [slug],
  )

  // Clicking a card opens the in-page overlay (not an external navigation).
  const handleSelect = useCallback(
    (project: Project) => {
      navigate(`/projects/${project.slug}`)
    },
    [navigate],
  )

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {isMobile ? (
        <MobileFeed onSelect={handleSelect} dimmed={!!activeProject} />
      ) : (
        <Scene onSelect={handleSelect} dimmed={!!activeProject} />
      )}

      {!isMobile && hint && !activeProject && (
        <div
          onAnimationEnd={() => setHint(false)}
          style={{
            position: 'fixed',
            top: 90,
            right: 40,
            zIndex: 20,
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            fontSize: 12,
            letterSpacing: '0.08em',
            color: 'rgba(255,255,255,0.6)',
            pointerEvents: 'none',
            animation: 'fadeOutHint 1s ease 4s forwards',
          }}
        >
          DRAG TO EXPLORE
        </div>
      )}

      <ProjectOverlay project={activeProject} />

      <style>{`
        @keyframes fadeOutHint {
          to { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
