import axios from 'axios'

// Responsabilidad: cliente HTTP común. Renueva la sesión cuando el token
// caduca (401) y avisa a la app cuando la sesión termina o no hay permiso (403).

const HTTP_UNAUTHORIZED = 401
const HTTP_FORBIDDEN = 403
const LOGIN_ENDPOINT = '/auth/login'
const REFRESH_ENDPOINT = '/api/v1/auth/refresh'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
})

// La app registra aquí qué hacer en cada caso (ver src/router/sessionRedirects.js).
// Por defecto no hacen nada para que api.js no dependa del router ni del store.
const sessionHandlers = {
  onUnauthorized: () => {},
  onForbidden: () => {},
}

export function setSessionHandlers(handlers) {
  Object.assign(sessionHandlers, handlers)
}

let isRefreshing = false
let refreshSubscribers = []

function subscribeTokenRefresh(callback) {
  refreshSubscribers.push(callback)
}

function onRefreshed() {
  refreshSubscribers.forEach((callback) => callback())
  refreshSubscribers = []
}

function endSession(error) {
  isRefreshing = false
  refreshSubscribers = []
  sessionHandlers.onUnauthorized()
  return Promise.reject(error)
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status
    const requestUrl = originalRequest?.url ?? ''

    if (status === HTTP_FORBIDDEN) {
      sessionHandlers.onForbidden()
      return Promise.reject(error)
    }

    if (status !== HTTP_UNAUTHORIZED) {
      return Promise.reject(error)
    }

    // Credenciales incorrectas en el login: no hay sesión que renovar.
    if (requestUrl.includes(LOGIN_ENDPOINT)) {
      return Promise.reject(error)
    }

    if (requestUrl.includes(REFRESH_ENDPOINT)) {
      return endSession(error)
    }

    if (originalRequest._retry) {
      return Promise.reject(error)
    }

    if (!isRefreshing) {
      isRefreshing = true
      originalRequest._retry = true

      try {
        await api.get(REFRESH_ENDPOINT)
        isRefreshing = false
        onRefreshed()
        return api(originalRequest)
      } catch (refreshError) {
        return endSession(refreshError)
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