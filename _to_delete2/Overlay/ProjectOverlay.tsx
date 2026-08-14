import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import type { Project } from '../../data/projects'
import { getDetailTexture } from '../../lib/placeholderTexture'

interface ProjectOverlayProps {
  project: Project | null
}

export function ProjectOverlay({ project }: ProjectOverlayProps) {
  const navigate = useNavigate()

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          key={project.id}
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
            style={{
              position: 'absolute',
              top: 24,
              right: 24,
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: '#111',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontSize: 18,
              zIndex: 2,
            }}
          >
            ×
          </button>

          <div
            style={{
              padding: '64px 48px',
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <h1
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
            <p style={{ fontSize: 15, lineHeight: 1.6, color: '#333', maxWidth: 320 }}>
              {project.description}
            </p>

            <div style={{ display: 'flex', gap: 10, marginTop: 32, flexWrap: 'wrap' }}>
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#111',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                }}
              >
                ↗
              </span>
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 20,
                    background: '#f1f1f1',
                    fontSize: 12,
                    letterSpacing: '0.05em',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div
            style={{
              overflowY: 'auto',
              background: '#f4f4f2',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
            }}
          >
            {project.images.map((img, i) => (
              <motion.img
                key={i}
                src={getDetailTexture(img.color, img.label)}
                alt={img.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08, duration: 0.5 }}
                style={{ width: '100%', borderRadius: 10, display: 'block' }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
