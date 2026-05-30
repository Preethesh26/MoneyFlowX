export default {
  expo: {
    sdkVersion: '54.0.0',
    name: 'MoneyFlowX',
    slug: 'moneyflowx',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    splash: {
      resizeMode: 'contain',
      backgroundColor: '#0f0f1a',
    },
    ios: { supportsTablet: true },
    android: { 
      adaptiveIcon: { backgroundColor: '#0f0f1a' },
      package: 'com.moneyflowx.app'
    },
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000',
      eas: {
        projectId: '935b5785-2c02-4912-9f70-fb5785104faa'
      }
    },
  },
}
