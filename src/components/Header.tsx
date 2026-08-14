import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ContactOverlay } from './Overlay/ContactOverlay'

export function Header() {
  const location = useLocation()
  const isFull = location.pathname.startsWith('/full')
  const [contactOpen, setContactOpen] = useState(false)

  return (
    <>
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
      <Link
        to="/"
        style={{
          color: '#fff',
          textDecoration: 'none',
          pointerEvents: 'auto',
          textTransform: 'uppercase',
          fontSize: 11,
        }}
      >
        WebXpansion Labs
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div className="header-nav-links" style={{ display: 'flex', gap: 10, pointerEvents: 'auto' }}>
          <Link
            to="/"
            style={{ color: isFull ? 'rgba(255,255,255,0.4)' : '#fff', textDecoration: 'none' }}
          >
            À LA UNE
          </Link>
          <span style={{ opacity: 0.4 }}>/</span>
          <Link
            to="/full"
            style={{ color: isFull ? '#fff' : 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
          >
            LISTE
          </Link>
        </div>
        <button
          onClick={() => setContactOpen(true)}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: 11,
            letterSpacing: '0.08em',
            cursor: 'pointer',
            pointerEvents: 'auto',
            fontFamily: 'inherit',
          }}
        >
          CONTACT
        </button>
      </div>

      <style>{`
        .header-nav-links {
          position: fixed !important;
          top: 28px !important;
          bottom: auto !important;
          left: 50% !important;
          right: auto !important;
          transform: translateX(-50%) !important;
        }
        @media (max-width: 820px) {
          .header-nav-links {
            top: auto !important;
            bottom: 28px !important;
          }
        }
      `}</style>
    </header>

    <ContactOverlay open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  )
}
