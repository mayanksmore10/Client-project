import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Star } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { recommendPackages } from '../services/api'

function SkeletonCard() {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ width: '100%', height: 190, background: '#f0f0f0' }} />
      <div style={{ padding: '14px 16px' }}>
        <div style={{ height: 12, background: '#f0f0f0', borderRadius: 4, marginBottom: 8, width: '50%' }} />
        <div style={{ height: 16, background: '#f0f0f0', borderRadius: 4, marginBottom: 8 }} />
        <div style={{ height: 12, background: '#f0f0f0', borderRadius: 4, width: '40%' }} />
      </div>
    </div>
  )
}

export default function AIResults() {
  const navigate = useNavigate()
  const location = useLocation()

  const query = location.state?.query || 'best packages'

  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    recommendPackages(query, 6)
      .then(recs => { setResults(recs); setLoading(false) })
      .catch(err => { setError(err.message || 'Failed to get recommendations'); setLoading(false) })
  }, [query])

  return (
    <div className="site-wrap">
      <Navbar />
      <main className="page-main" style={{ background: 'var(--bg-page)' }}>
        <div className="container" style={{ padding: '28px 24px' }}>

          <button onClick={() => navigate('/assistant')} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, background: 'none', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={15} /> back to planner
          </button>

          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Your AI-matched tours</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
            Based on: <em>"{query}"</em> — here are the best matching packages.
          </p>

          {/* Loading skeleton */}
          {loading && (
            <div className="grid-3">
              {[1,2,3].map(i => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="page-card" style={{ textAlign: 'center', padding: '60px 32px' }}>
              <p style={{ fontSize: 14, color: '#e74c3c', marginBottom: 16 }}>⚠ {error}</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={() => { setLoading(true); recommendPackages(query, 6).then(r => { setResults(r); setLoading(false) }).catch(e => { setError(e.message); setLoading(false) }) }}>
                  Retry
                </button>
                <button className="btn btn-outline" onClick={() => navigate('/explore')}>Browse all tours</button>
              </div>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && results.length === 0 && (
            <div className="page-card" style={{ textAlign: 'center', padding: '60px 32px' }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>No matches found</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
                Try a different query or browse all available tours.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={() => navigate('/assistant')}>Try again</button>
                <button className="btn btn-outline" onClick={() => navigate('/explore')}>Browse all</button>
              </div>
            </div>
          )}

          {/* Results */}
          {!loading && !error && results.length > 0 && (
            <div className="grid-3">
              {results.map(pkg => (
                <div
                  key={pkg.id}
                  className="card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/package/${pkg.package_id || pkg.id}`)}
                >
                  <div style={{ position: 'relative' }}>
                    <img src={pkg.image} alt={pkg.title} style={{ width: '100%', height: 190, objectFit: 'cover', display: 'block' }} loading="lazy" />
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                      <Star size={13} fill="#f5a623" color="#f5a623" />
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{pkg.rating || '—'}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>• {pkg.duration}</span>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{pkg.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>From ₹{(pkg.pricePerPerson || 0).toLocaleString()} / person</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
