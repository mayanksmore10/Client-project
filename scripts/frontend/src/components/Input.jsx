import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  icon: Icon,
  prefix,
  style: extra = {},
}) {
  const [showPw, setShowPw] = useState(false)
  const isPassword = type === 'password'

  return (
    <div style={{ width: '100%', ...extra }}>
      {label && (
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
          {label}
        </label>
      )}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        border: '1.5px solid var(--border)',
        borderRadius: 8,
        background: '#fff',
        padding: '0 12px',
        gap: 8,
      }}>
        {Icon && <Icon size={16} color="var(--text-muted)" />}
        {prefix && <span style={{ fontSize: 14, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{prefix}</span>}
        <input
          type={isPassword ? (showPw ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: 14,
            color: 'var(--text-primary)',
            padding: '12px 0',
            background: 'transparent',
          }}
        />
        {isPassword && (
          <button type="button" onClick={() => setShowPw(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            {showPw ? <EyeOff size={16} color="var(--text-muted)" /> : <Eye size={16} color="var(--text-muted)" />}
          </button>
        )}
      </div>
    </div>
  )
}
