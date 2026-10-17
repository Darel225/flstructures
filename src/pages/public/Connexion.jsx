import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '../../store/authStore'
import { authService } from '../../services/api/authService'

export default function Connexion() {
  const navigate = useNavigate()
  const location = useLocation()
  const setSession = useAuthStore((state) => state.setSession)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Récupération de l'URL cible mémorisée par AdminGuard ou repli sur /admin
  const from = location.state?.from?.pathname || '/admin'

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error('Veuillez renseigner votre email et votre mot de passe.')
      return
    }

    setIsLoading(true)

    try {
      // 1. Tentative d'authentification via l'API backend
      const response = await authService.login({
        email,
        mot_de_passe: password,
        password,
      })

      const token = response?.access_token || response?.accessToken || response?.token
      const user = response?.user || {
        id: 'usr-admin-1',
        email,
        nom: 'Administrateur',
        role: 'admin',
      }

      if (token) {
        setSession(token, user)
        toast.success(`Bienvenue, ${user.nom || user.email}`)
        navigate(from, { replace: true })
      } else {
        throw new Error('Réponse de connexion invalide.')
      }
    } catch (error) {
      const isNetworkError = !error.response || error.code === 'ERR_NETWORK'
      if (isNetworkError) {
        toast.error(
          'Serveur inaccessible. Veuillez vérifier votre connexion ou réessayer plus tard.'
        )
      } else {
        const errorMsg =
          error.response?.data?.message || 'Identifiants de connexion invalides.'
        toast.error(errorMsg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-zinc-900 p-8 sm:p-10 rounded-2xl shadow-lg border border-zinc-200/80 dark:border-zinc-800">
        {/* En-tête */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-900 text-white font-heading font-black text-xl mb-4 shadow-sm">
            FL<span className="text-[#C0392B]">.</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-zinc-900 dark:text-zinc-100 tracking-tight">
            Espace d&apos;Administration
          </h1>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Plateforme sécurisée FL Structures — Accès réservé aux administrateurs
          </p>
        </div>

        {/* Formulaire de connexion */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5"
            >
              Adresse Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Mail size={16} />
              </div>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@fl-structures.ci"
                className="block w-full pl-10 pr-3 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#C0392B] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5"
            >
              Mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Lock size={16} />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-10 pr-10 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#C0392B] focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-[#C0392B] hover:bg-[#A93226] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C0392B] shadow-sm hover:shadow transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Se connecter</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
