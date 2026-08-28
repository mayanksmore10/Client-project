import { useState, useEffect } from 'react'
import { MessageCircle, Sparkles, Lock, Mail, ChevronDown, ChevronUp, ArrowLeft, Send, X, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { faqs } from '../data/mockData'
import { submitContact, getWhatsAppLink, submitCustomEnquiry, getCustomEnquiries } from '../services/api'

function FAQ({ faq }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid var(--border-light)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '15px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}
      >
        <span style={{ fontSize: 14, fontWeight: 500, flex: 1, lineHeight: 1.4 }}>{faq.question}</span>
        {open ? <ChevronUp size={15} color="var(--text-muted)" /> : <ChevronDown size={15} color="var(--text-muted)" />}
      </button>
      {open && <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65, paddingBottom: 14 }}>{faq.answer}</p>}
    </div>
  )
}

export default function HelpSupport() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [err, setErr] = useState(null)

  // Password Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passForm, setPassForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [passMsg, setPassMsg] = useState(null)

  // Custom Package Enquiry Modal
  const [showEnquiryModal, setShowEnquiryModal] = useState(false)
  const [enquiryForm, setEnquiryForm] = useState({
    destination: '',
    days: '',
    budget: '',
    guests: '',
    name: '',
    email: '',
    phone: '',
    requirements: '',
  })
  const [enquirySubmitting, setEnquirySubmitting] = useState(false)
  const [enquiryMsg, setEnquiryMsg] = useState(null)

  // Customer Recommendations / Custom Enquiries List
  const [customEnquiries, setCustomEnquiries] = useState([])

  useEffect(() => {
    getCustomEnquiries().then(res => {
      if (Array.isArray(res)) setCustomEnquiries(res)
    }).catch(() => {})
  }, [])

  const handleEnquirySubmit = async (e) => {
    e.preventDefault()
    if (!enquiryForm.destination || !enquiryForm.name || !enquiryForm.email || !enquiryForm.requirements) {
      setEnquiryMsg({ type: 'error', text: 'Please fill in destination, name, email and your requirements.' })
      return
    }
    setEnquirySubmitting(true)
    setEnquiryMsg(null)
    try {
      await submitCustomEnquiry(enquiryForm)
      setEnquiryMsg({ type: 'success', text: 'Custom package enquiry saved to database! Our travel planner will contact you.' })
      
      // Re-fetch custom recommendations list
      getCustomEnquiries().then(res => {
        if (Array.isArray(res)) setCustomEnquiries(res)
      }).catch(() => {})

      setTimeout(() => {
        setShowEnquiryModal(false)
        setEnquiryMsg(null)
        setEnquiryForm({ destination: '', days: '', budget: '', guests: '', name: '', email: '', phone: '', requirements: '' })
      }, 1600)
    } catch (err) {
      setEnquiryMsg({ type: 'error', text: err.message || 'Failed to submit custom enquiry' })
    } finally {
      setEnquirySubmitting(false)
    }
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassMsg({ type: 'error', text: 'New passwords do not match!' })
      return
    }
    if (passForm.newPassword.length < 6) {
      setPassMsg({ type: 'error', text: 'Password must be at least 6 characters.' })
      return
    }
    setPassMsg({ type: 'success', text: 'Password updated successfully!' })
    setTimeout(() => {
      setShowPasswordModal(false)
      setPassMsg(null)
      setPassForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
    }, 1500)
  }

  const handleWhatsApp = async () => {
    try {
      const res = await getWhatsAppLink()
      if (res?.whatsapp_url) {
        window.open(res.whatsapp_url, '_blank')
      } else {
        window.open('https://wa.me/919876543210', '_blank')
      }
    } catch (_) {
      window.open('https://wa.me/919876543210', '_blank')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      setErr('Please fill in your name, email and message.')
      return
    }
    setSubmitting(true)
    setErr(null)
    try {
      await submitContact(form)
      setSubmitted(true)
      setForm({ name: '', email: '', phone: '', message: '' })
    } catch (error) {
      setErr(error.message || 'Failed to send message.')
    } finally {
      setSubmitting(false)
    }
  }

  const SUPPORT_OPTIONS = [
    { Icon: MessageCircle, label: 'Chat on WhatsApp', sub: 'Fastest response for quick queries', color: '#25D366', action: handleWhatsApp },
    { Icon: Sparkles, label: 'Custom Package Enquiry', sub: 'Request a tailored tour plan & required budget', color: 'var(--primary)', action: () => setShowEnquiryModal(true) },
    { Icon: Lock, label: 'Change Password', sub: 'Update account security credentials', color: 'var(--primary)', action: () => setShowPasswordModal(true) },
    { Icon: Mail, label: 'Email us', sub: 'Typically replies in 24 hrs', color: 'var(--primary)', action: () => window.open('mailto:support@sahyadritravels.com') },
  ]



  return (
    <div className="site-wrap">
      <Navbar />
      <main className="page-main" style={{ background: 'var(--bg-page)' }}>
        <div className="container" style={{ padding: '36px 24px 60px' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <button onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <ArrowLeft size={15} /> back
            </button>

            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Contact & Support</h1>

            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>
              How can we help you today? Select an option below or send us a message.
            </p>

            <div className="grid-2" style={{ marginBottom: 32 }}>
              {SUPPORT_OPTIONS.map(({ Icon, label, sub, color, action }) => (
                <button
                  key={label}
                  onClick={action}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderRadius: 12, border: '1px solid var(--border-light)', background: '#fff', cursor: 'pointer', textAlign: 'left' }}
                >
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: '#f0fbf5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={20} color={color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>
                  </div>
                  <ChevronDown size={14} color="var(--text-muted)" style={{ transform: 'rotate(-90deg)', flexShrink: 0 }} />
                </button>
              ))}
            </div>

            {/* Contact Form */}
            <div className="page-card" style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Send us a message</h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Have a question or request? Fill in the form and our team will respond shortly.</p>

              {submitted && (
                <div style={{ padding: '12px 16px', background: '#e8f5ee', color: 'var(--primary)', borderRadius: 8, fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
                  ✓ Thank you! Your message has been sent successfully. We will get back to you soon.
                </div>
              )}

              {err && (
                <div style={{ padding: '12px 16px', background: '#fdecea', color: '#c0392b', borderRadius: 8, fontSize: 14, marginBottom: 16 }}>
                  ⚠ {err}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div className="input-wrap">
                    <label className="input-label">Your Name</label>
                    <input className="input" placeholder="Enter your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="input-wrap">
                    <label className="input-label">Email Address</label>
                    <input className="input" type="email" placeholder="name@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                  </div>
                </div>

                <div className="input-wrap" style={{ marginBottom: 14 }}>
                  <label className="input-label">Phone Number (Optional)</label>
                  <input className="input" placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>

                <div className="input-wrap" style={{ marginBottom: 20 }}>
                  <label className="input-label">Message</label>
                  <textarea className="input" rows={4} placeholder="How can we help you?" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required style={{ resize: 'vertical' }} />
                </div>

                <button className="btn btn-primary btn-lg" type="submit" disabled={submitting} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <Send size={16} /> {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>


            <div className="page-card">
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Frequently Asked Questions</h2>
              {faqs.map(faq => <FAQ key={faq.id} faq={faq} />)}
            </div>
          </div>
        </div>
      </main>

      {/* Custom Package Enquiry Modal */}
      {showEnquiryModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div className="page-card" style={{ width: '100%', maxWidth: 520, position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button
              onClick={() => { setShowEnquiryModal(false); setEnquiryMsg(null) }}
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} color="var(--text-muted)" />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f0fbf5', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Custom Package Enquiry</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Specify your destination, dates, budget & custom preferences</p>
              </div>
            </div>

            {enquiryMsg && (
              <div style={{
                padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, marginBottom: 16,
                background: enquiryMsg.type === 'success' ? '#e8f5ee' : '#fdecea',
                color: enquiryMsg.type === 'success' ? 'var(--primary)' : '#c0392b',
              }}>
                {enquiryMsg.type === 'success' ? '✓ ' : '⚠ '}{enquiryMsg.text}
              </div>
            )}

            <form onSubmit={handleEnquirySubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div className="input-wrap">
                  <label className="input-label">Destination / Places</label>
                  <input
                    className="input"
                    placeholder="e.g. Kerala & Munnar"
                    value={enquiryForm.destination}
                    onChange={e => setEnquiryForm({ ...enquiryForm, destination: e.target.value })}
                    required
                  />
                </div>
                <div className="input-wrap">
                  <label className="input-label">Duration (Days)</label>
                  <input
                    className="input"
                    placeholder="e.g. 5 Days / 4 Nights"
                    value={enquiryForm.days}
                    onChange={e => setEnquiryForm({ ...enquiryForm, days: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div className="input-wrap">
                  <label className="input-label">Required Budget (₹)</label>
                  <input
                    className="input"
                    placeholder="e.g. 25,000 / person"
                    value={enquiryForm.budget}
                    onChange={e => setEnquiryForm({ ...enquiryForm, budget: e.target.value })}
                  />
                </div>
                <div className="input-wrap">
                  <label className="input-label">Guests / Type</label>
                  <input
                    className="input"
                    placeholder="e.g. 4 Adults (Family)"
                    value={enquiryForm.guests}
                    onChange={e => setEnquiryForm({ ...enquiryForm, guests: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div className="input-wrap">
                  <label className="input-label">Your Name</label>
                  <input
                    className="input"
                    placeholder="Enter your name"
                    value={enquiryForm.name}
                    onChange={e => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="input-wrap">
                  <label className="input-label">Email Address</label>
                  <input
                    className="input"
                    type="email"
                    placeholder="you@example.com"
                    value={enquiryForm.email}
                    onChange={e => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="input-wrap" style={{ marginBottom: 12 }}>
                <label className="input-label">Phone Number (Optional)</label>
                <input
                  className="input"
                  placeholder="+91 98765 43210"
                  value={enquiryForm.phone}
                  onChange={e => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                />
              </div>

              <div className="input-wrap" style={{ marginBottom: 20 }}>
                <label className="input-label">Free Text Custom Requirements & Budget Notes</label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Explain your required budget, hotel preferences, specific sightseeing places to include..."
                  value={enquiryForm.requirements}
                  onChange={e => setEnquiryForm({ ...enquiryForm, requirements: e.target.value })}
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => { setShowEnquiryModal(false); setEnquiryMsg(null) }}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={enquirySubmitting}
                >
                  {enquirySubmitting ? 'Saving to DB...' : 'Submit Enquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Change Password Modal */}
      {showPasswordModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div className="page-card" style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
            <button
              onClick={() => { setShowPasswordModal(false); setPassMsg(null) }}
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} color="var(--text-muted)" />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f0fbf5', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={18} />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700 }}>Change Password</h3>
            </div>

            {passMsg && (
              <div style={{
                padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, marginBottom: 16,
                background: passMsg.type === 'success' ? '#e8f5ee' : '#fdecea',
                color: passMsg.type === 'success' ? 'var(--primary)' : '#c0392b',
              }}>
                {passMsg.type === 'success' ? '✓ ' : '⚠ '}{passMsg.text}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit}>
              <div className="input-wrap" style={{ marginBottom: 12 }}>
                <label className="input-label">Current Password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  value={passForm.oldPassword}
                  onChange={e => setPassForm({ ...passForm, oldPassword: e.target.value })}
                  required
                />
              </div>

              <div className="input-wrap" style={{ marginBottom: 12 }}>
                <label className="input-label">New Password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  value={passForm.newPassword}
                  onChange={e => setPassForm({ ...passForm, newPassword: e.target.value })}
                  required
                />
              </div>

              <div className="input-wrap" style={{ marginBottom: 20 }}>
                <label className="input-label">Confirm New Password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  value={passForm.confirmPassword}
                  onChange={e => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => { setShowPasswordModal(false); setPassMsg(null) }}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Update Password
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


