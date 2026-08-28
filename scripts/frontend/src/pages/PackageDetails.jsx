import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, Check, Heart } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getPackage, getPackageReviewsSummary, initiateBooking } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function parseDate(str) {
  // str is "YYYY-MM-DD"
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatDateDisplay(str) {
  const dt = parseDate(str)
  return `${dt.getDate()} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`
}

// ─── BookingWidget ─────────────────────────────────────────────────────────────
function BookingWidget({ pkg, user, navigate }) {
  const [step, setStep]             = useState(1)   // 1 = dates, 2 = guests+rooms
  const [selectedDate, setDate]     = useState(null) // "YYYY-MM-DD"
  const [adults, setAdults]         = useState(2)
  const [children, setChildren]     = useState(0)
  const [selectedRoom, setRoom]     = useState(null) // room_option object
  const [booking, setBooking]       = useState(false)
  const [bookError, setBookError]   = useState(null)

  // Pick cheapest room by default when entering step 2
  const enterStep2 = () => {
    if (!selectedDate) return
    const cheapest = pkg.room_options.length
      ? [...pkg.room_options].sort((a, b) => a.price_per_night - b.price_per_night)[0]
      : null
    setRoom(cheapest)
    setStep(2)
  }

  // Price calculation
  const pricePerPerson   = pkg.pricePerPerson || 0
  const pricePerChild    = pkg.price_per_child || Math.round(pricePerPerson * 0.7)
  const roomCharge       = selectedRoom ? selectedRoom.price_per_night * pkg.nights : 0
  const subtotal         = pricePerPerson * adults + pricePerChild * children + roomCharge
  const gst              = pkg.gst_included ? 0 : Math.round(subtotal * 0.05)
  const total            = subtotal + gst

  // Find lowest-price date for badge
  const lowestDate = pkg.available_dates.length > 0
    ? pkg.available_dates.reduce((min, d) => d < min ? d : min)
    : null

  const handleBook = async () => {
    if (!selectedDate) {
      setBookError('Please select a travel date')
      return
    }
    
    // If package has room options, one must be selected
    if (pkg.room_options.length > 0 && !selectedRoom) {
      setBookError('Please select a room type')
      return
    }
    
    setBookError(null)

    const bookingPayload = {
      package_id:   pkg.package_id,
      travel_date:  selectedDate,
      rooms:        selectedRoom ? [{ room_type: selectedRoom.room_type, count: 1 }] : [],
      adult_count:  adults,
      child_count:  children,
    }

    if (!user) {
      // Not logged in → send to login, carry booking data back
      navigate('/login', { state: { booking: bookingPayload } })
      return
    }

    setBooking(true)
    try {
      const b = await initiateBooking(bookingPayload)
      // Navigate to traveler details page to collect guest information
      navigate(`/reserve/${b.id}/travelers`, { 
        state: { booking: b, packageDetails: pkg } 
      })
    } catch (err) {
      setBookError(err.message || 'Failed to create booking. Please try again.')
      setBooking(false)
    }
  }

  // ── Shared summary panel ───────────────────────────────────────────────────
  const Summary = () => (
    <div style={{ marginTop: 18, background: '#f8fdf9', border: '1px solid var(--border-light)', borderRadius: 10, padding: '14px 16px' }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>Booking Summary</div>
      {[
        { k: 'Dept. city',  v: pkg.from_ || pkg.destination || '—' },
        { k: 'Travel date', v: selectedDate ? formatDateDisplay(selectedDate) : '—' },
        { k: 'Travellers',  v: step === 2 ? `${adults} Adult${adults !== 1 ? 's' : ''}${children > 0 ? `, ${children} Child` : ''}` : '—' },
        { k: 'Room',        v: selectedRoom ? selectedRoom.label || selectedRoom.room_type : '—' },
      ].map(r => (
        <div key={r.k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
          <span style={{ color: 'var(--text-muted)' }}>{r.k}</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)', textAlign: 'right', maxWidth: '60%' }}>{r.v}</span>
        </div>
      ))}
      <div style={{ borderTop: '1px dashed var(--border-light)', marginTop: 10, paddingTop: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 4 }}>
          <span style={{ color: 'var(--text-secondary)' }}>Basic price</span>
          <span style={{ fontWeight: 700 }}>₹{subtotal.toLocaleString()}</span>
        </div>
        {!pkg.gst_included && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
            <span style={{ color: 'var(--text-muted)' }}>GST (5%)</span>
            <span>₹{gst.toLocaleString()}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800, marginTop: 6 }}>
          <span>Total</span>
          <span style={{ color: 'var(--primary)' }}>₹{total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )

  // ── STEP 1: Date selection ─────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="page-card">
        {/* Price header */}
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)', marginBottom: 2 }}>
          from ₹{pricePerPerson.toLocaleString()}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>per person</div>

        {/* Departure city */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)', marginBottom: 8 }}>Departure city</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#f5f5f5', borderRadius: 8, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
            <span>📍</span>
            <span>{pkg.from_ || pkg.destination || 'Not specified'}</span>
          </div>
        </div>

        {/* Available dates */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)', marginBottom: 10 }}>
            Select travel date ({pkg.available_dates.length} available)
          </div>

          {pkg.available_dates.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '16px 0', textAlign: 'center' }}>
              No dates available yet. Check back soon.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[...pkg.available_dates].sort().map(dateStr => {
                const dt       = parseDate(dateStr)
                const isSelected = selectedDate === dateStr
                const isLowest   = dateStr === lowestDate

                return (
                  <div
                    key={dateStr}
                    onClick={() => setDate(dateStr)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                      border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border-light)'}`,
                      background: isSelected ? '#f0fbf5' : '#fff',
                      transition: 'all 0.15s',
                    }}
                  >
                    {/* Month/day block */}
                    <div style={{ textAlign: 'center', minWidth: 48, background: isSelected ? 'var(--primary)' : '#f0f0f0', borderRadius: 8, padding: '6px 10px', color: isSelected ? '#fff' : 'var(--text-primary)' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {MONTHS[dt.getMonth()]} {dt.getFullYear()}
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.1 }}>{dt.getDate()}</div>
                      <div style={{ fontSize: 10, color: isSelected ? 'rgba(255,255,255,0.8)' : '#888' }}>
                        {DAYS[dt.getDay()]}
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                        {formatDateDisplay(dateStr)}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {pkg.duration}
                      </div>
                      {isLowest && (
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', marginTop: 3 }}>
                          ✓ Lowest Price
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>
                        ₹{pricePerPerson.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>/ person</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Guests & Rooms button */}
        <button
          className="btn btn-primary btn-full"
          disabled={!selectedDate}
          onClick={enterStep2}
          style={{ opacity: selectedDate ? 1 : 0.5 }}
        >
          Guests & Rooms →
        </button>

        {!selectedDate && (
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
            Select a date to continue
          </div>
        )}
      </div>
    )
  }

  // ── STEP 2: Guests + Room + Book ──────────────────────────────────────────
  return (
    <div className="page-card">
      {/* Back */}
      <button
        onClick={() => setStep(1)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, padding: 0 }}
      >
        ← Departure city / Date
      </button>

      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>Add Guests & Choose Room</div>

      {/* Guest counters */}
      <div style={{ marginBottom: 20 }}>
        {[
          { label: 'Adults', sub: 'Above 12 yrs',  val: adults,   set: setAdults,   min: 1  },
          { label: 'Children', sub: 'Age 2–11 yrs', val: children, set: setChildren, min: 0 },
        ].map(({ label, sub, val, set, min }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button
                onClick={() => set(v => Math.max(min, v - 1))}
                style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid var(--border)', background: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
              >−</button>
              <span style={{ fontSize: 15, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{val}</span>
              <button
                onClick={() => set(v => v + 1)}
                style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid var(--border)', background: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
              >+</button>
            </div>
          </div>
        ))}
      </div>

      {/* Room type selector */}
      {pkg.room_options.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Room Type</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pkg.room_options.map(room => {
              const isSelected = selectedRoom?.room_type === room.room_type
              return (
                <label
                  key={room.room_type}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer',
                    padding: '12px 14px', borderRadius: 10,
                    border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border-light)'}`,
                    background: isSelected ? '#f0fbf5' : '#fff',
                    transition: 'all 0.15s',
                  }}
                >
                  <input
                    type="radio"
                    name="room"
                    checked={isSelected}
                    onChange={() => setRoom(room)}
                    style={{ marginTop: 2, accentColor: 'var(--primary)' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{room.label || room.room_type}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      Up to {room.max_occupancy} adult{room.max_occupancy !== 1 ? 's' : ''} · ₹{room.price_per_night.toLocaleString()}/night
                    </div>
                    {room.available_count <= 3 && (
                      <div style={{ fontSize: 11, color: '#e74c3c', fontWeight: 600, marginTop: 2 }}>
                        Only {room.available_count} left!
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: isSelected ? 'var(--primary)' : 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                    ₹{(room.price_per_night * pkg.nights).toLocaleString()}
                  </div>
                </label>
              )
            })}
          </div>
        </div>
      )}

      {/* Booking summary */}
      <Summary />

      {/* Error */}
      {bookError && (
        <div style={{ marginTop: 10, fontSize: 13, color: '#e74c3c', background: '#fff5f5', border: '1px solid #fcc', borderRadius: 8, padding: '8px 12px' }}>
          {bookError}
        </div>
      )}

      {/* Book Now */}
      <button
        className="btn btn-primary btn-full"
        style={{ marginTop: 16 }}
        disabled={booking || (pkg.room_options.length > 0 && !selectedRoom)}
        onClick={handleBook}
      >
        {booking ? 'Creating booking…' : user ? 'Book Now →' : 'Sign in & Book'}
      </button>

      <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
        {pkg.gst_included ? 'GST included in price' : '+ 5% GST applicable'} · No hidden charges
      </div>
    </div>
  )
}

// ─── StarRow helper ────────────────────────────────────────────────────────────
function StarRow({ rating, small }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={small ? 12 : 14}
          fill={i <= Math.round(rating) ? '#f5a623' : 'none'}
          color={i <= Math.round(rating) ? '#f5a623' : '#ddd'}
        />
      ))}
    </span>
  )
}

function SkeletonBlock({ height = 20, width = '100%', style = {} }) {
  return <div style={{ height, width, background: '#f0f0f0', borderRadius: 6, ...style }} />
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function PackageDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const [tab, setTab] = useState('overview')
  const [activeImg, setActiveImg] = useState(0)

  const [pkg, setPkg] = useState(null)
  const [reviewData, setReviewData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    setActiveImg(0)

    getPackage(id)
      .then(async p => {
        setPkg(p)
        try {
          const rev = await getPackageReviewsSummary(p.package_id)
          setReviewData(rev)
        } catch (_) {}
        setLoading(false)
      })
      .catch(err => {
        setError(err.message || 'Package not found')
        setLoading(false)
      })
  }, [id])

  if (loading) return (
    <div className="site-wrap">
      <Navbar />
      <main className="page-main" style={{ background: 'var(--bg-page)' }}>
        <div className="container" style={{ padding: '28px 24px' }}>
          <div className="page-card">
            <SkeletonBlock height={340} style={{ marginBottom: 16, borderRadius: 12 }} />
            <SkeletonBlock height={24} width="60%" style={{ marginBottom: 12 }} />
            <SkeletonBlock height={16} width="40%" style={{ marginBottom: 8 }} />
            <SkeletonBlock height={80} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )

  if (error || !pkg) return (
    <div className="site-wrap">
      <Navbar />
      <main className="page-main">
        <div className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <p style={{ marginBottom: 16, color: 'var(--text-muted)' }}>{error || 'Package not found.'}</p>
          <button className="btn btn-primary" onClick={() => navigate('/explore')}>Browse all tours</button>
        </div>
      </main>
      <Footer />
    </div>
  )

  const tabs = ['overview', 'itinerary', 'inclusions', 'reviews']
  const displayRating     = reviewData?.average_rating ?? pkg.rating
  const displayReviewCount = reviewData?.total_reviews ?? pkg.reviewCount
  const reviews           = reviewData?.reviews || pkg.reviews || []

  return (
    <div className="site-wrap">
      <Navbar />
      <main className="page-main" style={{ background: 'var(--bg-page)' }}>
        <div className="container" style={{ padding: '28px 24px' }}>

          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <ArrowLeft size={15} /> {pkg.title}
          </button>

          <div className="page-card" style={{ padding: 0, overflow: 'visible', background: 'transparent', border: 'none', boxShadow: 'none' }}>
            <div className="sidebar-layout-right">

              {/* ── Left: gallery + tabs ── */}
              <div>
                <div className="page-card" style={{ padding: 0, marginBottom: 2 }}>
                  {/* Main image */}
                  <div style={{ position: 'relative', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', overflow: 'hidden' }}>
                    <img
                      src={pkg.images[activeImg]}
                      alt={pkg.title}
                      style={{ width: '100%', height: 340, objectFit: 'cover', display: 'block' }}
                    />
                    <button
                      onClick={() => toggleWishlist(pkg)}
                      title={isWishlisted(pkg.package_id || pkg.id) ? "Remove from Wishlist" : "Save to Wishlist"}
                      style={{
                        position: 'absolute', top: 14, right: 16,
                        width: 38, height: 38, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.92)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: 'none', cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        zIndex: 10,
                        transition: 'transform 0.15s ease'
                      }}
                      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
                      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <Heart size={18} fill={isWishlisted(pkg.package_id || pkg.id) ? '#e74c3c' : 'none'} color={isWishlisted(pkg.package_id || pkg.id) ? '#e74c3c' : '#555'} />
                    </button>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 50%)', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', bottom: 14, left: 16 }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {pkg.images.map((_, i) => (
                          <div key={i} onClick={() => setActiveImg(i)} style={{ width: i === activeImg ? 18 : 7, height: 7, borderRadius: 4, background: i === activeImg ? '#fff' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'width .2s' }} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Thumbs */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, padding: '10px 16px 14px' }}>
                    {pkg.images.map((img, i) => (
                      <div key={i} onClick={() => setActiveImg(i)} style={{ cursor: 'pointer', borderRadius: 8, overflow: 'hidden', border: `2px solid ${activeImg === i ? 'var(--primary)' : 'transparent'}` }}>
                        <img src={img} alt="" style={{ width: '100%', height: 60, objectFit: 'cover', display: 'block' }} />
                      </div>
                    ))}
                    {Array.from({ length: Math.max(0, 4 - pkg.images.length) }).map((_, i) => (
                      <div key={`e${i}`} style={{ background: '#f0f0f0', borderRadius: 8, height: 60 }} />
                    ))}
                  </div>
                </div>

                {/* Tabs */}
                <div className="page-card" style={{ padding: 0 }}>
                  <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)' }}>
                    {tabs.map(t => (
                      <button
                        key={t}
                        onClick={() => setTab(t)}
                        style={{
                          flex: 1, padding: '13px 0', fontSize: 13, fontWeight: 600,
                          color: tab === t ? 'var(--primary)' : 'var(--text-muted)',
                          background: 'none', border: 'none', cursor: 'pointer',
                          borderBottom: `2px solid ${tab === t ? 'var(--primary)' : 'transparent'}`,
                          textTransform: 'lowercase',
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <div style={{ padding: '20px' }}>
                    {tab === 'overview' && (
                      <div>
                        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{pkg.duration}</span>
                          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>•</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Star size={13} fill="#f5a623" color="#f5a623" />
                            <span style={{ fontSize: 13, fontWeight: 600 }}>{displayRating || '—'}</span>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>({displayReviewCount} reviews)</span>
                          </span>
                        </div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{pkg.title}</h2>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 20 }}>{pkg.description}</p>
                        {pkg.highlights.length > 0 && (
                          <>
                            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Highlights</h3>
                            {pkg.highlights.map((h, i) => (
                              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                                <Check size={15} color="var(--primary)" style={{ marginTop: 2, flexShrink: 0 }} />
                                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{h}</span>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    )}

                    {tab === 'itinerary' && (
                      <div>
                        {pkg.itinerary.length === 0 && <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Itinerary details coming soon.</p>}
                        {pkg.itinerary.map((day, i) => (
                          <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <span style={{ fontSize: 8, fontWeight: 600 }}>DAY</span>
                              <span style={{ fontSize: 14, fontWeight: 700 }}>{day.day}</span>
                            </div>
                            <div style={{ flex: 1, background: '#f9f9f9', borderRadius: 10, padding: '12px 14px' }}>
                              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{day.title}</div>
                              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>{day.description}</p>
                              {(day.activities || []).map((a, j) => (
                                <div key={j} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 4 }}>
                                  <Check size={12} color="var(--primary)" style={{ marginTop: 3, flexShrink: 0 }} />
                                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{a}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {tab === 'inclusions' && (
                      <div>
                        <h3 style={{ fontWeight: 700, marginBottom: 12 }}>What's included</h3>
                        {(pkg.highlights.length > 0 ? pkg.highlights : ['Accommodation in premium hotels', 'All transfers by AC vehicle', 'Daily breakfast and dinner', 'Expert local guide', 'Entry fees as per itinerary']).map((inc, i) => (
                          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                            <Check size={15} color="var(--primary)" style={{ marginTop: 2, flexShrink: 0 }} />
                            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{inc}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {tab === 'reviews' && (
                      <div>
                        <div style={{ background: '#f9f9f9', borderRadius: 10, padding: 16, marginBottom: 20, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 36, fontWeight: 800 }}>{displayRating || '—'}</div>
                            {displayRating ? <StarRow rating={displayRating} /> : null}
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Based on {displayReviewCount} reviews</div>
                          </div>
                        </div>
                        {reviews.map((r, i) => (
                          <div key={r.id || i} style={{ marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid #f0f0f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                              <span style={{ fontWeight: 700, fontSize: 14 }}>{r.user_name || r.name}</span>
                              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                {r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : r.date}
                              </span>
                            </div>
                            <StarRow rating={r.rating} small />
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.65 }}>{r.comment || r.text}</p>
                          </div>
                        ))}
                        {reviews.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No reviews yet.</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Right: BookingWidget ── */}
              <div style={{ position: 'sticky', top: 'calc(var(--nav-height, 60px) + 20px)' }}>
                <BookingWidget pkg={pkg} user={user} navigate={navigate} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
