import { create } from 'zustand'

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} [nom]
 * @property {string} [name]
 * @property {string} [role]
 */

/**
 * @typedef {Object} AuthState
 * @property {string|null} accessToken - Jeton JWT stocké uniquement en mémoire vive (anti-XSS)
 * @property {User|null} user - Données de l'utilisateur connecté
 * @property {boolean} isAuthenticated - Indicateur d'authentification
 * @property {(accessToken: string, user: User) => void} setSession - Initialise la session
 * @property {(user: User) => void} setUser - Met à jour les informations utilisateur
 * @property {() => void} clearSession - Réinitialise entièrement la session en mémoire
 */

/**
 * Store Zustand d'authentification en mémoire vive.
 * STRICTEMENT AUCUN STOCKAGE dans localStorage ou sessionStorage (protection XSS maximale).
 */
export const useAuthStore = create((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,

  setSession: (accessToken, user) =>
    set({
      accessToken,
      user,
      isAuthenticated: Boolean(accessToken),
    }),

  setUser: (user) =>
    set({
      user,
    }),

  clearSession: () =>
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
    }),
}))

export default useAuthStore
