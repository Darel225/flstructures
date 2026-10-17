/* à remplacer par l'appel API lors de la connexion au backend */

/**
 * Service unique de gestion des téléversements (Uploads) de fichiers et visuels.
 * Aucun composant de l'application ne doit implémenter de logique d'upload directement.
 */

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5 Mo
const MAX_PDF_SIZE = 10 * 1024 * 1024 // 10 Mo

const ALLOWED_IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp']

const ALLOWED_PDF_MIME = ['application/pdf']
const ALLOWED_PDF_EXTS = ['.pdf']

/**
 * Vérifie l'extension d'un fichier.
 */
function hasValidExtension(fileName, allowedExts) {
  const lower = fileName.toLowerCase()
  return allowedExts.some((ext) => lower.endsWith(ext))
}

/**
 * Redimensionne une image côté client (max 1600px, compression WebP/JPEG ~0.82).
 * Renvoie une Data URL optimisée.
 *
 * @param {File} file
 * @returns {Promise<{ url: string, size: number, type: string }>}
 */
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onerror = () => reject(new Error('Erreur de lecture du fichier image.'))

    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Format d’image corrompu ou illisible.'))

      img.onload = () => {
        try {
          const maxDim = 1600
          let width = img.width
          let height = img.height

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width)
              width = maxDim
            } else {
              width = Math.round((width * maxDim) / height)
              height = maxDim
            }
          }

          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            // Fallback si canvas non disponible
            return resolve({
              url: reader.result,
              size: file.size,
              type: file.type,
            })
          }

          ctx.drawImage(img, 0, 0, width, height)

          // Préférence WebP avec repli JPEG
          const targetMime = file.type === 'image/png' ? 'image/webp' : file.type
          const compressedDataUrl = canvas.toDataURL(targetMime, 0.82)

          // Calcul approximatif de la taille du base64
          const base64Length = compressedDataUrl.length - (compressedDataUrl.indexOf(',') + 1)
          const approximateSize = Math.round((base64Length * 3) / 4)

          resolve({
            url: compressedDataUrl,
            size: approximateSize,
            type: targetMime,
          })
        } catch (err) {
          reject(err)
        }
      }

      img.src = reader.result
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Téléverse et traite une image.
 *
 * @param {File} file - Fichier sélectionné par l'utilisateur
 * @returns {Promise<{ url: string, name: string, size: number, type: string }>}
 */
export async function uploadImage(file) {
  if (!file) {
    throw new Error('Aucun fichier sélectionné.')
  }

  // 1. Contrôle MIME et extension
  if (!ALLOWED_IMAGE_MIME.includes(file.type) || !hasValidExtension(file.name, ALLOWED_IMAGE_EXTS)) {
    throw new Error('Format non accepté. Formats autorisés : JPEG, PNG ou WebP.')
  }

  // 2. Contrôle de taille maximale (5 Mo)
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('Image trop volumineuse. Taille maximale autorisée : 5 Mo.')
  }

  // 3. Compression et conversion Data URL
  try {
    const { url, size, type } = await compressImage(file)
    return {
      url,
      name: file.name,
      size,
      type,
    }
  } catch (err) {
    if (err?.name === 'QuotaExceededError') {
      throw new Error('Espace de stockage local saturé. Veuillez choisir une image plus légère.', { cause: err })
    }
    throw new Error(err?.message || 'Erreur lors du traitement de l’image.', { cause: err })
  }
}

/**
 * Téléverse et traite un fichier document (PDF).
 *
 * @param {File} file - Fichier sélectionné par l'utilisateur
 * @returns {Promise<{ url: string, name: string, size: number, type: string }>}
 */
export async function uploadFile(file) {
  if (!file) {
    throw new Error('Aucun document sélectionné.')
  }

  // 1. Contrôle MIME et extension
  if (!ALLOWED_PDF_MIME.includes(file.type) || !hasValidExtension(file.name, ALLOWED_PDF_EXTS)) {
    throw new Error('Seuls les fichiers PDF (.pdf) sont autorisés.')
  }

  // 2. Contrôle de taille maximale (10 Mo)
  if (file.size > MAX_PDF_SIZE) {
    throw new Error('Document trop volumineux. Taille maximale autorisée : 10 Mo.')
  }

  // 3. Lecture du fichier en Data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onerror = () => reject(new Error('Erreur de lecture du document PDF.'))

    reader.onload = () => {
      resolve({
        url: reader.result,
        name: file.name,
        size: file.size,
        type: file.type || 'application/pdf',
      })
    }

    reader.readAsDataURL(file)
  })
}

export default {
  uploadImage,
  uploadFile,
}
