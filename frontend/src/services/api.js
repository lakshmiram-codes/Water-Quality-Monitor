import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || '/api' })

// Attach the access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ww_access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On a 401, try refreshing the token once, then retry the original request
let refreshPromise = null

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retried) {
      original._retried = true
      const refreshToken = localStorage.getItem('ww_refresh_token')
      if (!refreshToken) return Promise.reject(error)

      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${api.defaults.baseURL}/auth/refresh`, { refresh_token: refreshToken })
            .finally(() => { refreshPromise = null })
        }
        const { data } = await refreshPromise
        localStorage.setItem('ww_access_token', data.access_token)
        localStorage.setItem('ww_refresh_token', data.refresh_token)
        original.headers.Authorization = `Bearer ${data.access_token}`
        return api(original)
      } catch (refreshError) {
        localStorage.removeItem('ww_access_token')
        localStorage.removeItem('ww_refresh_token')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)

export default api
