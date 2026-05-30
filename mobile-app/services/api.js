import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import Constants from 'expo-constants'

const BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:5000'

const api = axios.create({ baseURL: BASE_URL })

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('mfx_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401, clear stored token — AppNavigator will redirect to auth stack
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await SecureStore.deleteItemAsync('mfx_token')
    }
    return Promise.reject(err)
  }
)

export default api
