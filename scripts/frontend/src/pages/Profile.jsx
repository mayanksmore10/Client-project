import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, CreditCard, Headphones, LogOut, ChevronRight, Camera, Image as ImageIcon, User } from 'lucide-react'

import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'

const menuItems = [
  { Icon: User,       label: 'My Account',     path: '/bookings' },
  { Icon: Heart,      label: 'Wishlists',       path: '/wishlist', isWishlist: true },
  { Icon: CreditCard, label: 'Payment Methods', path: null },
  { Icon: Headphones, label: 'Help & Support',  path: '/help' },
]




export default function Profile() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { wishlistCount } = useWishlist()
  const fileInputRef = useRef(null)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const displayName = user?.full_name || 'Guest'
  const displaySub  = user?.email || user?.phone || ''

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0d3d28&color=ffffff&size=128&bold=true`

  const [customPhoto, setCustomPhoto] = useState(() => {
    return localStorage.getItem('user_custom_avatar') || user?.profile_photo_url || null
  })

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target.result
      setCustomPhoto(dataUrl)
      localStorage.setItem('user_custom_avatar', dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleUseBrandLogo = () => {
    const logoUrl = '/images/logo.jpg'
    setCustomPhoto(logoUrl)
    localStorage.setItem('user_custom_avatar', logoUrl)
  }

  const avatarSrc = customPhoto || defaultAvatar

  return (
    <div className="site-wrap">
      <Navbar />
      <main className="page-main" style={{ background: 'var(--bg-page)' }}>
        <div className="container" style={{ padding: '40px 24px', maxWidth: 560 }}>

          {/* Avatar + name */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />

            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
              <img
                src={avatarSrc}
                alt={displayName}
                style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', background: '#0d3d28', display: 'block', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Upload Photo / Logo"
                style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--primary)', border: '2px solid #fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Camera size={13} color="#fff" />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-outline btn-sm"
                style={{ fontSize: 12, padding: '4px 10px', gap: 5 }}
              >
                <Camera size={12} /> Upload Photo
              </button>
              <button
                onClick={handleUseBrandLogo}
                className="btn btn-outline btn-sm"
                style={{ fontSize: 12, padding: '4px 10px', gap: 5 }}
              >
                <ImageIcon size={12} /> Use Logo
              </button>
            </div>

            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{displayName}</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{displaySub}</p>
          </div>


          {/* Menu */}
          <div className="page-card" style={{ padding: 0, marginBottom: 20 }}>
            {menuItems.map(({ Icon, label, path, right, isWishlist }, i) => (
              <button
                key={label}
                onClick={() => path && navigate(path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '15px 18px', width: '100%', textAlign: 'left',
                  background: '#fff', border: 'none', cursor: 'pointer',
                  borderBottom: i < menuItems.length - 1 ? '1px solid var(--border-light)' : 'none',
                }}
              >
                <Icon size={17} color="var(--primary)" />
                <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{label}</span>
                {isWishlist && wishlistCount > 0 && (
                  <span style={{
                    background: '#e74c3c', color: '#fff', fontSize: 11, fontWeight: 700,
                    borderRadius: 999, padding: '2px 8px', marginRight: 4
                  }}>
                    {wishlistCount}
                  </span>
                )}
                {right && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{right}</span>}
                <ChevronRight size={15} color="var(--text-muted)" />
              </button>
            ))}
          </div>

          {/* Standalone Log Out Button */}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '14px 20px', width: '100%',
              background: '#fff', border: '1px solid #fecaca',
              borderRadius: 12, cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <LogOut size={18} color="#dc2626" />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#dc2626' }}>Log Out</span>
          </button>

        </div>
      </main>
      <Footer />
    </div>
  )
}
