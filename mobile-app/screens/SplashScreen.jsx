import React, { useEffect, useRef } from 'react'
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native'

const { width } = Dimensions.get('window')

export default function SplashScreen({ onFinish }) {
  const logoScale = useRef(new Animated.Value(0.3)).current
  const logoOpacity = useRef(new Animated.Value(0)).current
  const textOpacity = useRef(new Animated.Value(0)).current
  const screenOpacity = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(800),
      Animated.timing(screenOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start(() => onFinish?.())
  }, [])

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <Animated.View style={[styles.logoWrap, { transform: [{ scale: logoScale }], opacity: logoOpacity }]}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>💸</Text>
        </View>
      </Animated.View>
      <Animated.View style={{ opacity: textOpacity, alignItems: 'center' }}>
        <Text style={styles.appName}>MoneyFlowX</Text>
        <Text style={styles.tagline}>Smart Finance, Simplified</Text>
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f13',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  logoWrap: { alignItems: 'center' },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 30,
    backgroundColor: '#1a1a2e',
    borderWidth: 2,
    borderColor: '#7c6bef',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7c6bef',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  logoEmoji: { fontSize: 52 },
  appName: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tagline: {
    color: '#555570',
    fontSize: 13,
    marginTop: 4,
  },
})
