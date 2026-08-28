import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Users, Check, Eye, X, CreditCard, ShieldCheck, MapPin, Star } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getBooking, submitTripReview } from '../services/api'

export default function BookingDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Details Modal State
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewMsg, setReviewMsg] = useState(null)
  const [isReviewed, setIsReviewed] = useState(false)

  useEffect(() => {
    setLoading(true)
    getBooking(id)
      .then(b => { setBooking(b); setLoading(false) })
      .catch(err => { setError(err.message || 'Booking not found'); setLoading(false) })
  }, [id])

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    setReviewSubmitting(true)
    setReviewMsg(null)
    try {
      await submitTripReview(booking.id, rating, comment)
      setIsReviewed(true)
      setReviewMsg({ type: 'success', text: 'Thank you! Your review has been submitted.' })
      setTimeout(() => {
        setShowReviewModal(false)
        setReviewMsg(null)
      }, 1800)
    } catch (err) {
      setReviewMsg({ type: 'error', text: err.message || 'Failed to submit review' })
    } finally {
      setReviewSubmitting(false)
    }
  }

  if (loading) return (
    <div className="site-wrap">
      <Navbar />
      <main className="page-main">
        <div className="container" style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
          Loading booking…
        </div>
      </main>
      <Footer />
    </div>
  )

  if (error || !booking) return (
    <div className="site-wrap">
      <Navbar />
      <main className="page-main">
        <div className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <p style={{ marginBottom: 16 }}>{error || 'Booking not found.'}</p>
          <button className="btn btn-primary" onClick={() => navigate('/bookings')}>Back to My Account</button>
        </div>
      </main>
      <Footer />
    </div>
  )

  const paidAmount = booking.totalCost || 0
  const isCompleted = booking.status === 'completed'

  return (
    <div className="site-wrap">
      <Navbar />
      <main className="page-main" style={{ background: 'var(--bg-page)' }}>
        <div className="container" style={{ padding: '28px 24px' }}>

          <button onClick={() => navigate('/bookings')} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, background: 'none', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={15} /> back to bookings
          </button>

          <div className="page-card">
            <div style={{ marginBottom: 4, fontSize: 13, color: 'var(--text-muted)' }}>{booking.placedOn}</div>
            <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Booking #{booking.id}</h1>

            <div className="sidebar-layout-right">
              <div>
                {/* Image */}
                <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
                  <img src={booking.image} alt={booking.packageTitle} style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }} />
                  <span style={{
                    position: 'absolute', top: 12, right: 12,
                    background: booking.status === 'cancelled' ? '#dc2626' : booking.status === 'completed' ? '#27ae60' : '#e67e22',
                    color: '#fff', fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999,
                    textTransform: 'capitalize',
                  }}>
                    {booking.status}
                  </span>
                </div>

                <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{booking.packageTitle}</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <Calendar size={14} color="var(--primary)" /> {booking.dateRange || booking.dates}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <Users size={14} color="var(--primary)" /> {booking.guestLabel}
                  </span>
                </div>

                {isCompleted && (
                  <div style={{ background: '#fff8e1', border: '1px solid #ffe0b2', borderRadius: 10, padding: 16, marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#d35400', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Star size={18} fill="#f39c12" color="#f39c12" /> Trip Completed!
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                          {isReviewed ? 'Thank you for sharing your review with Sahyadri Travels!' : 'How was your journey? Rate & leave a review for this tour.'}
                        </p>
                      </div>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ background: '#f39c12', borderColor: '#e67e22', flexShrink: 0 }}
                        onClick={() => setShowReviewModal(true)}
                      >
                        {isReviewed ? 'Edit Review' : 'Write Review'}
                      </button>
                    </div>
                  </div>
                )}

                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Booking Status</h3>
                <div style={{ position: 'relative', paddingLeft: 16 }}>
                  <div style={{ position: 'absolute', left: 7, top: 14, bottom: 14, width: 2, background: '#e0e0e0' }} />
                  {booking.timeline.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: item.done ? 'var(--primary)' : '#fff', border: `2px solid ${item.done ? 'var(--primary)' : '#ddd'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: -7, zIndex: 1 }}>
                        {item.done && <Check size={13} color="#fff" strokeWidth={3} />}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{item.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="page-card" style={{ border: '1.5px solid var(--border)' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>booking details</div>
                  {[
                    { k: 'Booking ref', v: booking.bookingRef },
                    { k: 'Base cost',   v: `₹${(booking.baseCost || 0).toLocaleString()}` },
                    { k: 'GST (5%)',    v: `₹${(booking.taxes || 0).toLocaleString()}` },
                    { k: 'Total cost',  v: `₹${(booking.totalCost || 0).toLocaleString()}` },
                  ].map(row => (
                    <div key={row.k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                      <span style={{ color: 'var(--text-muted)' }}>{row.k}</span>
                      <span style={{ fontWeight: 600 }}>{row.v}</span>
                    </div>
                  ))}
                  <hr className="divider" />
                  
                  <button
                    className="btn btn-primary btn-full"
                    onClick={() => setShowDetailsModal(true)}
                    style={{ marginBottom: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <Eye size={15} /> View Details
                  </button>

                  <button className="btn btn-outline btn-full" onClick={() => navigate('/home')}>Back to Home</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Write Review Modal */}
      {showReviewModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div className="page-card" style={{ width: '100%', maxWidth: 440, position: 'relative' }}>
            <button
              onClick={() => { setShowReviewModal(false); setReviewMsg(null) }}
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} color="var(--text-muted)" />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 38, height: 38, borderRadius: 8, background: '#fff8e1', color: '#f39c12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Star size={20} fill="#f39c12" color="#f39c12" />
              </div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700 }}>Review Completed Trip</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{booking.packageTitle}</p>
              </div>
            </div>

            {reviewMsg && (
              <div style={{
                padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, marginBottom: 16,
                background: reviewMsg.type === 'success' ? '#e8f5ee' : '#fdecea',
                color: reviewMsg.type === 'success' ? 'var(--primary)' : '#c0392b',
              }}>
                {reviewMsg.type === 'success' ? '✓ ' : '⚠ '}{reviewMsg.text}
              </div>
            )}

            <form onSubmit={handleReviewSubmit}>
              {/* Star Rating Picker */}
              <div className="input-wrap" style={{ marginBottom: 18, textAlign: 'center' }}>
                <label className="input-label" style={{ marginBottom: 8, display: 'block' }}>Your Rating</label>
                <div style={{ display: 'inline-flex', gap: 8, cursor: 'pointer' }}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoverRating || rating) >= star
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                      >
                        <Star
                          size={28}
                          fill={active ? '#f39c12' : 'none'}
                          color={active ? '#f39c12' : '#ccc'}
                          strokeWidth={1.5}
                        />
                      </button>
                    )
                  })}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginTop: 4 }}>
                  {rating === 5 ? 'Excellent 🌟🌟🌟🌟🌟' : rating === 4 ? 'Very Good 👍' : rating === 3 ? 'Good 🙂' : rating === 2 ? 'Fair 😐' : 'Poor 👎'}
                </div>
              </div>

              {/* Review Comment */}
              <div className="input-wrap" style={{ marginBottom: 20 }}>
                <label className="input-label">Your Review & Feedback</label>
                <textarea
                  className="input"
                  rows={4}
                  required
                  placeholder="Share details about your experience, guide, hotels, transfers, or highlights..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => { setShowReviewModal(false); setReviewMsg(null) }}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={reviewSubmitting}
                >
                  {reviewSubmitting ? 'Submitting…' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* View Details Modal */}
      {showDetailsModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div className="page-card" style={{ width: '100%', maxWidth: 520, position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button
              onClick={() => setShowDetailsModal(false)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} color="var(--text-muted)" />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: '#e8f5ee', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Package & Booking Breakdown</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Ref: #{booking.bookingRef || booking.id}</p>
              </div>
            </div>

            {/* Package Info Card */}
            <div style={{ background: '#faf8f5', borderRadius: 10, padding: '14px 16px', border: '1px solid var(--border-light)', marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>
                {booking.packageTitle}
              </div>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 13, color: 'var(--text-secondary)' }}>
                <span>📅 {booking.dateRange || booking.dates}</span>
                <span>👥 {booking.guestLabel}</span>
              </div>
            </div>

            {/* Guest & Traveler Details */}
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Guest Details</h4>
              <div style={{ background: '#fff', border: '1px solid var(--border-light)', borderRadius: 8, padding: 12, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Total Travelers:</span>
                  <span style={{ fontWeight: 600 }}>{booking.guestLabel}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Booking Ref ID:</span>
                  <span style={{ fontWeight: 600 }}>{booking.bookingRef}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Booking Date:</span>
                  <span style={{ fontWeight: 600 }}>{booking.placedOn}</span>
                </div>
              </div>
            </div>

            {/* Payment Done & Financial Summary */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Payment & Balance Breakdown</h4>
              <div style={{ background: '#fff', border: '1px solid var(--border-light)', borderRadius: 8, padding: 14, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Base Package Cost:</span>
                  <span>₹{(booking.baseCost || 0).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>GST & Taxes (5%):</span>
                  <span>₹{(booking.taxes || 0).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 14, borderTop: '1px solid #eee', paddingTop: 8, marginTop: 4, marginBottom: 12 }}>
                  <span>Total Package Cost:</span>
                  <span style={{ color: 'var(--text-primary)' }}>₹{(booking.totalCost || 0).toLocaleString()}</span>
                </div>

                <div style={{ background: '#e8f5ee', padding: '12px', borderRadius: 8, border: '1px solid #c2e8d3', marginBottom: booking.isRegistration ? 10 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CreditCard size={15} /> Actual Amount Paid: ₹{(booking.paidAmount || 0).toLocaleString()}
                    </span>
                    <span style={{ fontSize: 11, background: 'var(--primary)', color: '#fff', fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>
                      {booking.isRegistration ? '50% REGISTRATION' : 'FULL PAYMENT'}
                    </span>
                  </div>
                </div>

                {booking.isRegistration && (
                  <div style={{ background: '#fff3e0', padding: '12px', borderRadius: 8, border: '1px solid #ffe0b2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#e67e22', display: 'block' }}>
                        Pending Balance Due: ₹{(booking.pendingAmount || 0).toLocaleString()}
                      </span>
                      <span style={{ fontSize: 11, color: '#888' }}>Due 7 days before departure date</span>
                    </div>
                    <span style={{ fontSize: 11, background: '#e67e22', color: '#fff', fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>
                      UNPAID (50%)
                    </span>
                  </div>
                )}
              </div>
            </div>




            <button
              className="btn btn-primary btn-full"
              onClick={() => setShowDetailsModal(false)}
            >
              Close Details
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}


