import apiClient from './client'
import siteConfig from '../../config/siteConfig'

/**
 * Construit l'URL absolue du fichier de mercuriale
 */
export const getMercurialeUrl = (pathOrUrl) => {
  if (!pathOrUrl) return null
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl
  }
  const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`
  const baseUrl = import.meta.env.VITE_STORAGE_URL || 'https://flstructures.alwaysdata.net'
  return `${baseUrl}${cleanPath}`
}

/**
 * Récupère les paramètres généraux depuis l'API publique.
 * GET /settings (fallback /admin/settings)
 */
export const getSettings = async () => {
  try {
    const res = await apiClient.get('/settings')
    const body = res?.data !== undefined ? res.data : res
    const data = body?.data || body
    if (data?.fichier_mercuriale_globale) {
      siteConfig.mercurialeUrl = getMercurialeUrl(data.fichier_mercuriale_globale)
    }
    return data
  } catch (err) {
    if (err.response?.status === 404) {
      try {
        const res = await apiClient.get('/admin/settings')
        const body = res?.data !== undefined ? res.data : res
        const data = body?.data || body
        if (data?.fichier_mercuriale_globale) {
          siteConfig.mercurialeUrl = getMercurialeUrl(data.fichier_mercuriale_globale)
        }
        return data
      } catch {
        // Mode secours silencieux pour le public
        return {}
      }
    }
    // Ne pas propager d'erreur bloquante pour les pages publiques
    return {}
  }
}

/**
 * Met à jour les paramètres généraux avec support multipart/form-data.
 * POST /admin/settings (fallback PUT)
 */
export const updateSettings = async (formData) => {
  const isFormData = formData instanceof FormData
  const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}

  try {
    const res = await apiClient.post('/admin/settings', formData, config)
    const result = res?.data !== undefined ? (res.data?.data || res.data) : res
    const data = result?.data || result
    if (data?.fichier_mercuriale_globale) {
      siteConfig.mercurialeUrl = getMercurialeUrl(data.fichier_mercuriale_globale)
    }
    return data
  } catch (err) {
    if (err.response?.status === 405) {
      const res = await apiClient.put('/admin/settings', formData, config)
      const result = res?.data !== undefined ? (res.data?.data || res.data) : res
      const data = result?.data || result
      if (data?.fichier_mercuriale_globale) {
        siteConfig.mercurialeUrl = getMercurialeUrl(data.fichier_mercuriale_globale)
      }
      return data
    }
    throw err
  }
}

export const settingsService = {
  getSettings,
  updateSettings,
  getGlobalSettings: getSettings,
  updateGlobalSettings: updateSettings,
}

export default settingsService
