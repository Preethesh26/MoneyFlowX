import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const u = localStorage.getItem('mfx_user')
    return u ? JSON.parse(u) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('mfx_token'))
  const [loading, setLoading] = useState(true)

  // Validate stored token on mount
  useEffect(() => {
    const validate = async () => {
      if (token) {
        try {
          const { data } = await api.get('/api/auth/me')
          setCurrentUser(data)
          localStorage.setItem('mfx_user', JSON.stringify(data))
        } catch {
          setToken(null)
          setCurrentUser(null)
          localStorage.removeItem('mfx_token')
          localStorage.removeItem('mfx_user')
        }
      }
      setLoading(false)
    }
    validate()
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password })
    localStorage.setItem('mfx_token', data.token)
    localStorage.setItem('mfx_user', JSON.stringify(data.user))
    setToken(data.token)
    setCurrentUser(data.user)
    return data
  }

  const register = async (name, email, password) => {
    const { data } = await api.post('/api/auth/register', { name, email, password })
    return data
  }

  const logout = () => {
    localStorage.removeItem('mfx_token')
    localStorage.removeItem('mfx_user')
    setToken(null)
    setCurrentUser(null)
  }

  const updateUser = (user) => {
    setCurrentUser(user)
    localStorage.setItem('mfx_user', JSON.stringify(user))
  }

  return (
    <AuthContext.Provider value={{ currentUser, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}
