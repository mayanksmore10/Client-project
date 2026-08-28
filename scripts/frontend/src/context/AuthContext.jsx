import { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin, register as apiRegister, logout as apiLogout, getMe } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount, restore user from localStorage and verify with backend
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const cachedUser = localStorage.getItem('auth_user')
    if (token && cachedUser) {
      try { setUser(JSON.parse(cachedUser)) } catch (_) { /* ignore */ }
    }

    if (token) {
      getMe()
        .then(u => {
          setUser(u)
          localStorage.setItem('auth_user', JSON.stringify(u))
        })
        .catch(() => {
          // token expired / invalid
          localStorage.removeItem('access_token')
          localStorage.removeItem('auth_user')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    await apiLogin(email, password)
    const u = await getMe()
    setUser(u)
    localStorage.setItem('auth_user', JSON.stringify(u))
    return u
  }

  const register = async (email, password, fullName) => {
    await apiRegister(email, password, fullName)
    // auto-login after register
    return login(email, password)
  }

  const logout = async () => {
    await apiLogout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
