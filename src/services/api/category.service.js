import apiClient from './client'

const MOCK_CATEGORIES = [
  {
    id: 1,
    nom_fr: 'Hangars de Stockage Lourds',
    nom_en: 'Heavy Industrial Storage Hangars',
    ordre_affichage: 1,
    image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
    actif: 1,
    created_at: '2026-09-01T10:00:00Z',
  },
  {
    id: 2,
    nom_fr: 'Tentes Modulaires de Chantier',
    nom_en: 'Modular Mining Camp Tents',
    ordre_affichage: 2,
    image_url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&q=80',
    actif: 1,
    created_at: '2026-09-02T10:00:00Z',
  },
  {
    id: 3,
    nom_fr: 'Abris de Maintenance Minier',
    nom_en: 'Mine Vehicle Maintenance Shelters',
    ordre_affichage: 3,
    image_url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80',
    actif: 1,
    created_at: '2026-09-03T10:00:00Z',
  },
  {
    id: 4,
    nom_fr: 'Bases-Vie Préfabriquées',
    nom_en: 'Prefabricated Living Camps',
    ordre_affichage: 4,
    image_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?auto=format&fit=crop&w=600&q=80',
    actif: 1,
    created_at: '2026-09-04T10:00:00Z',
  },
  {
    id: 5,
    nom_fr: 'Modules Sanitaires & Conteneurs',
    nom_en: 'Sanitary Modules & Containers',
    ordre_affichage: 5,
    image_url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80',
    actif: 0,
    created_at: '2026-09-05T10:00:00Z',
  },
]

let localCategories = [...MOCK_CATEGORIES]

const extractData = (res) => {
  if (!res) return null
  if (Array.isArray(res)) return res
  if (res.data && Array.isArray(res.data)) return res.data
  if (res.data?.data) return res.data.data
  if (res.data) return res.data
  return res
}

/**
 * Service API pour la gestion des Catégories du Catalogue Modulaire.
 */
export const categoryService = {
  /**
   * Récupère la liste de toutes les catégories.
   * GET /admin/categories (fallback /categories), déballe res.data?.data || res.data
   */
  getCategories: async () => {
    try {
      const res = await apiClient.get('/categories')
      const data = extractData(res)
      return Array.isArray(data) ? data : localCategories
    } catch {
      try {
        const fallbackRes = await apiClient.get('/admin/categories')
        const data = extractData(fallbackRes)
        return Array.isArray(data) ? data : localCategories
      } catch {
        console.info('Mode démo : utilisation des données de secours pour les catégories.')
        return [...localCategories].sort((a, b) => Number(a.ordre_affichage) - Number(b.ordre_affichage))
      }
    }
  },

  /**
   * Crée une nouvelle catégorie avec téléversement multipart/form-data.
   * POST /admin/categories avec Content-Type: multipart/form-data
   */
  createCategory: async (formData) => {
    const isFormData = formData instanceof FormData
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}

    try {
      const res = await apiClient.post('/admin/categories', formData, config)
      return extractData(res) || res
    } catch (err) {
      if (err.response?.status === 404) {
        try {
          const res = await apiClient.post('/categories', formData, config)
          return extractData(res) || res
        } catch {
          // fallback
        }
      }
      // Mode démo local
      const newCategory = {
        id: Date.now(),
        nom_fr: isFormData ? formData.get('nom_fr') : formData.nom_fr,
        nom_en: isFormData ? formData.get('nom_en') : formData.nom_en,
        ordre_affichage: Number(isFormData ? formData.get('ordre_affichage') : formData.ordre_affichage) || localCategories.length + 1,
        actif: Number(isFormData ? formData.get('actif') : formData.actif) ? 1 : 0,
        image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
        created_at: new Date().toISOString(),
      }
      localCategories = [newCategory, ...localCategories]
      return newCategory
    }
  },

  /**
   * Met à jour une catégorie existante.
   * POST /admin/categories/${id} avec Content-Type: multipart/form-data (utilise POST pour garantir le support des fichiers)
   */
  updateCategory: async (id, formData) => {
    const isFormData = formData instanceof FormData
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}

    try {
      // Envoi en POST sur l'URL d'édition pour que PHP traite multipart/form-data sans perte de $_POST / $_FILES
      const res = await apiClient.post(`/admin/categories/${id}`, formData, config)
      return extractData(res) || res
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 405) {
        try {
          const res = await apiClient.put(`/admin/categories/${id}`, formData, config)
          return extractData(res) || res
        } catch {
          // fallback
        }
      }
      // Mode démo local
      localCategories = localCategories.map((c) => {
        if (String(c.id) === String(id)) {
          return {
            ...c,
            nom_fr: isFormData ? formData.get('nom_fr') || c.nom_fr : formData.nom_fr || c.nom_fr,
            nom_en: isFormData ? formData.get('nom_en') || c.nom_en : formData.nom_en || c.nom_en,
            ordre_affichage: Number(isFormData ? formData.get('ordre_affichage') : formData.ordre_affichage) || c.ordre_affichage,
            actif: Number(isFormData ? formData.get('actif') : formData.actif) ? 1 : 0,
            updated_at: new Date().toISOString(),
          }
        }
        return c
      })
      return localCategories.find((c) => String(c.id) === String(id))
    }
  },

  /**
   * Supprime une catégorie du catalogue.
   * DELETE /admin/categories/${id}
   */
  deleteCategory: async (id) => {
    try {
      const res = await apiClient.delete(`/admin/categories/${id}`)
      return extractData(res) || { success: true }
    } catch (err) {
      if (err.response?.status === 404) {
        try {
          const res = await apiClient.delete(`/categories/${id}`)
          return extractData(res) || { success: true }
        } catch {
          // fallback
        }
      }
      localCategories = localCategories.filter((c) => String(c.id) !== String(id))
      return { success: true }
    }
  },
}

export const getCategories = (...args) => categoryService.getCategories(...args)
export const createCategory = (...args) => categoryService.createCategory(...args)
export const updateCategory = (...args) => categoryService.updateCategory(...args)
export const deleteCategory = (...args) => categoryService.deleteCategory(...args)

export default categoryService
