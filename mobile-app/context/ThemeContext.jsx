import React, { createContext, useContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const ThemeContext = createContext()
export const useTheme = () => useContext(ThemeContext)

export const DARK = {
  bg: '#0f0f1a', card: '#1a1a2e', border: 'rgba(255,255,255,0.1)',
  text: '#ffffff', textSub: '#a0a0b8', textMuted: '#6b6b8a',
  accent: '#6c63ff', danger: '#ff6584', success: '#43e97b',
}

export const LIGHT = {
  bg: '#f0f2f5', card: '#ffffff', border: 'rgba(0,0,0,0.08)',
  text: '#1a1a2e', textSub: '#4a4a6a', textMuted: '#8888aa',
  accent: '#6c63ff', danger: '#ff6584', success: '#43e97b',
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    AsyncStorage.getItem('mfx_theme').then(t => { if (t) setTheme(t) })
  }, [])

  const toggleTheme = async () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    await AsyncStorage.setItem('mfx_theme', next)
  }

  const colors = theme === 'dark' ? DARK : LIGHT

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  )
}
