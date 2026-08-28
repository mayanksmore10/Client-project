import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Check, Edit2, Gift, Info } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const STEPS = ['travelers', 'review', 'payment']

function Stepper({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
      {STEPS.map((label, i) => {
        const n = i + 1
        const done = n < current
        const active = n === current
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: done || active ? 'var(--primary)' : '#fff',
                border: `2px solid ${done || active ? 'var(--primary)' : '#ccc'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
                color: done || active ? '#fff' : '#aaa',
              }}>
                {done ? <Check size={13} strokeWidth={3} /> : n}
              </div>
              <span style={{ fontSize: 11, color: active ? 'var(--primary)' : '#aaa', fontWeight: active ? 600 : 400, whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, background: done ? 'var(--primary)' : '#e0e0e0', margin: '0 6px', marginBottom: 18 }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function ReviewDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state || {}

  const booking = state.booking || {}
  const pkgDetails = state.packageDetails || {}


  const guests = booking.guests || []
  const leadGuest = guests[0] || {}

  const count = booking.adult_count || state.count || 2
  const base = booking.price_breakdown?.subtotal || state.base || 60900
  const taxes = booking.price_breakdown?.gst_amount || 0
  const total = booking.price_breakdown?.total || (base + taxes) || 60900
  const regAmount = Math.round(total * 0.5) // 50% registration amount

  // Payment selection state: 'reg' (50%), 'full' (100%)
  const [paymentOption, setPaymentOption] = useState('reg')
  const [giftCode, setGiftCode] = useState('')
  const [showBreakup, setShowBreakup] = useState(false)

  const selectedPayAmount = paymentOption === 'reg' ? regAmount : total

  const handleProceed = (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    const targetId = id || booking.booking_id || booking.id || 'draft'
    const finalPayAmount = Number(selectedPayAmount) || regAmount || 10000
    navigate(`/reserve/${encodeURIComponent(targetId)}/payment`, {
      state: {
        ...state,
        booking,
        total,
        payAmount: finalPayAmount,
        token: finalPayAmount,
        paymentOption,
      },
    })
  }



  return (
    <div className="site-wrap">
      <Navbar />
      <main className="page-main" style={{ background: '#f8fafc' }}>
        <div className="container" style={{ padding: '28px 24px' }}>

          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 14,
              color: 'var(--text-secondary)',
              marginBottom: 16,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={15} /> review your booking
          </button>

          <div className="page-card" style={{ padding: '24px 28px' }}>
            <Stepper current={2} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 32, alignItems: 'start' }}>

              {/* ── Left Details Panel ── */}
              <div>
                {/* Package Header Banner */}
                <div style={{ marginBottom: 16 }}>
                  <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                    {booking.packageTitle || pkgDetails.title || 'Delhi Agra'}
                  </h1>
                  <div style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>
                    {pkgDetails.duration || '5 days/4 nights'}, {booking.dates || '18 September 2026 - 22 September 2026'} / {booking.destination || 'Delhi'} (Joining/leaving)
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>
                    We request you to make sure all details are correct to ensure a smooth booking process.
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '20px 0' }} />

                {/* Lead Traveller Details */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <h3 style={{ fontStyle: 'italic', fontSize: 15, color: '#334155', fontWeight: 600 }}>
                      Lead Traveller details
                    </h3>
                    <button
                      onClick={() => navigate(-1)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 14,
                        fontWeight: 600,
                        color: 'var(--primary)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: 10, columnGap: 16, fontSize: 14 }}>
                    <div style={{ color: '#64748b' }}>Name</div>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{leadGuest.name || state.names || 'Mayank More'}</div>

                    <div style={{ color: '#64748b' }}>Gender</div>
                    <div style={{ fontWeight: 600, color: '#0f172a', textTransform: 'capitalize' }}>{leadGuest.gender || 'Male'}</div>

                    <div style={{ color: '#64748b' }}>Mobile No.</div>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{leadGuest.phone || state.phone || '+91 9821814464'}</div>

                    <div style={{ color: '#64748b' }}>Email ID</div>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{leadGuest.email || state.email || 'mayanksmore10@gmail.com'}</div>

                    <div style={{ color: '#64748b' }}>Date of Birth</div>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{leadGuest.date_of_birth || '09 Aug 2000'}</div>

                    <div style={{ color: '#64748b' }}>Nationality</div>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{leadGuest.nationality || 'India'}</div>

                    <div style={{ color: '#64748b' }}>State</div>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{leadGuest.state || 'N/A'}</div>

                    <div style={{ color: '#64748b' }}>GST details?</div>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>No</div>
                  </div>
                </div>

                {/* Co-Traveller Details */}
                {(guests.length > 1 || count > 1) && (
                  <div>
                    <h3 style={{ fontStyle: 'italic', fontSize: 15, color: '#334155', fontWeight: 600, marginBottom: 14 }}>
                      Co-Traveller details
                    </h3>

                    {(guests.slice(1).length ? guests.slice(1) : [{ name: 'Katre Aditya', gender: 'Male', phone: '+91 8010387098', date_of_birth: '03 Sep 2000' }]).map((guest, idx) => (
                      <div key={idx} style={{ marginBottom: 18 }}>
                        <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, marginBottom: 8 }}>Adult {idx + 2}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: 8, columnGap: 16, fontSize: 14 }}>
                          <div style={{ color: '#64748b' }}>Name</div>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{guest.name}</div>

                          <div style={{ color: '#64748b' }}>Gender</div>
                          <div style={{ fontWeight: 600, color: '#0f172a', textTransform: 'capitalize' }}>{guest.gender || 'Male'}</div>

                          <div style={{ color: '#64748b' }}>Mobile No.</div>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{guest.phone || '+91 8010387098'}</div>

                          <div style={{ color: '#64748b' }}>Date of Birth</div>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{guest.date_of_birth || '03 Sep 2000'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Right Payment Options & Grand Total Panel ── */}
              <div>
                <div style={{
                  background: '#fff',
                  border: '1px solid #cbd5e1',
                  borderRadius: 14,
                  padding: '22px 20px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
                }}>
                  {/* Payment Radio Options */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
                    {/* Reg Amount 50% */}
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'space-between',
                      cursor: 'pointer',
                      fontSize: 15,
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input
                          type="radio"
                          name="paymentOption"
                          checked={paymentOption === 'reg'}
                          onChange={() => setPaymentOption('reg')}
                          style={{ accentColor: 'var(--primary)', width: 17, height: 17 }}
                        />
                        <span>Pay Registration Amount (50%)</span>
                      </div>
                      <span style={{ fontSize: 16, fontWeight: 700 }}>₹{regAmount.toLocaleString()}</span>
                    </label>

                    {/* Full Amount 100% */}
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'space-between',
                      cursor: 'pointer',
                      fontSize: 15,
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input
                          type="radio"
                          name="paymentOption"
                          checked={paymentOption === 'full'}
                          onChange={() => setPaymentOption('full')}
                          style={{ accentColor: 'var(--primary)', width: 17, height: 17 }}
                        />
                        <span>Pay Full Amount</span>
                      </div>
                      <span style={{ fontSize: 16, fontWeight: 700 }}>₹{total.toLocaleString()}</span>
                    </label>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '20px 0' }} />

                  {/* Summary Total */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Total Payable</span>
                    <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>₹{selectedPayAmount.toLocaleString()}</span>
                  </div>

                  {/* Proceed Button */}
                  <button
                    type="button"
                    className="btn btn-primary btn-full btn-lg"
                    onClick={handleProceed}
                    style={{ width: '100%', padding: '14px', cursor: 'pointer', position: 'relative', zIndex: 10 }}
                  >
                    Proceed to Payment →
                  </button>


                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

