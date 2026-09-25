import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
})

// REFRESHING THE ACCESS TOKEN
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status !== 401) {
      return Promise.reject(error)
    }

    if (originalRequest.url.includes('/auth/refresh')) {
      isRefreshing = false
      refreshSubscribers = []
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (originalRequest._retry) {
      return Promise.reject(error)
    }

    if (!isRefreshing) {
      isRefreshing = true
      originalRequest._retry = true

      try {
        await api.get('/api/v1/auth/refresh')   // изменено с post на get
        isRefreshing = false
        onRefreshed()
        return api(originalRequest)
      } catch (refreshError) {
        isRefreshing = false
        refreshSubscribers = []
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return new Promise((resolve) => {
      subscribeTokenRefresh(() => {
        originalRequest._retry = true
        resolve(api(originalRequest))
      })
    })
  }
)

export default api
