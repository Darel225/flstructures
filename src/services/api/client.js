import axios from 'axios'
import { useAuthStore } from '../../store/authStore'

const BASE_URL = import.meta.env.VITE_API_URL || 'https://flstructures.alwaysdata.net/api/v1'

/**
 * Instance Axios centralisée pour FL Structures.
 * Configuration avec withCredentials pour le transport des cookies sécurisés HttpOnly.
 */
export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Variables pour le verrou anti-concurrence (Mutex Refresh)
let isRefreshing = false
let failedQueue = []

/**
 * Résout ou rejette les requêtes empilées pendant le rafraîchissement du token.
 * @param {Error|null} error 
 * @param {string|null} token 
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// ---------------------------------------------------------------------------
// INTERCEPTEUR REQUEST : Injection du Bearer Token en mémoire
// ---------------------------------------------------------------------------
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ---------------------------------------------------------------------------
// INTERCEPTEUR RESPONSE : Déballage et gestion concurrente du 401 (Refresh)
// ---------------------------------------------------------------------------
apiClient.interceptors.response.use(
  (response) => {
    // Désemballage de l'enveloppe backend : response.data.data ou response.data
    if (
      response?.data &&
      typeof response.data === 'object' &&
      'data' in response.data &&
      response.data.data !== undefined
    ) {
      return response.data.data
    }
    return response.data
  },
  async (error) => {
    const originalRequest = error.config

    if (!originalRequest) {
      return Promise.reject(error)
    }

    const is401 = error.response?.status === 401
    const isRefreshOrAuthRequest =
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/login')

    // Si 401 sur un endpoint normal et requête non déjà retentée
    if (is401 && !originalRequest._retry && !isRefreshOrAuthRequest) {
      if (isRefreshing) {
        // Enfile la requête en attendant la fin du rafraîchissement en cours
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            return apiClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Appel direct via axios pour ne pas boucler sur les intercepteurs
        const refreshResponse = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        )

        const responsePayload = refreshResponse.data
        const newAccessToken =
          responsePayload?.data?.access_token ||
          responsePayload?.data?.accessToken ||
          responsePayload?.access_token ||
          responsePayload?.accessToken ||
          responsePayload?.data?.token ||
          responsePayload?.token

        const user =
          responsePayload?.data?.user ||
          responsePayload?.user ||
          useAuthStore.getState().user

        if (!newAccessToken) {
          throw new Error('Aucun nouveau jeton reçu lors du rafraîchissement.')
        }

        // Mise à jour de la session en mémoire vive
        useAuthStore.getState().setSession(newAccessToken, user)

        // Réinjection dans la requête originale et dépilement
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        processQueue(null, newAccessToken)

        return apiClient(originalRequest)
      } catch (refreshError) {
        // Échec du rafraîchissement : vider la session et notifier l'application
        processQueue(refreshError, null)
        useAuthStore.getState().clearSession()

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:session_expired'))
        }

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Si le 401 survient sur /auth/refresh lui-même
    if (is401 && originalRequest.url?.includes('/auth/refresh')) {
      useAuthStore.getState().clearSession()
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:session_expired'))
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
