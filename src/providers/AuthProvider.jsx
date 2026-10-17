import { useEffect, useState } from 'react'
import { authService } from '../services/api/authService'
import { useAuthStore } from '../store/authStore'

/**
 * Fournisseur de réhydratation d'authentification.
 * Tente de restaurer silencieusement la session en mémoire via le cookie HttpOnly.
 * Les visiteurs anonymes et les pages publiques ne sont jamais bloqués en cas d'échec ou d'absence de backend.
 * @param {{ children: import('react').ReactNode }} props
 */
export default function AuthProvider({ children }) {
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    let isCurrent = true

    const restoreSession = async () => {
      try {
        // Timeout de sécurité de 1.5s pour débloquer immédiatement si aucun backend n'est en ligne
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Auth refresh timeout')), 1500)
        )
        const refreshPromise = authService.refresh()

        const refreshData = await Promise.race([refreshPromise, timeoutPromise])
        const token =
          refreshData?.access_token || refreshData?.accessToken || refreshData?.token
        let user = refreshData?.user

        if (token && isCurrent) {
          useAuthStore.getState().setSession(token, user || null)

          if (!user) {
            try {
              const meData = await authService.getMe()
              user = meData?.user || meData
              if (isCurrent && user) {
                useAuthStore.getState().setUser(user)
              }
            } catch (meError) {
              console.warn("Impossible de récupérer le profil complet 'me' :", meError)
            }
          }
        }
      } catch {
        // Échec normal et silencieux en mode démo ou pour les visiteurs non connectés
      } finally {
        if (isCurrent) {
          setIsInitializing(false)
        }
      }
    }

    restoreSession()

    return () => {
      isCurrent = false
    }
  }, [])

  // Écran de chargement minimal et sobre pendant la vérification initiale
  if (isInitializing) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
      >
        <div className="flex flex-col items-center gap-4">
          {/* Logo / Sigle FL Structures stylisé */}
          <div className="relative flex items-center justify-center w-14 h-14 rounded-xl bg-zinc-900 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md">
            <span className="font-heading font-extrabold text-lg tracking-wider text-white">
              FL<span className="text-[#C0392B]">.</span>
            </span>
            <div className="absolute -inset-1 rounded-2xl border-2 border-[#C0392B]/40 animate-ping pointer-events-none opacity-40" />
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
            <div className="w-3.5 h-3.5 border-2 border-[#C0392B] border-t-transparent rounded-full animate-spin" />
            <span>Initialisation sécurisée...</span>
          </div>
        </div>
      </div>
    )
  }

  return children
}
