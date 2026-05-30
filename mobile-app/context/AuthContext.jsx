import React, { createContext, useContext, useState, useEffect } from 'react'
import * as SecureStore from 'expo-secure-store'
import api from '../services/api'

const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('mfx_token')
        if (storedToken) {
          setToken(storedToken)
          const { data } = await api.get('/api/auth/me')
          setCurrentUser(data)
        }
      } catch {
        await SecureStore.deleteItemAsync('mfx_token')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password })
    await SecureStore.setItemAsync('mfx_token', data.token)
    setToken(data.token)
    setCurrentUser(data.user)
    return data
  }

  const register = async (name, email, password) => {
    const { data } = await api.post('/api/auth/register', { name, email, password })
    return data
  }

  const logout = async () => {
    await SecureStore.deleteItemAsync('mfx_token')
    setToken(null)
    setCurrentUser(null)
  }

  return (
    <AuthContext.Provider value={{ currentUser, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
