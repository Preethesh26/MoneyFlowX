import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import AppNavigator from './navigation/AppNavigator'

function Root() {
  const { theme } = useTheme()
  return (
    <SafeAreaProvider>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <AppNavigator />
    </SafeAreaProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Root />
      </ThemeProvider>
    </AuthProvider>
  )
}
