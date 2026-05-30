export default {
  expo: {
    name: 'MoneyFlowX',
    slug: 'moneyflowx',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'automatic',
    android: {
      package: 'com.moneyflowx.app',
      adaptiveIcon: {
        backgroundColor: '#6c63ff',
      },
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.moneyflowx.app',
    },
    plugins: ['expo-secure-store'],
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://moneyflowx.onrender.com',
      eas: {
        projectId: '935b5785-2c02-4912-9f70-fb5785104faa',
      },
    },
  },
}
