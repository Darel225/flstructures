import apiClient from './client'

// ---------------------------------------------------------------------------
// JEU DE DONNÉES DE SECOURS (Mode Démo Résilient)
// ---------------------------------------------------------------------------
const MOCK_HEBERGEMENTS = [
  {
    id: 'heb-1',
    nom_residence: 'Base-Vie Minière Tongon (Nord)',
    slug: 'base-vie-miniere-tongon-nord',
    localisation: 'Site Minier de Tongon, Région du Poro',
    description_fr:
      'Complexe modulaire autonome haute sécurité d’une capacité de 450 lits avec climatisation tropicalisée, réfectoire central et liaisons satellites redondantes.',
    description_en:
      'High-security autonomous modular complex with 450 beds capacity, tropicalized AC, central catering and redundant satellite connectivity.',
    is_active: true,
    created_at: '2026-08-10T08:00:00Z',
    images: [
      {
        image_url:
          'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?q=80&w=1200&auto=format&fit=crop',
        is_cover: true,
      },
      {
        image_url:
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop',
        is_cover: false,
      },
      {
        image_url:
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop',
        is_cover: false,
      },
    ],
    equipement_ids: ['eq-1', 'eq-2', 'eq-3', 'eq-4', 'eq-5'],
  },
  {
    id: 'heb-2',
    nom_residence: 'Camp Corporate San Pedro Port',
    slug: 'camp-corporate-san-pedro-port',
    localisation: 'Zone Industrielle & Portuaire, San Pedro',
    description_fr:
      'Bâtiment d’hébergement haut standing réservé aux cadres d’ingénierie portuaire et logistique, doté d’espaces bureaux ergonomiques et d’un gardiennage 24/7.',
    description_en:
      'High-standing accommodation camp for port engineering and logistics executives, featuring ergonomic workstations and 24/7 on-site security.',
    is_active: true,
    created_at: '2026-08-18T10:30:00Z',
    images: [
      {
        image_url:
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop',
        is_cover: true,
      },
      {
        image_url:
          'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?q=80&w=1200&auto=format&fit=crop',
        is_cover: false,
      },
    ],
    equipement_ids: ['eq-1', 'eq-3', 'eq-5', 'eq-6', 'eq-7'],
  },
  {
    id: 'heb-3',
    nom_residence: 'Résidence Modulaire Man',
    slug: 'residence-modulaire-man',
    localisation: 'District des Montagnes, Man',
    description_fr:
      'Modules résidentiels éco-conçus résistant aux fortes précipitations avec gestion solaire hybride et système de filtration d’eau potable par osmose.',
    description_en:
      'Eco-designed residential modules resistant to heavy rainfall, featuring hybrid solar power and reverse osmosis drinking water station.',
    is_active: true,
    created_at: '2026-09-02T14:15:00Z',
    images: [
      {
        image_url:
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop',
        is_cover: true,
      },
      {
        image_url:
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200&auto=format&fit=crop',
        is_cover: false,
      },
    ],
    equipement_ids: ['eq-1', 'eq-2', 'eq-6', 'eq-8'],
  },
  {
    id: 'heb-4',
    nom_residence: 'Village Chantiers Ity',
    slug: 'village-chantiers-ity',
    localisation: 'Complexe Minier d’Ity, Zouan-Hounien',
    description_fr:
      'Base-vie industrielle de grande capacité comprenant zones de couchage isolées phoniquement, infirmerie d’urgence, réfectoire climatisé et réseau Starlink.',
    description_en:
      'Large-scale industrial base camp including acoustically insulated dormitories, emergency infirmary, air-conditioned mess and Starlink network.',
    is_active: false,
    created_at: '2026-09-12T09:00:00Z',
    images: [
      {
        image_url:
          'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop',
        is_cover: true,
      },
      {
        image_url:
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop',
        is_cover: false,
      },
    ],
    equipement_ids: ['eq-1', 'eq-2', 'eq-3', 'eq-4', 'eq-5', 'eq-8'],
  },
]

// Mémoire locale pour le mode démo sans backend
let mockHebergementsStore = [...MOCK_HEBERGEMENTS]

/**
 * Service API pour la gestion des Hébergements et Résidences Corporate.
 */
export const hebergementService = {
  /**
   * Récupère la liste de tous les hébergements.
   */
  async getHebergements() {
    try {
      const response = await apiClient.get('/admin/hebergements')
      return response?.data !== undefined ? response.data : response
    } catch (error) {
      if (error?.response) throw error
      // Fallback démo
      return [...mockHebergementsStore]
    }
  },

  /**
   * Récupère un hébergement par son ID.
   */
  async getHebergementById(id) {
    try {
      const response = await apiClient.get(`/admin/hebergements/${id}`)
      return response?.data !== undefined ? response.data : response
    } catch (error) {
      if (error?.response) throw error
      const found = mockHebergementsStore.find((h) => h.id === id)
      if (!found) throw new Error('Hébergement introuvable', { cause: error })
      return { ...found }
    }
  },

  /**
   * Crée un nouvel hébergement avec sa galerie et ses équipements.
   */
  async createHebergement(data) {
    try {
      const response = await apiClient.post('/admin/hebergements', data, {
        headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
      })
      return response?.data !== undefined ? response.data : response
    } catch (error) {
      if (error?.response) {
        console.error('[hebergementService.createHebergement] Erreur retournée par le backend :', error.response)
        throw error
      }
      console.warn('[hebergementService.createHebergement] Backend non joignable, fallback démo local :', error)
      const isFormData = typeof FormData !== 'undefined' && data instanceof FormData
      const nom_residence = isFormData ? data.get('nom_residence') : data?.nom_residence
      const slug = isFormData ? data.get('slug') : data?.slug
      const newHeb = {
        ...(isFormData ? Object.fromEntries(data.entries()) : data),
        id: `heb-${Date.now()}`,
        slug:
          slug ||
          (nom_residence || '')
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-'),
        created_at: new Date().toISOString(),
      }
      mockHebergementsStore = [newHeb, ...mockHebergementsStore]
      return newHeb
    }
  },

  /**
   * Met à jour un hébergement existant.
   */
  async updateHebergement(id, data) {
    try {
      const isFormData = typeof FormData !== 'undefined' && data instanceof FormData
      const method = isFormData ? 'post' : 'put'

      const response = await apiClient[method](`/admin/hebergements/${id}`, data, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
      })
      return response?.data !== undefined ? response.data : response
    } catch (error) {
      if (error?.response) {
        console.error('[hebergementService.updateHebergement] Erreur backend :', error.response)
        throw error
      }
      const index = mockHebergementsStore.findIndex((h) => h.id === id)
      if (index === -1) throw new Error('Hébergement non trouvé', { cause: error })

      const isFormData = typeof FormData !== 'undefined' && data instanceof FormData
      const nom_residence = isFormData ? data.get('nom_residence') : data?.nom_residence
      const slug = isFormData ? data.get('slug') : data?.slug
      const dataObj = isFormData ? Object.fromEntries(data.entries()) : data

      const updated = {
        ...mockHebergementsStore[index],
        ...dataObj,
        slug:
          slug ||
          nom_residence
            ?.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-') ||
          mockHebergementsStore[index].slug,
        updated_at: new Date().toISOString(),
      }
      mockHebergementsStore[index] = updated
      return updated
    }
  },

  /**
   * Supprime un hébergement.
   */
  async deleteHebergement(id) {
    try {
      await apiClient.delete(`/admin/hebergements/${id}`)
      return { success: true }
    } catch (error) {
      if (error?.response) throw error
      mockHebergementsStore = mockHebergementsStore.filter((h) => h.id !== id)
      return { success: true }
    }
  },

  /**
   * Upload d'images pour un hébergement (multipart/form-data).
   */
  async uploadImages(id, formData) {
    try {
      const response = await apiClient.post(`/admin/hebergements/${id}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response?.data !== undefined ? response.data : response
    } catch (error) {
      if (error?.response) throw error
      throw new Error("Impossible d'uploader les images", { cause: error })
    }
  },

  /**
   * Définit une image comme couverture principale de l'hébergement.
   */
  async setCoverImage(id, imageId) {
    try {
      const response = await apiClient.put(
        `/admin/hebergements/${id}/images/${imageId}/cover`
      )
      return response?.data !== undefined ? response.data : response
    } catch (error) {
      if (error?.response) throw error
      throw new Error('Impossible de définir la couverture', { cause: error })
    }
  },

  /**
   * Supprime une image de la galerie de l'hébergement.
   */
  async deleteImage(id, imageId) {
    try {
      const response = await apiClient.delete(
        `/admin/hebergements/${id}/images/${imageId}`
      )
      return response?.data !== undefined ? response.data : response
    } catch (error) {
      if (error?.response) throw error
      throw new Error("Impossible de supprimer l'image", { cause: error })
    }
  },
}

export const createHebergement = (data) => hebergementService.createHebergement(data)
export const getHebergements = () => hebergementService.getHebergements()
export const getHebergementById = (id) => hebergementService.getHebergementById(id)
export const updateHebergement = (id, data) => hebergementService.updateHebergement(id, data)
export const deleteHebergement = (id) => hebergementService.deleteHebergement(id)
export const uploadImages = (id, formData) => hebergementService.uploadImages(id, formData)
export const setCoverImage = (id, imageId) => hebergementService.setCoverImage(id, imageId)
export const deleteImage = (id, imageId) => hebergementService.deleteImage(id, imageId)

export const getPublicHebergements = async () => {
  try {
    const response = await apiClient.get('/hebergements')
    const rawList = Array.isArray(response)
      ? response
      : (Array.isArray(response?.data) ? response.data : (response?.data?.data || []))

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
            // fallback
          }
        }

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
    console.error('Erreur getPublicHebergements :', error)
    return []
  }
}

export default hebergementService
