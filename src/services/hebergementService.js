import apiClient from './api/client'

/**
 * Récupère la liste publique des hébergements actifs enrichie avec leurs galeries et équipements.
 * GET /api/v1/hebergements
 */
export const getPublicHebergements = async () => {
  try {
    const response = await apiClient.get('/hebergements')
    const rawList = Array.isArray(response)
      ? response
      : (Array.isArray(response?.data) ? response.data : (response?.data?.data || []))

    // Enrichir chaque résidence avec ses détails complets (images de galerie et équipements)
    const detailedList = await Promise.all(
      rawList.map(async (item) => {
        let fullItem = item
        if (item.slug) {
          try {
            const detailRes = await apiClient.get(`/hebergements/${item.slug}`)
            const detailData = detailRes?.data !== undefined ? detailRes.data : detailRes
            if (detailData && typeof detailData === 'object') {
              fullItem = { ...item, ...detailData }
            }
          } catch {
            // En cas d'indisponibilité de la fiche détaillée, on conserve l'objet sommaire
          }
        }

        // Préparation du tableau des photos
        const photos = []
        if (Array.isArray(fullItem.images) && fullItem.images.length > 0) {
          fullItem.images.forEach((img) => {
            const url = typeof img === 'string' ? img : img?.image_url
            if (url && !photos.includes(url)) photos.push(url)
          })
        }
        if (Array.isArray(fullItem.photos) && fullItem.photos.length > 0) {
          fullItem.photos.forEach((p) => {
            const url = typeof p === 'string' ? p : p?.image_url
            if (url && !photos.includes(url)) photos.push(url)
          })
        }
        if (
          photos.length === 0 &&
          (fullItem.cover_image_url || fullItem.image_url || fullItem.photo_principale)
        ) {
          const mainImg = fullItem.cover_image_url || fullItem.image_url || fullItem.photo_principale
          if (mainImg) photos.push(mainImg)
        }

        // Préparation des équipements avec icônes
        const equipements = Array.isArray(fullItem.equipements)
          ? fullItem.equipements.map((eq) => ({
              id: eq.id,
              nom: eq.nom || eq.nom_fr || 'Équipement inclus',
              icone: eq.icone || eq.icon_name || 'check',
            }))
          : []

        return {
          ...fullItem,
          nom: fullItem.nom || fullItem.nom_residence || 'Résidence Corporate',
          description: fullItem.description || fullItem.description_fr || '',
          localisation: fullItem.localisation || 'Abidjan, Côte d’Ivoire',
          nombre_pieces: fullItem.nombre_pieces || 1,
          capacite_accueil: fullItem.capacite_accueil || 2,
          photos,
          photo_principale: photos[0] || fullItem.cover_image_url || '',
          image_url: photos[0] || fullItem.cover_image_url || '',
          equipements,
        }
      })
    )

    return detailedList
  } catch (error) {
    console.error('Erreur lors de la récupération des hébergements publics :', error)
    return []
  }
}

export default {
  getPublicHebergements,
}
