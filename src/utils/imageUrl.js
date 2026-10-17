/**
 * Résout une URL d'image provenant de l'API backend ou du stockage cloud AlwaysData.
 *
 * @param {string|null} url
 * @returns {string}
 */
const STORAGE_BASE = (import.meta.env.VITE_STORAGE_URL || 'https://flstructures.alwaysdata.net').replace(/\/+$/, '')

export const resolveImageUrl = (url) => {
  if (!url) return ''
  if (typeof url !== 'string') return ''
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:') ||
    url.startsWith('data:')
  ) {
    return url
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`
  return `${STORAGE_BASE}${cleanPath}`
}

/**
 * Gestionnaire d'erreur chirurgical et résilient.
 * Évite les rectangles gris vides et affiche un fallback professionnel.
 */
export const handleImageError = (e) => {
  const img = e.currentTarget
  if (!img) return
  img.onerror = null
  img.src = 'https://placehold.co/600x400/f8f6f4/111111?text=FL+Structures'
}

export default resolveImageUrl