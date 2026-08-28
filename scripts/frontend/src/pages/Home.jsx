import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Star, Sparkles, ShieldCheck, Award, Clock } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { categories } from '../data/mockData'
import { getFeaturedPackages, getDestinations, getStats, searchPackages } from '../services/api'



function resolveDestImage(name) {
  const text = (name || '').toLowerCase()
  if (text.includes('amritsar')) return '/images/amritsar_golden_temple.jpg'
  if (text.includes('puri') || text.includes('konark') || text.includes('bhubaneswar')) return '/images/konark_sun_temple.jpg'
  if (text.includes('bhuj') || text.includes('rann') || text.includes('kutch')) return '/images/rann_of_kutch_desert.jpg'
  if (text.includes('darjeeling') || text.includes('gangtok')) return '/images/darjeeling_tea_gardens.jpg'
  if (text.includes('delhi') || text.includes('agra') || text.includes('jaipur')) return '/images/Golden Triangle Classic - Taj Mahal Sunrise.png'
  if (text.includes('goa')) return '/images/goa_baga_sunset.jpg'
  if (text.includes('kerala') || text.includes('munnar') || text.includes('alleppey')) return '/images/kerala_houseboat_sunset.jpg'
  if (text.includes('ladakh') || text.includes('leh') || text.includes('pangong')) return '/images/pangong_lake_ladakh.jpg'
  if (text.includes('mysore') || text.includes('coorg')) return '/images/mysore_palace_illuminated.jpg'
  if (text.includes('lonavala') || text.includes('mumbai')) return '/images/lonavala_monsoon_waterfall.jpg'
  if (text.includes('ooty') || text.includes('coonoor')) return '/images/ooty_nilgiri_toy_train.jpg'
  if (text.includes('shillong') || text.includes('cherrapunji') || text.includes('northeast')) return '/images/northeast_living_root_bridge.jpg'
  if (text.includes('rishikesh') || text.includes('haridwar')) return '/images/rishikesh_laxman_jhula.jpg'
  if (text.includes('spiti') || text.includes('kaza')) return '/images/spiti_valley_chandratal.jpg'
  if (text.includes('sundarbans')) return '/images/sundarbans_wildlife_safari.jpg'
  if (text.includes('shimla') || text.includes('manali')) return '/images/solang_valley_manali.jpg'
  if (text.includes('andaman')) return '/images/tropical_white_sand_beach.jpg'
  return '/images/jodhpur_mehrangarh_fort.jpg'
}



// Skeleton card for loading state
function SkeletonCard() {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ width: '100%', height: 200, background: '#f0f0f0' }} />
      <div style={{ padding: '14px 16px' }}>
        <div style={{ height: 12, background: '#f0f0f0', borderRadius: 4, marginBottom: 8, width: '60%' }} />
        <div style={{ height: 16, background: '#f0f0f0', borderRadius: 4, marginBottom: 8 }} />
        <div style={{ height: 12, background: '#f0f0f0', borderRadius: 4, width: '40%' }} />
      </div>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('Family')

  const [packages, setPackages] = useState([])
  const [destinations, setDestinations] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      getDestinations(),
      getStats(),
    ]).then(([destRes, statsRes]) => {
      if (destRes.status === 'fulfilled') setDestinations(destRes.value.slice(0, 5))
      if (statsRes.status === 'fulfilled') setStats(statsRes.value)
    })
  }, [])

  useEffect(() => {
    setLoading(true)
    searchPackages({ traveler_type: activeCategory.toLowerCase(), page_size: 6 })
      .then(res => {
        if (res.packages && res.packages.length > 0) {
          setPackages(res.packages)
        } else {
          getFeaturedPackages(6).then(setPackages)
        }
      })
      .catch(() => {
        getFeaturedPackages(6).then(setPackages)
      })
      .finally(() => setLoading(false))
  }, [activeCategory])


  const STATS = stats
    ? [
        { value: stats.total_guests > 0 ? `${(stats.total_guests / 1000).toFixed(0)}k+` : '9.8L+', label: 'guests' },
        { value: stats.tours_completed > 0 ? `${stats.tours_completed}+` : '77k+', label: 'tours completed' },
        { value: '15+', label: 'years' },
        { value: '325+', label: 'tour experts' },
      ]
    : [
        { value: '9.8L+', label: 'guests' },
        { value: '77k+',  label: 'tours completed' },
        { value: '15+',   label: 'years' },
        { value: '325+',  label: 'tour experts' },
      ]

  return (
    <div className="site-wrap">
      <Navbar />
      <main className="page-main">

        {/* ── Hero ── */}
        <section style={{
          position: 'relative',
          padding: '84px 0 76px',
          overflow: 'hidden',
          backgroundImage: 'linear-gradient(to right, rgba(13, 61, 40, 0.88) 0%, rgba(13, 61, 40, 0.65) 55%, rgba(0, 0, 0, 0.35) 100%), url(/images/hero_banner.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>

            <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 14 }}>
              western ghats imagery
            </p>
            <h1 style={{ fontSize: 'clamp(28px,5vw,52px)', fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: 10, maxWidth: 640 }}>
              Discover the soul of<br />the Sahyadri mountains.
            </h1>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', marginBottom: 40, maxWidth: 500 }}>
              Handcrafted tours through Kerala, Goa, Karnataka and beyond — planned with care, explored with joy.
            </p>

          </div>
        </section>

        {/* ── Categories ── */}
        <section className="section-sm" style={{ background: '#fff', borderBottom: '1px solid var(--border-light)' }}>
          <div className="container">
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat)
                    navigate('/explore', { state: { travelerType: cat } })
                  }}
                  className={`chip${activeCategory === cat ? ' active' : ''}`}
                >
                  {cat.toLowerCase()}
                </button>
              ))}
            </div>

          </div>
        </section>

        {/* ── AI Banner ── */}
        <section className="section-sm">
          <div className="container">
            <div
              onClick={() => navigate('/assistant')}
              style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, #124d35 100%)',
                borderRadius: 'var(--radius-lg)',
                padding: '22px 30px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer',
                flexWrap: 'wrap', gap: 16,
                boxShadow: '0 4px 20px rgba(26,107,74,0.2)',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sparkles size={22} color="#fff" />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 2 }}>
                    Plan Your Dream Trip with AI Assistant
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
                    Get a personalized itinerary tailored to your dates, budget & group size in seconds
                  </div>
                </div>
              </div>
              <div style={{ background: '#fff', color: 'var(--primary)', fontWeight: 700, fontSize: 13, padding: '10px 20px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 6 }}>
                Try AI Planner <ArrowRight size={14} />
              </div>
            </div>
          </div>
        </section>

        {/* ── Browse by destination ── */}
        <section className="section">
          <div className="container">
            <h2 className="section-title">Browse Top Destinations</h2>
            <div className="grid-4">
              {loading
                ? [1,2,3,4].map(i => (
                    <div key={i} className="card" style={{ overflow: 'hidden' }}>
                      <div style={{ height: 165, background: '#f0f0f0' }} />
                    </div>
                  ))
                : destinations.length > 0
                  ? destinations.slice(0, 4).map((name) => (
                      <div
                        key={name}
                        onClick={() => navigate('/explore')}
                        className="card"
                        style={{ cursor: 'pointer', overflow: 'hidden', transition: 'all 0.2s ease' }}
                      >
                        <div style={{ position: 'relative', overflow: 'hidden' }}>
                          <img
                            src={resolveDestImage(name)}
                            alt={name}
                            style={{ width: '100%', height: 165, objectFit: 'cover', display: 'block' }}
                            loading="lazy"
                          />
                          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 65%)' }} />
                          <span style={{ position: 'absolute', bottom: 14, left: 16, color: '#fff', fontSize: 16, fontWeight: 700, letterSpacing: '-0.2px', textTransform: 'capitalize' }}>
                            {name}
                          </span>
                        </div>
                      </div>
                    ))
                  : <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>No destinations available.</p>
              }
            </div>
          </div>
        </section>

        {/* ── Why Choose Us ── */}
        <section className="section" style={{ background: '#fff', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: 540, margin: '0 auto 36px' }}>
              <h2 className="section-title" style={{ fontSize: 26, marginBottom: 8 }}>Why Travel With Sahyadri</h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Experience seamless journeys backed by local expertise and 24/7 care.</p>
            </div>
            <div className="grid-4">
              {[
                { icon: ShieldCheck, title: '100% Verified Tours', desc: 'Handcrafted itineraries guided by certified local tour managers.' },
                { icon: Sparkles, title: 'AI Personalization', desc: 'Custom itineraries built around your exact preferences & dates.' },
                { icon: Clock, title: '24/7 On-Ground Care', desc: 'Dedicated tour support assisting you every step of your trip.' },
                { icon: Award, title: 'Best Price Guarantee', desc: 'Transparent, upfront pricing with zero hidden convenience fees.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} style={{
                  padding: '24px 20px', borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-page)', border: '1px solid var(--border-light)',
                  textAlign: 'left',
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <Icon size={22} />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ── Stats ── */}
        <section className="section-sm">
          <div className="container">
            <div className="grid-4">
              {STATS.map(s => (
                <div key={s.label} style={{
                  background: '#fff', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  padding: '20px 16px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)', marginBottom: 4 }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Featured tours ── */}
        <section className="section">
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 className="section-title" style={{ marginBottom: 0 }}>{activeCategory.toLowerCase()} tours</h2>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/explore', { state: { travelerType: activeCategory } })}>
                view all <ArrowRight size={13} />
              </button>

            </div>
            <div className="grid-3">
              {loading
                ? [1, 2, 3].map(i => <SkeletonCard key={i} />)
                : packages.length > 0
                  ? packages.map(pkg => (
                      <div
                        key={pkg.id}
                        className="card"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/package/${pkg.id}`)}
                      >
                        <div style={{ position: 'relative' }}>
                          <img src={pkg.image} alt={pkg.title} style={{ width: '100%', height: 200, objectFit: 'cover' }} loading="lazy" />
                          {pkg.tag && (
                            <span className="badge badge-red" style={{ position: 'absolute', top: 10, left: 10 }}>{pkg.tag}</span>
                          )}
                        </div>
                        <div style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                            <Star size={13} fill="#f5a623" color="#f5a623" />
                            <span style={{ fontSize: 13, fontWeight: 600 }}>{pkg.rating || '—'}</span>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>• {pkg.duration}</span>
                          </div>
                          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{pkg.title}</div>
                          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>From ₹{pkg.pricePerPerson.toLocaleString()} / person</div>
                        </div>
                      </div>
                    ))
                  : <p style={{ fontSize: 14, color: 'var(--text-muted)', gridColumn: '1/-1' }}>No featured packages available right now.</p>
              }
            </div>
          </div>
        </section>

        {/* ── Testimonial ── */}
        <section className="section-sm" style={{ background: '#fff' }}>
          <div className="container">
            <div style={{
              border: '1.5px dashed var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px 32px',
              background: '#fdfcfa',
              maxWidth: 680, margin: '0 auto',
              textAlign: 'center',
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 3, marginBottom: 12 }}>
                {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="#f5a623" color="#f5a623" />)}
              </div>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 14 }}>
                "Amazing trip, great tour manager — best travel experience we've ever had as a family. Highly recommend Sahyadri Travels!"
              </p>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>— Priya Sharma, Mumbai</div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}
