import { Link, useNavigate } from 'react-router-dom'
import { Heart, ArrowLeft, Trash2 } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import TourCard from '../components/TourCard'
import { useWishlist } from '../context/WishlistContext'

export default function Wishlist() {
  const navigate = useNavigate()
  const { wishlist, clearWishlist } = useWishlist()

  return (
    <div className="site-wrap">
      <Navbar />
      <main className="page-main" style={{ background: 'var(--bg-page)' }}>
        <div className="container" style={{ padding: '32px 24px' }}>

          {/* Header section */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <button
                onClick={() => navigate(-1)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 14, color: 'var(--text-secondary)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  marginBottom: 8
                }}
              >
                <ArrowLeft size={15} /> back
              </button>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Heart size={26} fill="#e74c3c" color="#e74c3c" /> My Wishlist
                {wishlist.length > 0 && (
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', background: '#fee2e2', padding: '2px 10px', borderRadius: 999 }}>
                    {wishlist.length} item{wishlist.length !== 1 ? 's' : ''}
                  </span>
                )}
              </h1>
            </div>

            {wishlist.length > 0 && (
              <button
                onClick={clearWishlist}
                className="btn btn-sm"
                style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', gap: 6 }}
              >
                <Trash2 size={14} /> Clear All
              </button>
            )}
          </div>

          {/* Content */}
          {wishlist.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: '#fff',
              borderRadius: 16,
              border: '1px solid var(--border-light)',
              maxWidth: 480,
              margin: '20px auto',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: '#fef2f2', color: '#dc2626',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Heart size={32} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#0f172a' }}>
                Your wishlist is empty
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.5 }}>
                Explore our amazing tour packages and tap the heart icon on any package to save your favorites here.
              </p>
              <Link to="/explore" className="btn btn-primary">
                Explore Tour Packages
              </Link>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
              gap: 20
            }}>
              {wishlist.map(pkg => (
                <TourCard key={pkg.package_id || pkg.id} pkg={pkg} />
              ))}
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  )
}
