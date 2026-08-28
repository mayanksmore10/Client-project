import { Heart, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'

export default function TourCard({ pkg, style: extra = {} }) {
  const navigate = useNavigate()
  const { isWishlisted, toggleWishlist } = useWishlist()

  // Support both API shape (package_id) and mock shape (id)
  const pkgId = pkg.package_id || pkg.id
  const wishlisted = isWishlisted(pkgId)

  return (
    <div
      onClick={() => navigate(`/package/${pkgId}`)}
      style={{
        background: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
        cursor: 'pointer',
        ...extra,
      }}
    >
      <div style={{ position: 'relative' }}>
        <img
          src={pkg.image}
          alt={pkg.title}
          style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }}
          loading="lazy"
        />
        {pkg.tag && (
          <span style={{
            position: 'absolute', top: 12, left: 12,
            background: '#c0392b', color: '#fff',
            fontSize: 11, fontWeight: 600,
            padding: '4px 10px', borderRadius: 999,
          }}>
            {pkg.tag}
          </span>
        )}
        <button
          onClick={e => {
            e.stopPropagation()
            toggleWishlist(pkg)
          }}
          title={wishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
          style={{
            position: 'absolute', top: 10, right: 10,
            width: 34, height: 34, borderRadius: '50%',
            background: 'rgba(255,255,255,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            transition: 'transform 0.15s ease',
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Heart size={16} fill={wishlisted ? '#e74c3c' : 'none'} color={wishlisted ? '#e74c3c' : '#555'} />
        </button>
      </div>

      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
          <Star size={13} fill="#f5a623" color="#f5a623" />
          <span style={{ fontSize: 13, fontWeight: 600 }}>{pkg.rating || '—'}</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>&nbsp;•&nbsp;{pkg.duration}</span>
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: 'var(--text-primary)' }}>{pkg.title}</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          From ₹{(pkg.pricePerPerson || pkg.price_per_person || 0).toLocaleString()} / person
        </div>
      </div>
    </div>
  )
}
