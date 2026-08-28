import { Check } from 'lucide-react'

const STEPS = ['Travelers', 'Review', 'Token Pay']

export default function Stepper({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', padding: '20px 16px 4px' }}>
      {STEPS.map((label, i) => {
        const n = i + 1
        const done = n < current
        const active = n === current

        return (
          <div key={label} style={{ display: 'flex', alignItems: 'flex-start', flex: i < STEPS.length - 1 ? 1 : 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done || active ? 'var(--primary)' : '#fff',
                border: `2px solid ${done || active ? 'var(--primary)' : '#ccc'}`,
                color: done || active ? '#fff' : '#aaa',
                fontSize: 13, fontWeight: 700,
              }}>
                {done ? <Check size={14} strokeWidth={3} /> : n}
              </div>
              <span style={{
                fontSize: 10,
                fontWeight: active ? 600 : 400,
                color: active ? 'var(--primary)' : '#aaa',
                whiteSpace: 'nowrap',
              }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1,
                height: 2,
                background: done ? 'var(--primary)' : '#e0e0e0',
                marginTop: 15,
                marginLeft: -2,
                marginRight: -2,
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}
