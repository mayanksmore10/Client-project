import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, User, Calendar, CreditCard, Star, X } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { getMyBookings, updateProfile, uploadProfilePhoto, submitTripReview } from '../services/api'

const SIDEBAR_LINKS = ['profile', 'my trips', 'payments']

const STATUS_STYLE = {
  confirmed:  { label: 'confirmed',               bg: '#e8f5ee', color: 'var(--primary)' },
  token_paid: { label: 'token paid, awaiting call', bg: '#fff3e0', color: '#e67e22' },
  completed:  { label: 'completed',               bg: '#f0f0f0', color: '#555' },
  cancelled:  { label: 'cancelled',               bg: '#fdecea', color: '#c0392b' },
  draft:      { label: 'draft',                   bg: '#f5f5f5', color: '#888' },
  pending:    { label: 'pending confirmation',     bg: '#fff8e1', color: '#d4a017' },
}

function getInitials(name) {
  if (!name) return 'MM'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return parts[0].substring(0, 2).toUpperCase()
}

export default function Bookings() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeLink, setActiveLink] = useState('profile')
  const [tab, setTab] = useState('upcoming')
  const fileInputRef = useRef(null)

  const [upcoming, setUpcoming] = useState([])
  const [past, setPast] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [bookingsError, setBookingsError] = useState(null)

  // Review modal state
  const [reviewingBooking, setReviewingBooking] = useState(null)
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewMsg, setReviewMsg] = useState(null)
  const [reviewedBookings, setReviewedBookings] = useState({})

  // Profile edit state
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    gender: '',
    date_of_birth: '',
  })
  const [photoUrl, setPhotoUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState(null)
  const [photoUploading, setPhotoUploading] = useState(false)

  useEffect(() => {
    if (user) {
      setProfileForm({
        full_name: user.full_name || '',
        phone: user.phone || '',
        email: user.email || '',
        gender: user.gender || '',
        date_of_birth: user.date_of_birth || '',
      })
      if (user.profile_photo_url) {
        setPhotoUrl(user.profile_photo_url)
      }
    }
  }, [user])

  useEffect(() => {
    if (activeLink !== 'my trips' && activeLink !== 'payments') return
    setBookingsLoading(true)
    setBookingsError(null)
    getMyBookings('all')
      .then(({ upcoming: u, past: p }) => {
        setUpcoming(u)
        setPast(p)
        setBookingsLoading(false)
      })
      .catch(err => {
        setBookingsError(err.message || 'Failed to load bookings')
        setBookingsLoading(false)
      })
  }, [activeLink])

  const list = tab === 'upcoming' ? upcoming : past

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!reviewingBooking) return
    setReviewSubmitting(true)
    setReviewMsg(null)
    try {
      await submitTripReview(reviewingBooking.id, rating, comment)
      setReviewedBookings(prev => ({ ...prev, [reviewingBooking.id]: { rating, comment } }))
      setReviewMsg({ type: 'success', text: 'Thank you! Your trip review has been published.' })
      setTimeout(() => {
        setReviewingBooking(null)
        setComment('')
        setRating(5)
        setReviewMsg(null)
      }, 1800)
    } catch (err) {
      setReviewMsg({ type: 'error', text: err.message || 'Failed to submit review' })
    } finally {
      setReviewSubmitting(false)
    }
  }


  const handleSaveProfile = async () => {
    setSaving(true)
    setSaveMsg(null)
    try {
      const payload = {}
      if (profileForm.full_name) payload.full_name = profileForm.full_name
      if (profileForm.phone) payload.phone = profileForm.phone
      if (profileForm.gender) payload.gender = profileForm.gender
      if (profileForm.date_of_birth) payload.date_of_birth = profileForm.date_of_birth
      if (photoUrl) payload.profile_photo_url = photoUrl
      await updateProfile(payload)
      setSaveMsg('Profile updated!')
    } catch (err) {
      setSaveMsg(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoUploading(true)
    try {
      const res = await uploadProfilePhoto(file)
      if (res?.profile_photo_url) {
        setPhotoUrl(res.profile_photo_url)
        setSaveMsg('Photo updated!')
      }
    } catch (_) {
      const localUrl = URL.createObjectURL(file)
      setPhotoUrl(localUrl)
      setSaveMsg('Photo updated!')
    } finally {
      setPhotoUploading(false)
    }
  }

  return (
    <div className="site-wrap">
      <Navbar />
      <main className="page-main" style={{ background: 'var(--bg-page)' }}>
        <div className="container" style={{ padding: '28px 24px' }}>

          <div className="page-card" style={{ padding: 0 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)', fontSize: 16, fontWeight: 700 }}>
              my account
            </div>

            <div className="sidebar-layout" style={{ gap: 0 }}>
              {/* ── Account sidebar ── */}
              <div style={{ borderRight: '1px solid var(--border-light)', padding: '20px 16px', minWidth: 240 }}>

                {/* Profile Photo & Name header */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24, textAlign: 'center' }}>
                  <div style={{ position: 'relative', width: 90, height: 90, marginBottom: 12 }}>
                    <div style={{
                      width: 90, height: 90, borderRadius: '50%',
                      background: 'var(--primary)', color: '#fff',
                      fontSize: 28, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden', border: '3px solid #fff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}>
                      {photoUrl ? (
                        <img src={photoUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        getInitials(profileForm.full_name || user?.full_name || 'Mayank More')
                      )}
                    </div>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      title="Upload photo"
                      disabled={photoUploading}
                      style={{
                        position: 'absolute', bottom: 0, right: 0,
                        width: 28, height: 28, borderRadius: '50%',
                        background: '#fff', border: '1.5px solid var(--border)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <Camera size={14} color="var(--text-primary)" />
                    </button>
                    <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handlePhotoSelect} />
                  </div>

                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {profileForm.full_name || user?.full_name || 'Mayank More'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {profileForm.email || user?.email || 'mayanksmore10@gmail.com'}
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '16px 0' }} />

                {/* Nav Links */}
                {SIDEBAR_LINKS.map(link => (
                  <button
                    key={link}
                    onClick={() => setActiveLink(link)}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '11px 16px', fontSize: 14,
                      fontWeight: activeLink === link ? 700 : 400,
                      color: activeLink === link ? 'var(--primary)' : 'var(--text-secondary)',
                      background: activeLink === link ? 'var(--primary-light)' : 'transparent',
                      borderRadius: 8,
                      border: 'none', cursor: 'pointer',
                      borderLeft: `3px solid ${activeLink === link ? 'var(--primary)' : 'transparent'}`,
                      marginBottom: 4,
                    }}
                  >
                    {link}
                  </button>
                ))}
              </div>

              {/* ── Content area ── */}
              <div style={{ padding: '24px' }}>
                {activeLink === 'profile' && (
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>profile</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 540 }}>
                      <div className="input-wrap">
                        <label className="input-label">full name</label>
                        <input
                          className="input"
                          value={profileForm.full_name || ''}
                          onChange={e => setProfileForm(p => ({ ...p, full_name: e.target.value }))}
                          placeholder="Full name"
                        />
                      </div>

                      <div className="input-wrap">
                        <label className="input-label">email address</label>
                        <input
                          className="input"
                          style={{ background: '#f5f5f5' }}
                          value={profileForm.email || ''}
                          readOnly
                        />
                      </div>

                      <div className="input-wrap">
                        <label className="input-label">phone</label>
                        <input
                          className="input"
                          value={profileForm.phone || ''}
                          onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                          placeholder="+91 98765 43210"
                        />
                      </div>

                      <div className="input-wrap">
                        <label className="input-label">date of birth (dob)</label>
                        <input
                          type="date"
                          className="input"
                          value={profileForm.date_of_birth || ''}
                          onChange={e => setProfileForm(p => ({ ...p, date_of_birth: e.target.value }))}
                        />
                      </div>

                      <div className="input-wrap">
                        <label className="input-label">gender</label>
                        <select
                          className="input"
                          value={profileForm.gender || ''}
                          onChange={e => setProfileForm(p => ({ ...p, gender: e.target.value }))}
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    {saveMsg && <p style={{ fontSize: 13, color: saveMsg.includes('!') ? 'var(--primary)' : '#e74c3c', marginTop: 12, fontWeight: 600 }}>{saveMsg}</p>}
                    <button className="btn btn-primary btn-sm" style={{ marginTop: 20 }} onClick={handleSaveProfile} disabled={saving}>
                      {saving ? 'Saving…' : 'Save changes'}
                    </button>
                  </div>
                )}

                {activeLink === 'my trips' && (
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>my trips</h2>

                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border-light)', marginBottom: 20 }}>
                      {['upcoming', 'past'].map(t => (
                        <button
                          key={t}
                          onClick={() => setTab(t)}
                          style={{
                            padding: '8px 20px', fontSize: 14, fontWeight: tab === t ? 600 : 400,
                            color: tab === t ? 'var(--primary)' : 'var(--text-muted)',
                            background: 'none', border: 'none', cursor: 'pointer',
                            borderBottom: `2px solid ${tab === t ? 'var(--primary)' : 'transparent'}`,
                            marginBottom: -1,
                          }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                    {/* Loading */}
                    {bookingsLoading && (
                      <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                        Loading trips…
                      </div>
                    )}

                    {/* Error */}
                    {bookingsError && !bookingsLoading && (
                      <div style={{ padding: '20px 0', fontSize: 13, color: '#e74c3c' }}>
                        {bookingsError}
                        {!user && <span> — <button className="btn btn-outline btn-sm" style={{ marginLeft: 8 }} onClick={() => navigate('/login')}>Sign in</button></span>}
                      </div>
                    )}

                    {/* Trip rows */}
                    {!bookingsLoading && !bookingsError && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {list.map(b => {
                          const ss = STATUS_STYLE[b.status] || STATUS_STYLE.pending
                          const isCompleted = b.status === 'completed' || tab === 'past'
                          const prevReview = reviewedBookings[b.id]
                          return (
                            <div
                              key={b.id}
                              onClick={() => navigate(`/bookings/${b.id}`)}
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '14px 18px', border: '1px solid var(--border-light)',
                                borderRadius: 10, cursor: 'pointer', background: '#fafafa',
                                flexWrap: 'wrap', gap: 12,
                              }}
                            >
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{b.packageTitle}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>dep {b.dateShort}</div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                {isCompleted && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setReviewingBooking(b)
                                      if (prevReview) {
                                        setRating(prevReview.rating)
                                        setComment(prevReview.comment)
                                      }
                                    }}
                                    style={{
                                      display: 'inline-flex', alignItems: 'center', gap: 5,
                                      padding: '6px 12px', fontSize: 12, fontWeight: 600,
                                      background: prevReview ? '#e8f5ee' : '#fff',
                                      color: prevReview ? 'var(--primary)' : '#d4a017',
                                      border: `1.5px solid ${prevReview ? 'var(--primary)' : '#f39c12'}`,
                                      borderRadius: 6, cursor: 'pointer',
                                    }}
                                  >
                                    <Star size={13} fill={prevReview ? 'var(--primary)' : '#f39c12'} color={prevReview ? 'var(--primary)' : '#f39c12'} />
                                    {prevReview ? `Reviewed (${prevReview.rating}★)` : 'Add Review'}
                                  </button>
                                )}

                                <span style={{ fontSize: 12, fontWeight: 600, background: ss.bg, color: ss.color, padding: '3px 10px', borderRadius: 999 }}>
                                  {ss.label}
                                </span>
                              </div>
                            </div>
                          )
                        })}

                        {list.length === 0 && (
                          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                            No {tab} trips.
                            {tab === 'upcoming' && (
                              <button className="btn btn-outline btn-sm" style={{ marginLeft: 10 }} onClick={() => navigate('/explore')}>
                                Browse tours
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeLink === 'payments' && (
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>payments</h2>
                    {bookingsLoading ? (
                      <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Loading payments...</div>
                    ) : bookingsError ? (
                      <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>{bookingsError}</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {[...upcoming, ...past].filter(b => b.status !== 'draft').length === 0 ? (
                          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                            No payment history.
                          </div>
                        ) : (
                          [...upcoming, ...past]
                            .filter(b => b.status !== 'draft')
                            .map(booking => {
                              const totalCost = booking.totalCost || booking.total || 0
                              const paidAmt = booking.paidAmount || totalCost
                              const isRegistration = booking.status === 'token_paid' || (totalCost > 0 && paidAmt < totalCost)
                              const title = booking.packageTitle || booking.package_title || 'Package Tour'
                              const dateLabel = booking.placedOn || booking.dates || 'Recently'
                              return (
                                <div key={booking.id || booking.booking_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid var(--border-light)', borderRadius: 10, flexWrap: 'wrap', gap: 10 }}>
                                  <div>
                                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{title}</div>
                                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                      ID: {booking.booking_id || booking.id} &bull; {dateLabel}
                                    </div>
                                  </div>
                                  <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
                                      Actual Paid: ₹{paidAmt.toLocaleString()}
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700, marginTop: 2 }}>
                                      {isRegistration ? '50% Registration Amount Paid' : '100% Full Amount Paid'}
                                    </div>
                                  </div>
                                </div>
                              )
                            })
                        )}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Review Modal */}
      {reviewingBooking && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div className="page-card" style={{ width: '100%', maxWidth: 440, position: 'relative' }}>
            <button
              onClick={() => { setReviewingBooking(null); setReviewMsg(null) }}
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
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{reviewingBooking.packageTitle}</p>
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
                <label className="input-label" style={{ marginBottom: 8, display: 'block' }}>Your Overall Rating</label>
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
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, transition: 'transform 0.15s' }}
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
                  onClick={() => { setReviewingBooking(null); setReviewMsg(null) }}
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

      <Footer />
    </div>
  )
}

