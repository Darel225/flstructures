import axios from 'axios'
import apiClient from './client'

const BASE_URL = import.meta.env.VITE_API_URL || 'https://flstructures.alwaysdata.net/api/v1'

/**
 * Service centralisant les appels d'authentification de l'application.
 */
export const authService = {
  /**
   * Connexion avec email et mot de passe.
   * @param {{ email: string, mot_de_passe?: string, password?: string }} credentials 
   */
  login: async (credentials) => {
    return apiClient.post('/auth/login', credentials)
  },

  /**
   * Déconnexion révoquant le refresh token côté serveur et supprimant le cookie HttpOnly.
   */
  logout: async () => {
    try {
      await apiClient.post('/auth/logout')
    } catch (error) {
      console.warn('Erreur lors du logout distant :', error)
    }
  },

  /**
   * Rafraîchissement silencieux de session via cookie HttpOnly.
   */
  refresh: async () => {
    const response = await axios.post(
      `${BASE_URL}/auth/refresh`,
      {},
      { withCredentials: true, timeout: 1500 }
    )
    return response.data?.data || response.data
  },

  /**
   * Récupération du profil de l'utilisateur authentifié.
   */
  getMe: async () => {
    return apiClient.get('/auth/me')
  },
}

export default authService
