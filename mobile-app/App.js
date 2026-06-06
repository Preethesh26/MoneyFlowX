import React, { useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import AppNavigator from './navigation/AppNavigator'
import SplashScreen from './screens/SplashScreen'

function Root() {
  const { theme } = useTheme()
  const [splashDone, setSplashDone] = useState(false)

  if (!splashDone) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#0f0f13" />
        <SplashScreen onFinish={() => setSplashDone(true)} />
      </SafeAreaProvider>
    )
  }

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
