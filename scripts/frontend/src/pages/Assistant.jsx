import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const INITIAL_MESSAGES = [
  { role: 'ai', text: 'hi! where would you like to go, and with how many people?' },
]

const QUICK_REPLIES = [
  'kerala, family of 4, first week of dec, budget 40000',
  'honeymoon trip to coorg under 20000 per person',
]

export default function Assistant() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [hasDraft, setHasDraft] = useState(false)
  const [lastQuery, setLastQuery] = useState('')

  const send = (text) => {
    if (!text.trim()) return
    const newMessages = [...messages, { role: 'user', text }]
    setMessages(newMessages)
    setInput('')
    setLastQuery(text)

    // Simulate AI response
    setTimeout(() => {
      setMessages(m => [...m, { role: 'ai', text: "Got it! I've crafted recommendations based on your preferences. Click 'Find matching tours' to see them." }])
      setHasDraft(true)
    }, 800)
  }

  const handleReserve = () => {
    navigate('/ai-results', { state: { query: lastQuery } })
  }

  return (
    <div className="site-wrap">
      <Navbar />
      <main className="page-main" style={{ background: 'var(--bg-page)' }}>
        <div className="container" style={{ padding: '28px 24px' }}>

          <div style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
            ✦ ai assistant — plan my trip
          </div>

          <div className="page-card" style={{ padding: 0 }}>
            <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border-light)', fontSize: 15, fontWeight: 700 }}>
              Sahyadri Trip Planner
            </div>

            {/* Two panel layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 440 }}>

              {/* ── Chat panel ── */}
              <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border-light)' }}>
                <div style={{ padding: '14px 18px 6px', fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  conversation
                </div>

                {/* Messages */}
                <div style={{ flex: 1, padding: '8px 18px 12px', display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', maxHeight: 320 }}>
                  {messages.map((msg, i) => (
                    <div key={i} style={{
                      padding: '9px 13px',
                      borderRadius: 8,
                      fontSize: 13,
                      lineHeight: 1.55,
                      border: '1px solid var(--border-light)',
                      background: msg.role === 'user' ? '#f0fbf5' : '#fff',
                      color: 'var(--text-primary)',
                      alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '90%',
                    }}>
                      {msg.text}
                    </div>
                  ))}

                  {/* Quick reply suggestions */}
                  {messages.length === 1 && QUICK_REPLIES.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => send(r)}
                      style={{
                        padding: '9px 13px', borderRadius: 8,
                        fontSize: 13, border: '1px solid var(--border)',
                        background: '#fff', cursor: 'pointer', textAlign: 'left',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                {/* Input */}
                <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', border: '1.5px solid var(--border)', borderRadius: 999, padding: '7px 14px', background: '#fff' }}>
                    <input
                      type="text"
                      placeholder="type your message..."
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && send(input)}
                      style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, background: 'transparent', color: 'var(--text-primary)' }}
                    />
                    <button onClick={() => send(input)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 2 }}>
                      <Send size={15} color="var(--primary)" />
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Draft itinerary panel ── */}
              <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>
                  draft itinerary
                </div>

                {hasDraft ? (
                  <>
                    <div style={{ flex: 1, marginBottom: 16 }}>
                      <div style={{ padding: '12px 0', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        Based on your request: <b style={{ color: 'var(--text-primary)' }}>"{lastQuery}"</b>
                      </div>
                      <div style={{ padding: '10px 0', borderBottom: '1px solid var(--border-light)', fontSize: 14, color: 'var(--text-muted)' }}>
                        Our AI will find the best matching packages for you.
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <button
                        className="btn btn-primary btn-full"
                        onClick={handleReserve}
                      >
                        find matching tours →
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                      <div style={{ fontSize: 28, marginBottom: 10 }}>✦</div>
                      Your draft itinerary will appear here after the conversation.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Responsive override */}
          <style>{`
            @media (max-width: 640px) {
              .ai-panel-grid { grid-template-columns: 1fr !important; }
            }
          `}</style>
        </div>
      </main>
      <Footer />
    </div>
  )
}
