export default function Button({
  children,
  variant = 'primary',
  fullWidth = false,
  size = 'md',
  onClick,
  type = 'button',
  disabled = false,
  style: extra = {},
}) {
  const sizes = {
    sm: { padding: '8px 18px', fontSize: 13 },
    md: { padding: '14px 28px', fontSize: 15 },
    lg: { padding: '16px 32px', fontSize: 16 },
  }

  const variants = {
    primary:         { background: 'var(--primary)',      color: '#fff',                border: '2px solid var(--primary)' },
    outline:         { background: 'transparent',         color: 'var(--text-primary)', border: '2px solid var(--border)' },
    'outline-green': { background: 'transparent',         color: 'var(--primary)',      border: '2px solid var(--primary)' },
    ghost:           { background: 'transparent',         color: 'var(--text-secondary)',border: '2px solid transparent' },
    light:           { background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '2px solid transparent' },
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 999,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'opacity 0.15s',
        fontFamily: 'var(--font)',
        width: fullWidth ? '100%' : 'auto',
        ...sizes[size],
        ...variants[variant],
        ...extra,
      }}
    >
      {children}
    </button>
  )
}
