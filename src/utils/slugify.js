/**
 * Utilitaire de slugification unique pour la plateforme FL Structures.
 * Normalise en minuscules, retire les accents et les caractères spéciaux.
 *
 * @param {string} text - Chaîne à convertir en slug
 * @returns {string} Slug propre
 */
export function slugify(text) {
  if (!text) return ''
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les diacritiques
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Ne garde que lettres, chiffres, espaces et tirets
    .replace(/\s+/g, '-') // Remplace les espaces par des tirets
    .replace(/-+/g, '-') // Évite les tirets consécutifs
    .replace(/^-+|-+$/g, '') // Supprime les tirets de début et de fin
}

/**
 * Génère un slug unique en ajoutant un suffixe -2, -3 si nécessaire.
 *
 * @param {string} name - Nom d'origine
 * @param {string[]} existingSlugs - Liste des slugs déjà existants
 * @param {string} [currentSlug] - Slug de l'élément en cours de modification (exclu du test)
 * @returns {string} Slug garanti unique
 */
export function generateUniqueSlug(name, existingSlugs = [], currentSlug = '') {
  const baseSlug = slugify(name)
  if (!baseSlug) return ''

  // En cas d'édition, si le nom correspond au slug existant, on ne modifie pas
  if (currentSlug && baseSlug === currentSlug) {
    return currentSlug
  }

  const otherSlugs = existingSlugs.filter((s) => s !== currentSlug)
  if (!otherSlugs.includes(baseSlug)) {
    return baseSlug
  }

  let counter = 2
  let candidate = `${baseSlug}-${counter}`
  while (otherSlugs.includes(candidate)) {
    counter += 1
    candidate = `${baseSlug}-${counter}`
  }
  return candidate
}

export default slugify
