import { Link } from 'react-router-dom'
import { Globe } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{
      background: '#111', color: '#aaa',
      padding: '48px 0 28px',
      marginTop: 'auto',
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 36, marginBottom: 40 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <img
                src="/images/logo.jpg"
                alt="Sahyadri Tours & Travels Logo"
                style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
              />
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Sahyadri Travels</span>
            </div>


            <p style={{ fontSize: 13, lineHeight: 1.65, color: '#888' }}>
              Crafting unforgettable journeys across India's most breathtaking landscapes.
            </p>
          </div>

          {/* Explore */}
          <div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 13, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Explore</div>
            {['Kerala Tours', 'Munnar Packages', 'Andaman Trips', 'Himalayan Treks', 'Weekend Getaways'].map(l => (
              <Link key={l} to="/explore" style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 8, transition: 'color .15s' }}
                onMouseOver={e => e.target.style.color = '#fff'}
                onMouseOut={e => e.target.style.color = '#888'}
              >{l}</Link>
            ))}
          </div>

          {/* Company */}
          <div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 13, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Company</div>
            {['About Us', 'How it Works', 'Careers', 'Blog', 'Press'].map(l => (
              <Link key={l} to="/home" style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 8 }}>{l}</Link>
            ))}
          </div>

          {/* Support */}
          <div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 13, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Support</div>
            {['Help Centre', 'Contact Us', 'Cancellation Policy', 'Privacy Policy', 'Terms of Service'].map(l => (
              <Link key={l} to="/help" style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 8 }}>{l}</Link>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid #222', paddingTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 12, color: '#555' }}>© 2026 Sahyadri Travels. All rights reserved.</span>
          <div style={{ display: 'flex', gap: 16 }}>
            {['Instagram', 'WhatsApp', 'YouTube'].map(s => (
              <a key={s} href="#" style={{ fontSize: 12, color: '#555', transition: 'color .15s' }}
                onMouseOver={e => e.target.style.color = '#fff'}
                onMouseOut={e => e.target.style.color = '#555'}
              >{s}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
