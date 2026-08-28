import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, QrCode, CreditCard, Landmark, ShieldCheck, Check } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { confirmBooking } from '../services/api'

const STEPS = ['travelers', 'review', 'token payment']

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
                fontSize: 12, fontWeight: 700, color: done || active ? '#fff' : '#aaa',
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

const METHODS = [
  { id: 'upi',     Icon: QrCode,     label: 'UPI',               sub: 'Google Pay, PhonePe, Paytm' },
  { id: 'card',    Icon: CreditCard, label: 'Credit/Debit Card',  sub: 'Visa, Mastercard, RuPay' },
  { id: 'netbank', Icon: Landmark,   label: 'Net Banking',        sub: 'All major banks supported' },
]

export default function Payment() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state || {}

  const booking = state.booking || {}
  const payAmount = state.payAmount || state.token || 30000
  const paymentOption = state.paymentOption || 'reg'
  const [selected, setSelected] = useState('upi')
  const [processing, setProcessing] = useState(false)


  const handlePay = async () => {
    setProcessing(true)
    try {
      await confirmBooking(id, payAmount)
      navigate(`/reserve/${id}/confirmed`, { state })
    } catch (err) {
      alert(err.message || 'Failed to process payment')
      setProcessing(false)
    }
  }


  return (
    <div className="site-wrap">
      <Navbar />
      <main className="page-main" style={{ background: 'var(--bg-page)' }}>
        <div className="container" style={{ padding: '28px 24px' }}>

          <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, background: 'none', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={15} /> payment
          </button>

          <div className="page-card">
            <Stepper current={3} />

            <div className="sidebar-layout-right">
              {/* ── Payment form ── */}
              <div>
                {/* Amount */}
                <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '20px', textAlign: 'center', marginBottom: 24 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Amount to Pay</div>
                  <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 8 }}>₹{payAmount.toLocaleString()}</div>
                  <span style={{ background: '#e8f5ee', color: 'var(--primary)', fontSize: 12, fontWeight: 600, padding: '3px 12px', borderRadius: 999 }}>
                    {paymentOption === 'full' ? 'Full Booking Amount' : '50% Registration Amount'}
                  </span>
                </div>


                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Payment Method</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {METHODS.map(({ id: mid, Icon, label, sub }) => (
                    <button
                      key={mid}
                      onClick={() => setSelected(mid)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '14px 16px', borderRadius: 10,
                        border: `1.5px solid ${selected === mid ? 'var(--primary)' : 'var(--border)'}`,
                        background: selected === mid ? '#f0fbf5' : '#fff',
                        cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: 9, background: selected === mid ? '#e8f5ee' : '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={19} color={selected === mid ? 'var(--primary)' : '#888'} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>
                      </div>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${selected === mid ? 'var(--primary)' : '#ccc'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {selected === mid && <div style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--primary)' }} />}
                      </div>
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, justifyContent: 'center' }}>
                  <ShieldCheck size={14} color="var(--text-muted)" />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>100% Secure Payment Processing</span>
                </div>

                <button
                  className="btn btn-primary btn-full btn-lg"
                  onClick={handlePay}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : `Pay ₹${payAmount.toLocaleString()}`}
                </button>

              </div>

              {/* ── Order summary ── */}
              <div>
                <div className="page-card" style={{ border: '1.5px solid var(--border)' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>order summary</div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{booking.packageTitle || 'Package'}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>{booking.dates || booking.travel_date}</div>
                  <hr className="divider" />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Total (est.)</span>
                    <span>₹{(state.total || 0).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, color: 'var(--primary)' }}>
                    <span>Amount Payable</span>
                    <span>₹{payAmount.toLocaleString()}</span>
                  </div>

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
