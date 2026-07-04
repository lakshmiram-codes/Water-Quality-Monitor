import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem('ww_access_token')
    if (!token) { setLoading(false); return }
    try {
      const { data } = await api.get('/users/me')
      setUser(data)
    } catch {
      localStorage.removeItem('ww_access_token')
      localStorage.removeItem('ww_refresh_token')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadMe() }, [loadMe])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('ww_access_token', data.access_token)
    localStorage.setItem('ww_refresh_token', data.refresh_token)
    await loadMe()
  }

  const register = async (payload) => {
    await api.post('/auth/register', payload)
    await login(payload.email, payload.password)
  }

  const logout = () => {
    localStorage.removeItem('ww_access_token')
    localStorage.removeItem('ww_refresh_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
