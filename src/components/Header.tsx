import { Link, useLocation } from 'react-router-dom'

export function Header() {
  const location = useLocation()
  const isFull = location.pathname.startsWith('/full')

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '28px 40px',
        zIndex: 20,
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        fontSize: 13,
        letterSpacing: '0.08em',
        color: '#fff',
        mixBlendMode: 'difference',
        pointerEvents: 'none',
      }}
    >
      <Link to="/" style={{ color: '#fff', textDecoration: 'none', pointerEvents: 'auto' }}>
        LANDBERG, JESPER
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ display: 'flex', gap: 10, pointerEvents: 'auto' }}>
          <Link
            to="/"
            style={{ color: isFull ? 'rgba(255,255,255,0.4)' : '#fff', textDecoration: 'none' }}
          >
            FEATURED
          </Link>
          <span style={{ opacity: 0.4 }}>/</span>
          <Link
            to="/full"
            style={{ color: isFull ? '#fff' : 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
          >
            FULL
          </Link>
        </div>
        <button
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: 13,
            letterSpacing: '0.08em',
            cursor: 'pointer',
            pointerEvents: 'auto',
            fontFamily: 'inherit',
          }}
        >
          PROFILE
        </button>
      </div>
    </header>
  )
}
