import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, Globe, Search, User, LogOut } from 'lucide-react'

import { useAuth } from '../context/AuthContext'

const NAV_LINKS = [
  { label: 'Tours',       path: '/explore' },
  { label: 'AI Planner',  path: '/assistant' },
  { label: 'About',       path: '/about' },
  { label: 'Contact',     path: '/contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }


  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      height: 'var(--nav-height)',
      background: '#fff',
      borderBottom: '1px solid var(--border)',
      boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
    }}>
      <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo */}
        <Link to="/home" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img
            src="/images/logo.jpg"
            alt="Sahyadri Tours & Travels Logo"
            style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-light)' }}
          />
          <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            Sahyadri Travels
          </span>
        </Link>


        {/* Desktop nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="desktop-nav">
          {NAV_LINKS.map(({ label, path }) => (
            <Link
              key={path}
              to={path}
              style={{
                fontSize: 14, fontWeight: 500,
                color: pathname.startsWith(path) ? 'var(--primary)' : 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'color .15s',
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => navigate('/profile')}
                className="btn btn-outline btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <User size={15} /> profile
              </button>
              <button
                onClick={handleLogout}
                className="btn btn-sm"
                style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', display: 'inline-flex', alignItems: 'center', gap: 5 }}
              >
                <LogOut size={14} /> logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="btn btn-outline btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <User size={15} /> login / sign up
            </button>
          )}



          {/* Hamburger */}
          <button
            onClick={() => setOpen(o => !o)}
            className="mobile-menu-btn"
            style={{ padding: 6, display: 'none' }}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{
          background: '#fff', borderTop: '1px solid var(--border)',
          padding: '16px 24px',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {NAV_LINKS.map(({ label, path }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setOpen(false)}
              style={{
                padding: '10px 0', fontSize: 15, fontWeight: 500,
                color: pathname.startsWith(path) ? 'var(--primary)' : 'var(--text-primary)',
                borderBottom: '1px solid var(--border-light)',
              }}
            >
              {label}
            </Link>
          ))}
          <div style={{ display: 'flex', gap: 10, paddingTop: 12 }}>
            {user ? (
              <button onClick={() => { navigate('/bookings'); setOpen(false) }} className="btn btn-primary btn-sm" style={{ flex: 1 }}>Profile</button>
            ) : (
              <button onClick={() => { navigate('/login'); setOpen(false) }} className="btn btn-primary btn-sm" style={{ flex: 1 }}>Login</button>
            )}
          </div>
        </div>
      )}


      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        .mobile-menu-btn { display: none; }
      `}</style>
    </header>
  )
}
