import { Link, useLocation } from 'react-router-dom'
import { Home, Search, Bot, BookOpen, User } from 'lucide-react'

const navItems = [
  { label: 'Home',      Icon: Home,     path: '/home' },
  { label: 'Explore',   Icon: Search,   path: '/explore' },
  { label: 'Assistant', Icon: Bot,      path: '/assistant' },
  { label: 'Bookings',  Icon: BookOpen, path: '/bookings' },
  { label: 'Profile',   Icon: User,     path: '/profile' },
]

export default function BottomNavigation() {
  const { pathname } = useLocation()

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      height: 64,
      background: '#fff',
      borderTop: '1px solid #efefef',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 100,
      boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
    }}>
      {navItems.map(({ label, Icon, path }) => {
        const active = pathname === path || pathname.startsWith(path + '/')
        const isCenter = label === 'Assistant'

        return (
          <Link
            key={path}
            to={path}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              textDecoration: 'none',
              minWidth: 52,
              padding: '4px 0',
            }}
          >
            <div style={{
              width: isCenter ? 44 : 40,
              height: isCenter ? 40 : 34,
              borderRadius: isCenter ? 14 : 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: active
                ? (isCenter ? 'var(--primary)' : '#e8f5ee')
                : 'transparent',
            }}>
              <Icon
                size={20}
                color={active ? (isCenter ? '#fff' : 'var(--primary)') : '#999'}
                strokeWidth={active ? 2.5 : 2}
              />
            </div>
            <span style={{
              fontSize: 10,
              fontWeight: active ? 600 : 400,
              color: active ? 'var(--primary)' : '#999',
              lineHeight: 1,
            }}>
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
