import { Search } from 'lucide-react'

export default function SearchBar({ placeholder = 'Search...', value, onChange, onClick, readOnly }) {
  return (
    <div
      onClick={readOnly ? onClick : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: '#fff',
        border: '1.5px solid var(--border)',
        borderRadius: 999,
        padding: '10px 16px',
        cursor: readOnly ? 'pointer' : 'default',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      <Search size={18} color="var(--text-muted)" />
      {readOnly ? (
        <span style={{ fontSize: 14, color: 'var(--text-muted)', flex: 1 }}>{placeholder}</span>
      ) : (
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: 14,
            color: 'var(--text-primary)',
            background: 'transparent',
          }}
        />
      )}
    </div>
  )
}
