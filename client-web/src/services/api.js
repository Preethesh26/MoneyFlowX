import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
})

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mfx_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401, clear token and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mfx_token')
      localStorage.removeItem('mfx_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
