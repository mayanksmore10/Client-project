import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Star, SlidersHorizontal } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { searchPackages } from '../services/api'

const SORT_OPTIONS = ['Recommended', 'Price: Low to High', 'Price: High to Low', 'Top Rated']

function SkeletonCard() {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ width: '100%', height: 190, background: '#f0f0f0' }} />
      <div style={{ padding: '14px 16px' }}>
        <div style={{ height: 16, background: '#f0f0f0', borderRadius: 4, marginBottom: 8 }} />
        <div style={{ height: 12, background: '#f0f0f0', borderRadius: 4, marginBottom: 8, width: '70%' }} />
        <div style={{ height: 12, background: '#f0f0f0', borderRadius: 4, width: '40%' }} />
      </div>
    </div>
  )
}

export default function Explore() {
  const navigate = useNavigate()
  const location = useLocation()
  const [destination, setDestination] = useState(location.state?.destination || '')
  const [budget, setBudget] = useState(location.state?.budget || '')
  const [days, setDays] = useState(location.state?.days || '')
  const [travelerType, setTravelerType] = useState(location.state?.travelerType || '')
  const [sort, setSort] = useState('Recommended')

  const [packages, setPackages] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Applied filters (only update on "Apply filters" click)
  const [applied, setApplied] = useState({
    destination: location.state?.destination || '',
    budget: location.state?.budget || '',
    days: location.state?.days || '',
    travelerType: location.state?.travelerType || '',
  })

  const fetchPackages = useCallback(async (filters) => {
    setLoading(true)
    setError(null)
    try {
      let budget_min, budget_max
      if (filters.budget) {
        const parts = String(filters.budget).split(/[-–—to]/i).map(s => s.trim().replace(/[^\d]/g, '')).filter(Boolean)
        if (parts.length >= 2) {
          budget_min = Number(parts[0]) || undefined
          budget_max = Number(parts[1]) || undefined
        } else if (parts.length === 1) {
          budget_max = Number(parts[0]) || undefined
        }
      }

      const parsedDays = filters.days ? parseInt(String(filters.days).replace(/[^\d]/g, ''), 10) || undefined : undefined

      const result = await searchPackages({
        destination: filters.destination ? String(filters.destination).trim() : undefined,
        budget_min,
        budget_max,
        days: parsedDays,
        traveler_type: filters.travelerType ? String(filters.travelerType).trim() : undefined,
        page_size: 50,
      })

      let pkgs = result.packages || []

      // Client-side sort
      if (sort === 'Price: Low to High') pkgs = [...pkgs].sort((a, b) => a.pricePerPerson - b.pricePerPerson)
      else if (sort === 'Price: High to Low') pkgs = [...pkgs].sort((a, b) => b.pricePerPerson - a.pricePerPerson)

      setPackages(pkgs)
      setTotal(result.total || pkgs.length)
    } catch (err) {
      setError(err.message || 'Failed to load packages')
    } finally {
      setLoading(false)
    }
  }, [sort])


  // Load packages based on location state
  useEffect(() => {
    const f = {
      destination: location.state?.destination || '',
      budget: location.state?.budget || '',
      days: location.state?.days || '',
      travelerType: location.state?.travelerType || '',
    }
    setDestination(f.destination)
    setBudget(f.budget)
    setDays(f.days)
    setTravelerType(f.travelerType)
    setApplied(f)
    fetchPackages(f)
  }, [location.state, fetchPackages])


  // Re-sort without re-fetching
  useEffect(() => {
    if (packages.length === 0) return
    let pkgs = [...packages]
    if (sort === 'Price: Low to High') pkgs.sort((a, b) => a.pricePerPerson - b.pricePerPerson)
    else if (sort === 'Price: High to Low') pkgs.sort((a, b) => b.pricePerPerson - a.pricePerPerson)
    setPackages(pkgs)
  }, [sort]) // eslint-disable-line react-hooks/exhaustive-deps

  const applyFilters = () => {
    const f = { destination, budget, days, travelerType }
    setApplied(f)
    fetchPackages(f)
  }

  const clearFilters = () => {
    setDestination(''); setBudget(''); setDays(''); setTravelerType('')
    setApplied({})
    fetchPackages({})
  }

  return (
    <div className="site-wrap">
      <Navbar />
      <main className="page-main" style={{ background: 'var(--bg-page)' }}>
        <div className="container" style={{ padding: '28px 24px' }}>

          {/* Back + search bar */}
          <div style={{ marginBottom: 20 }}>
            <div className="page-card" style={{ padding: '14px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500 }}>
                  <ArrowLeft size={16} /> explore tours
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar layout */}
          <div className="sidebar-layout" style={{ alignItems: 'start' }}>

            {/* ── Sidebar filters ── */}
            <aside>
              <div className="page-card" style={{ padding: '20px' }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 18, color: 'var(--text-primary)' }}>filters</div>

                {[
                  { label: 'destination', val: destination, set: setDestination, placeholder: 'e.g. Kerala' },
                  { label: 'budget range', val: budget, set: setBudget, placeholder: 'e.g. 10000 – 30000' },
                  { label: 'duration (days)', val: days, set: setDays, placeholder: 'e.g. 5' },
                  { label: 'traveler type', val: travelerType, set: setTravelerType, placeholder: 'family, solo...' },
                ].map(({ label, val, set, placeholder }) => (
                  <div key={label} className="input-wrap" style={{ marginBottom: 14 }}>
                    <label className="input-label">{label}</label>
                    <input
                      className="input"
                      placeholder={placeholder}
                      value={val}
                      onChange={e => set(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && applyFilters()}
                    />
                  </div>
                ))}

                <button
                  className="btn btn-primary btn-full btn-sm"
                  style={{ marginTop: 6 }}
                  onClick={applyFilters}
                >
                  Apply filters
                </button>
                <button
                  className="btn btn-ghost btn-full btn-sm"
                  style={{ marginTop: 6, color: 'var(--text-muted)' }}
                  onClick={clearFilters}
                >
                  Clear all
                </button>
              </div>
            </aside>

            {/* ── Tour grid ── */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                  <b style={{ color: 'var(--text-primary)' }}>{loading ? '…' : total}</b> tours found
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>sort:</span>
                  <select
                    className="input"
                    style={{ width: 'auto', padding: '6px 12px', fontSize: 13 }}
                    value={sort}
                    onChange={e => setSort(e.target.value)}
                  >
                    {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>

              {/* Error state */}
              {error && (
                <div className="page-card" style={{ textAlign: 'center', padding: '40px 32px' }}>
                  <p style={{ fontSize: 14, color: '#e74c3c', marginBottom: 16 }}>⚠ {error}</p>
                  <button className="btn btn-outline" onClick={() => fetchPackages(applied)}>Retry</button>
                </div>
              )}

              {/* Loading skeleton */}
              {loading && !error && (
                <div className="grid-2">
                  {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
                </div>
              )}

              {/* Empty state */}
              {!loading && !error && packages.length === 0 && (
                <div className="page-card" style={{ textAlign: 'center', padding: '60px 32px' }}>
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>No tours match your filters</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
                    Try adjusting your filters or let our AI planner craft a custom itinerary.
                  </p>
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button className="btn btn-primary" onClick={() => navigate('/assistant')}>Ask AI planner</button>
                    <button className="btn btn-outline" onClick={clearFilters}>Clear filters</button>
                  </div>
                </div>
              )}

              {/* Results */}
              {!loading && !error && packages.length > 0 && (
                <div className="grid-2">
                  {packages.map(pkg => (
                    <div
                      key={pkg.id}
                      className="card"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/package/${pkg.id}`)}
                    >
                      <div style={{ position: 'relative' }}>
                        <img src={pkg.image} alt={pkg.title} style={{ width: '100%', height: 190, objectFit: 'cover', display: 'block' }} loading="lazy" />
                        {pkg.tag && (
                          <span className="badge badge-red" style={{ position: 'absolute', top: 10, left: 10 }}>{pkg.tag}</span>
                        )}
                      </div>
                      <div style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{pkg.title}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                          {pkg.duration} · from ₹{pkg.pricePerPerson.toLocaleString()}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Star size={13} fill="#f5a623" color="#f5a623" />
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{pkg.rating || '—'}</span>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {pkg.destination && `· ${pkg.destination}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
