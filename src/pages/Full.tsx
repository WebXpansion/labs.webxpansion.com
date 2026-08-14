import { useNavigate } from 'react-router-dom'
import { projects } from '../data/projects'

export function Full() {
  const navigate = useNavigate()

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#000',
        color: '#fff',
        padding: '120px 40px 80px',
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 32,
        }}
      >
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => navigate(`/projects/${project.slug}`)}
            style={{ cursor: 'pointer' }}
          >
            <div
              style={{
                aspectRatio: '16 / 10',
                borderRadius: 10,
                overflow: 'hidden',
                background: '#111',
                marginBottom: 14,
              }}
            >
              <img
                src={project.bgImage}
                alt={project.title}
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span>{project.title}</span>
              <span style={{ opacity: 0.5 }}>{project.year}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
