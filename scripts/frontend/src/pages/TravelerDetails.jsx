import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Check, ChevronDown, Calendar } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getBooking } from '../services/api'
import { useAuth } from '../context/AuthContext'

const STEPS = ['travelers', 'review', 'payment']

const CountryOptions = [
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+1', flag: '🇺🇸', name: 'USA' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+65', flag: '🇸🇬', name: 'Singapore' },
  { code: '+1', flag: '🇨🇦', name: 'Canada' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
]

const IndianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh'
]

const Nationalities = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia',
  'United Arab Emirates', 'Singapore', 'Germany', 'France', 'Other'
]

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

function OutlinedInput({ label, required, value, onChange, placeholder, type = 'text', error }) {
  return (
    <div style={{ position: 'relative' }}>
      <fieldset style={{
        border: error ? '1.5px solid #dc2626' : '1px solid #52525b',
        borderRadius: 8,
        padding: '2px 12px 6px 12px',
        margin: 0,
        background: '#fff',
        transition: 'border-color 0.2s ease',
      }}>
        <legend style={{
          padding: '0 4px',
          fontSize: 12,
          color: error ? '#dc2626' : '#52525b',
          fontWeight: 500,
          lineHeight: 1,
          marginLeft: -2,
        }}>
          {label}{required && '*'}
        </legend>
        <div style={{ display: 'flex', alignItems: 'center', height: 34 }}>
          <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: 15,
              color: '#0f172a',
              background: 'transparent',
              fontFamily: 'inherit'
            }}
          />
        </div>
      </fieldset>
      {error && (
        <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4, fontWeight: 500 }}>
          {error}
        </div>
      )}
    </div>
  )
}

function OutlinedSelect({ label, required, value, onChange, options, placeholder, error }) {
  return (
    <div style={{ position: 'relative' }}>
      <fieldset style={{
        border: error ? '1.5px solid #dc2626' : '1px solid #52525b',
        borderRadius: 8,
        padding: '2px 12px 6px 12px',
        margin: 0,
        background: '#fff',
        transition: 'border-color 0.2s ease',
      }}>
        <legend style={{
          padding: '0 4px',
          fontSize: 12,
          color: error ? '#dc2626' : '#52525b',
          fontWeight: 500,
          lineHeight: 1,
          marginLeft: -2,
        }}>
          {label}{required && '*'}
        </legend>
        <div style={{ display: 'flex', alignItems: 'center', height: 34, position: 'relative' }}>
          <select
            value={value}
            onChange={onChange}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: 15,
              color: value ? '#0f172a' : '#52525b',
              background: 'transparent',
              fontFamily: 'inherit',
              cursor: 'pointer',
              appearance: 'none',
              WebkitAppearance: 'none',
              paddingRight: 24
            }}
          >
            {placeholder && <option value="" disabled hidden>{placeholder}</option>}
            {!placeholder && <option value="">Select {label}</option>}
            {options.map(opt => typeof opt === 'string' ? (
              <option key={opt} value={opt}>{opt}</option>
            ) : (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div style={{ position: 'absolute', right: 4, pointerEvents: 'none', color: '#52525b', display: 'flex' }}>
            <ChevronDown size={18} />
          </div>
        </div>
      </fieldset>
      {error && (
        <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4, fontWeight: 500 }}>
          {error}
        </div>
      )}
    </div>
  )
}

function OutlinedMobile({ label = 'Mobile No.', required = true, countryCode, setCountryCode, phone, setPhone, error }) {
  const currentCountry = CountryOptions.find(c => c.code === countryCode) || CountryOptions[0]

  return (
    <div style={{ position: 'relative' }}>
      <fieldset style={{
        border: error ? '1.5px solid #dc2626' : '1px solid #52525b',
        borderRadius: 8,
        padding: '2px 12px 6px 12px',
        margin: 0,
        background: '#fff',
        transition: 'border-color 0.2s ease',
      }}>
        <legend style={{
          padding: '0 4px',
          fontSize: 12,
          color: error ? '#dc2626' : '#52525b',
          fontWeight: 500,
          lineHeight: 1,
          marginLeft: -2,
        }}>
          {label}{required && '*'}
        </legend>
        <div style={{ display: 'flex', alignItems: 'center', height: 34, gap: 10 }}>
          {/* Country Flag & Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, position: 'relative', cursor: 'pointer', paddingRight: 4 }}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>{currentCountry.flag}</span>
            <ChevronDown size={14} style={{ color: '#52525b' }} />
            <select
              value={countryCode}
              onChange={e => setCountryCode(e.target.value)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer'
              }}
            >
              {CountryOptions.map(c => (
                <option key={c.code + c.name} value={c.code}>
                  {c.flag} {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div style={{ width: 1, height: 20, background: '#cbd5e1' }} />

          <span style={{ fontSize: 15, color: '#0f172a', fontWeight: 500, minWidth: 32 }}>
            {countryCode}
          </span>

          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
            placeholder=""
            maxLength={10}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 15,
              color: '#0f172a',
              background: 'transparent',
              fontFamily: 'inherit'
            }}
          />
        </div>
      </fieldset>
      {error && (
        <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4, fontWeight: 500 }}>
          {error}
        </div>
      )}
    </div>
  )
}

function OutlinedDateOfBirth({ label = 'Date of birth', required = true, value, onChange, error }) {
  return (
    <div style={{ position: 'relative' }}>
      <fieldset style={{
        border: error ? '1.5px solid #dc2626' : '1px solid #52525b',
        borderRadius: 8,
        padding: '2px 12px 6px 12px',
        margin: 0,
        background: '#fff',
        transition: 'border-color 0.2s ease',
      }}>
        <legend style={{
          padding: '0 4px',
          fontSize: 12,
          color: error ? '#dc2626' : '#52525b',
          fontWeight: 500,
          lineHeight: 1,
          marginLeft: -2,
        }}>
          {label}{required && '*'}
        </legend>
        <div style={{ display: 'flex', alignItems: 'center', height: 34, position: 'relative' }}>
          <input
            type="date"
            value={value}
            onChange={onChange}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: 15,
              color: value ? '#0f172a' : '#52525b',
              background: 'transparent',
              fontFamily: 'inherit',
              cursor: 'pointer',
              paddingRight: 24
            }}
          />
          <div style={{ position: 'absolute', right: 4, pointerEvents: 'none', color: '#0f172a', display: 'flex' }}>
            <Calendar size={18} />
          </div>
        </div>
      </fieldset>
      {error && (
        <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4, fontWeight: 500 }}>
          {error}
        </div>
      )}
    </div>
  )
}

export default function TravelerDetails() {
  const { id } = useParams() // This is the booking_id
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  
  const [booking, setBooking] = useState(location.state?.booking || null)
  const [loading, setLoading] = useState(!booking)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  // Validation errors state per guest
  const [fieldErrors, setFieldErrors] = useState({})

  // If no booking in state, fetch it
  useEffect(() => {
    if (!booking && id) {
      setLoading(true)
      getBooking(id)
        .then(b => {
          setBooking(b)
          setLoading(false)
        })
        .catch(err => {
          setError(err.message || 'Booking not found')
          setLoading(false)
        })
    }
  }, [id, booking])

  // Form fields - initialize with user data if available
  const [guests, setGuests] = useState([])

  // Initialize guest fields based on adult count
  useEffect(() => {
    if (booking && guests.length === 0) {
      const guestCount = booking.adult_count || 1
      const existing = booking.guests || []

      const initialGuests = Array.from({ length: guestCount }, (_, i) => {
        const ex = existing[i] || {}
        const nameParts = ex.name ? ex.name.trim().split(' ') : (i === 0 && user?.full_name ? user.full_name.trim().split(' ') : [])
        const phoneRaw = ex.phone || (i === 0 && user?.phone ? user.phone : '')
        
        let cc = ex.country_code || '+91'
        let ph = phoneRaw
        if (phoneRaw.startsWith('+')) {
          const spaceIdx = phoneRaw.indexOf(' ')
          if (spaceIdx > 0) {
            cc = phoneRaw.substring(0, spaceIdx)
            ph = phoneRaw.substring(spaceIdx + 1)
          }
        }

        return {
          first_name: ex.first_name || nameParts[0] || '',
          last_name: ex.last_name || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''),
          country_code: cc,
          phone: ph,
          email: ex.email || (i === 0 && user?.email ? user.email : ''),
          nationality: ex.nationality || 'India',
          state: ex.state || '',
          gender: ex.gender || '',
          date_of_birth: ex.date_of_birth || ''
        }
      })
      setGuests(initialGuests)
    }
  }, [booking, user, guests.length])

  const updateGuest = (index, field, value) => {
    setGuests(prev => prev.map((g, i) => 
      i === index ? { ...g, [field]: value } : g
    ))
    // Clear error for field if set
    if (fieldErrors[index]?.[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [index]: {
          ...(prev[index] || {}),
          [field]: null
        }
      }))
    }
  }

  const validate = () => {
    const newErrors = {}
    let hasError = false

    guests.forEach((g, idx) => {
      const errs = {}
      if (!g.first_name || !g.first_name.trim()) {
        errs.first_name = 'First Name is required'
        hasError = true
      }
      if (!g.last_name || !g.last_name.trim()) {
        errs.last_name = 'Last Name is required'
        hasError = true
      }
      if (!g.phone || !g.phone.trim()) {
        errs.phone = 'Mobile No. is required'
        hasError = true
      }
      if (!g.email || !g.email.trim()) {
        errs.email = 'Email ID is required'
        hasError = true
      } else if (!/\S+@\S+\.\S+/.test(g.email)) {
        errs.email = 'Invalid Email ID'
        hasError = true
      }
      if (!g.gender) {
        errs.gender = 'Gender is required'
        hasError = true
      }
      if (!g.date_of_birth) {
        errs.date_of_birth = 'Date of birth is required'
        hasError = true
      }

      if (Object.keys(errs).length > 0) {
        newErrors[idx] = errs
      }
    })

    setFieldErrors(newErrors)
    return !hasError
  }

  const handleContinue = async () => {
    if (!validate()) {
      return
    }

    setSaving(true)
    try {
      // Save guests to booking via API
      const apiGuests = guests.map(g => ({
        first_name: g.first_name.trim(),
        last_name: g.last_name.trim(),
        name: `${g.first_name.trim()} ${g.last_name.trim()}`.trim(),
        gender: g.gender,
        date_of_birth: g.date_of_birth || null,
        country_code: g.country_code,
        phone: `${g.country_code} ${g.phone}`.trim(),
        email: g.email.trim(),
        nationality: g.nationality || 'India',
        state: g.state || ''
      }))

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/bookings/${booking.booking_id}/guests`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        credentials: 'include',
        body: JSON.stringify({ guests: apiGuests })
      })

      if (!response.ok) {
        throw new Error('Failed to save guest details')
      }

      const updatedBooking = await response.json()
      
      // Navigate to review page
      navigate(`/reserve/${booking.booking_id}/review`, { 
        state: { booking: updatedBooking } 
      })
    } catch (err) {
      alert(err.message || 'Failed to save guest details')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="site-wrap">
        <Navbar />
        <main className="page-main" style={{ background: 'var(--bg-page)' }}>
          <div className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>Loading booking details...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="site-wrap">
        <Navbar />
        <main className="page-main" style={{ background: 'var(--bg-page)' }}>
          <div className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
            <p style={{ marginBottom: 16, color: 'var(--text-muted)' }}>{error || 'Booking not found'}</p>
            <button className="btn btn-primary" onClick={() => navigate('/explore')}>Browse packages</button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="site-wrap">
      <Navbar />
      <main className="page-main" style={{ background: 'var(--bg-page)' }}>
        <div className="container" style={{ padding: '28px 24px' }}>

          {/* Back */}
          <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, background: 'none', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={15} /> reserve your spot — {booking.packageTitle}
          </button>

          <div className="page-card">
            <Stepper current={1} />

            <div className="sidebar-layout-right">
              {/* ── Form ── */}
              <div>
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Traveler Details</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    Please provide details for all {booking.adult_count} traveler{booking.adult_count !== 1 ? 's' : ''}
                  </p>
                </div>

                {guests.map((guest, i) => {
                  const errs = fieldErrors[i] || {}
                  return (
                    <div key={i} style={{ marginBottom: 24, padding: 20, background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--primary)' }}>
                        Traveler {i + 1} {i === 0 && '(Lead)'}
                      </div>

                      {/* Grid 2 Columns */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                        <OutlinedInput
                          label="First Name"
                          required
                          value={guest.first_name}
                          onChange={e => updateGuest(i, 'first_name', e.target.value)}
                          placeholder=""
                          error={errs.first_name}
                        />

                        <OutlinedInput
                          label="Last Name"
                          required
                          value={guest.last_name}
                          onChange={e => updateGuest(i, 'last_name', e.target.value)}
                          placeholder=""
                          error={errs.last_name}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                        <OutlinedMobile
                          label="Mobile No."
                          required
                          countryCode={guest.country_code}
                          setCountryCode={val => updateGuest(i, 'country_code', val)}
                          phone={guest.phone}
                          setPhone={val => updateGuest(i, 'phone', val)}
                          error={errs.phone}
                        />

                        <OutlinedInput
                          label="Email ID"
                          required
                          type="email"
                          value={guest.email}
                          onChange={e => updateGuest(i, 'email', e.target.value)}
                          placeholder=""
                          error={errs.email}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                        <OutlinedSelect
                          label="Nationality"
                          value={guest.nationality}
                          onChange={e => updateGuest(i, 'nationality', e.target.value)}
                          options={Nationalities}
                          placeholder="Select Nationality"
                          error={errs.nationality}
                        />

                        <OutlinedSelect
                          label="State"
                          value={guest.state}
                          onChange={e => updateGuest(i, 'state', e.target.value)}
                          options={IndianStates}
                          placeholder="State"
                          error={errs.state}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <OutlinedSelect
                          label="Gender"
                          required
                          value={guest.gender}
                          onChange={e => updateGuest(i, 'gender', e.target.value)}
                          options={[
                            { label: 'Male', value: 'Male' },
                            { label: 'Female', value: 'Female' },
                            { label: 'Other', value: 'Other' }
                          ]}
                          placeholder="Gender"
                          error={errs.gender}
                        />

                        <OutlinedDateOfBirth
                          label="Date of birth"
                          required
                          value={guest.date_of_birth}
                          onChange={e => updateGuest(i, 'date_of_birth', e.target.value)}
                          error={errs.date_of_birth}
                        />
                      </div>
                    </div>
                  )
                })}

                {/* Note */}
                <div style={{ marginTop: 16, padding: '12px 14px', border: '1px solid var(--border-light)', borderRadius: 8, background: '#fffbf0', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  <strong>Note:</strong> Please ensure all details are accurate. These details will be used for booking confirmation.
                </div>
              </div>

              {/* ── Order summary ── */}
              <div>
                <div className="page-card" style={{ border: '1.5px solid var(--border)' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Booking Summary</div>
                  
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{booking.packageTitle}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
                    {booking.destination}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                    Travel Date: {booking.dateRange || booking.dates}
                  </div>
                  
                  <hr className="divider" />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Travelers</span>
                    <span>{booking.guestLabel || `${booking.adult_count} Adult(s)`}</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Base Cost</span>
                    <span style={{ fontWeight: 600 }}>₹{booking.baseCost?.toLocaleString()}</span>
                  </div>
                  
                  {booking.taxes > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                      <span style={{ color: 'var(--text-muted)' }}>GST (5%)</span>
                      <span>₹{booking.taxes?.toLocaleString()}</span>
                    </div>
                  )}
                  
                  <hr className="divider" />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800, marginBottom: 20 }}>
                    <span>Total Amount</span>
                    <span style={{ color: 'var(--primary)' }}>₹{booking.totalCost?.toLocaleString()}</span>
                  </div>
                  
                  <button
                    className="btn btn-primary btn-full"
                    onClick={handleContinue}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Continue to Review →'}
                  </button>

                  <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
                    Your booking is not confirmed yet
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
