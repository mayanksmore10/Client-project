import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function BackHeader({ title, onBack, right }) {
  const navigate = useNavigate()
  const handleBack = onBack || (() => navigate(-1))

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '14px 16px',
      background: '#fff',
      borderBottom: '1px solid #f0f0f0',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <button
        onClick={handleBack}
        style={{
          width: 36, height: 36, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#f5f5f5',
          border: 'none', cursor: 'pointer', flexShrink: 0,
        }}
      >
        <ArrowLeft size={18} color="var(--text-primary)" />
      </button>
      <h1 style={{ fontSize: 18, fontWeight: 700, flex: 1, color: 'var(--text-primary)' }}>
        {title}
      </h1>
      {right && <div>{right}</div>}
    </div>
  )
}
