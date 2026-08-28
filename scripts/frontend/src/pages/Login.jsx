import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { initiateBooking } from '../services/api'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, register } = useAuth()

  // After login, go back to where the user came from (e.g. /reserve/:id/travelers)
  const returnTo = location.state?.returnTo || '/home'

  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async () => {
    if (!email || !password) { setError('Please enter email and password.'); return }
    if (mode === 'register' && !fullName) { setError('Please enter your full name.'); return }
    setLoading(true)
    setError(null)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(email, password, fullName)
      }

      // If user came here from the booking flow, initiate the booking
      const pendingBooking = location.state?.booking
      if (pendingBooking) {
        try {
          const b = await initiateBooking(pendingBooking)
          navigate(`/bookings/${b.id}`)
          return
        } catch (bookErr) {
          // Booking failed but login succeeded — go home
          console.error('Booking failed after login:', bookErr)
        }
      }

      navigate(returnTo)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="site-wrap">
      <Navbar />
      <main className="page-main" style={{ background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 60px)', padding: '40px 16px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div className="page-card">
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <img src="/images/logo.jpg" alt="Sahyadri Logo" style={{ width: 54, height: 54, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-light)' }} />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, textAlign: 'center', marginBottom: 6 }}>Sahyadri Travels</h1>


            <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', marginBottom: location.state?.booking ? 12 : 28 }}>
              {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
            </p>

            {/* Booking context banner */}
            {location.state?.booking && (
              <div style={{ background: '#f0fbf5', border: '1px solid var(--primary)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--primary)', fontWeight: 600, marginBottom: 20, textAlign: 'center' }}>
                Sign in to complete your booking
              </div>
            )}

            {error && (
              <div style={{ background: '#fff5f5', border: '1px solid #fcc', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#c0392b', marginBottom: 16 }}>
                {error}
              </div>
            )}

            {mode === 'register' && (
              <div className="input-wrap" style={{ marginBottom: 12 }}>
                <label className="input-label">Full Name</label>
                <input className="input" type="text" placeholder="Your full name" value={fullName} onChange={e => setFullName(e.target.value)} />
              </div>
            )}

            <div className="input-wrap" style={{ marginBottom: 12 }}>
              <label className="input-label">Email Address</label>
              <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>

            <div className="input-wrap" style={{ marginBottom: 8 }}>
              <label className="input-label">Password</label>
              <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
              {mode === 'login' ? 'Enter your credentials to sign in.' : 'Password must be at least 8 characters.'}
            </p>

            <button
              className="btn btn-primary btn-full btn-lg"
              style={{ marginBottom: 14 }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            <button
              onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(null) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'center' }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)' }}>
                {mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Sign in'}
              </span>
            </button>

            <button onClick={() => navigate('/home')} style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'center', marginTop: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Continue browsing as guest</span>
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 16, lineHeight: 1.6 }}>
            By continuing, you agree to our{' '}
            <a href="#" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Terms of Service</a>
            {' '}and{' '}
            <a href="#" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Privacy Policy</a>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
