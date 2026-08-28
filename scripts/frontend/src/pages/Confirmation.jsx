import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { CheckCircle, Calendar } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Confirmation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state || {}

  const booking = state.booking || {}
  const token = state.token || 10000

  const count = booking.adult_count || state.count || 2
  const dest  = booking.destination?.slice(0, 3).toUpperCase() || 'SAH'
  const ref   = id || `SAH-${Math.floor(Math.random() * 9000 + 1000)}-${dest}`

  return (
    <div className="site-wrap">
      <Navbar />
      <main className="page-main" style={{ background: 'var(--bg-page)' }}>
        <div className="container" style={{ padding: '60px 24px' }}>
          <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>

            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#e8f5ee', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <CheckCircle size={38} color="var(--primary)" strokeWidth={2} />
            </div>

            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 10 }}>Spot Reserved!</h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
              We've received your token payment. A travel expert will call you shortly to finalise the remaining details.
            </p>

            <div className="page-card" style={{ textAlign: 'left', marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 15, fontWeight: 700 }}>{booking.packageTitle || 'Package'}</span>
                <span style={{ fontSize: 12, fontWeight: 600, background: '#e8f5ee', color: 'var(--primary)', padding: '3px 10px', borderRadius: 999 }}>Confirmed</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                <Calendar size={13} /> {booking.dates || booking.travel_date}
              </div>
              <hr className="divider" />
              {[
                { label: 'Booking ID', value: ref },
                { label: 'Travelers', value: `${count} Adults` },
                { label: 'Token Paid', value: `₹${token.toLocaleString()}`, green: true },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 10 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                  <span style={{ fontWeight: 600, color: row.green ? 'var(--primary)' : 'var(--text-primary)' }}>{row.value}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/bookings')}>View booking</button>
              <button className="btn btn-outline btn-lg" onClick={() => navigate('/home')}>Back to Home</button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
