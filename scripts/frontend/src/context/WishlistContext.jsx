import { createContext, useContext, useState, useEffect } from 'react'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('sahyadri_wishlist')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('sahyadri_wishlist', JSON.stringify(wishlist))
    } catch (e) {
      console.error('Failed to save wishlist to localStorage', e)
    }
  }, [wishlist])

  const isWishlisted = (pkgId) => {
    if (!pkgId) return false
    return wishlist.some(item => (item.package_id || item.id) === pkgId)
  }

  const toggleWishlist = (pkg) => {
    if (!pkg) return
    const pkgId = pkg.package_id || pkg.id
    if (!pkgId) return

    setWishlist(prev => {
      const exists = prev.some(item => (item.package_id || item.id) === pkgId)
      if (exists) {
        return prev.filter(item => (item.package_id || item.id) !== pkgId)
      } else {
        return [...prev, pkg]
      }
    })
  }

  const clearWishlist = () => {
    setWishlist([])
  }

  return (
    <WishlistContext.Provider value={{ wishlist, isWishlisted, toggleWishlist, clearWishlist, wishlistCount: wishlist.length }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
