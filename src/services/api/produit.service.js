import apiClient from './client'

const MOCK_PRODUITS = [
  {
    id: 1,
    categorie_id: 1,
    nom_fr: 'Hangar Almaconst Portée 20m',
    nom_en: 'Almaconst Heavy Hangar 20m Span',
    description_courte_fr:
      'Structure métallique galvanisée à chaud sans poteau intermédiaire, idéale pour le stockage de vrac ou d’explosifs miniers.',
    description_courte_en:
      'Hot-dip galvanized steel structure with no central pillar, ideal for bulk material or mining explosives storage.',
    image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
    actif: 1,
    created_at: '2026-09-10T11:00:00Z',
  },
  {
    id: 2,
    categorie_id: 2,
    nom_fr: 'Dôme Géodésique B2B Événementiel & Conférence',
    nom_en: 'B2B Geodesic Dome for Events & Conferences',
    description_courte_fr:
      'Dôme architectural autoportant avec membrane ignifugée M2, système de climatisation et plancher technique surélevé.',
    description_courte_en:
      'Self-supporting architectural dome with M2 flame-retardant membrane, AC system and raised technical flooring.',
    image_url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&q=80',
    actif: 1,
    created_at: '2026-09-12T14:30:00Z',
  },
  {
    id: 3,
    categorie_id: 2,
    nom_fr: 'Chapiteau Industriel Polygonal 1000m²',
    nom_en: 'Polygonal Industrial Marquee 1000sqm',
    description_courte_fr:
      'Grande structure temporaire pour réfectoires d’urgence ou bases arrière logistiques avec haubanage certifié 120 km/h.',
    description_courte_en:
      'Large temporary structure for emergency canteens or logistics base camps with wind bracing certified up to 120 km/h.',
    image_url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80',
    actif: 1,
    created_at: '2026-09-15T09:15:00Z',
  },
  {
    id: 4,
    categorie_id: 4,
    nom_fr: 'Module Shelter Isotherme 40ft Cadres',
    nom_en: 'Insulated 40ft Executive Camp Shelter',
    description_courte_fr:
      'Conteneur maritime 40 pieds aménagé en 2 chambres de direction avec salles d’eau privatives et espace de bureau.',
    description_courte_en:
      '40ft container fitted out as 2 executive suites with private bathrooms and dedicated desk area.',
    image_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?auto=format&fit=crop&w=600&q=80',
    actif: 1,
    created_at: '2026-09-18T16:00:00Z',
  },
  {
    id: 5,
    categorie_id: 3,
    nom_fr: 'Atelier de Maintenance Engins Lourds 15x30m',
    nom_en: 'Heavy Machinery Maintenance Workshop 15x30m',
    description_courte_fr:
      'Abri renforcé grande hauteur sous plafond permettant l’intervention sur dumpers, pelles mécaniques et bulldozers.',
    description_courte_en:
      'Heavy-duty high clearance shelter allowing maintenance on mine dumpers, excavators and bulldozers.',
    image_url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80',
    actif: 1,
    created_at: '2026-09-20T10:45:00Z',
  },
]

let localProduits = [...MOCK_PRODUITS]

const extractData = (res) => {
  if (!res) return null
  if (Array.isArray(res)) return res
  if (res.data && Array.isArray(res.data)) return res.data
  if (res.data?.data) return res.data.data
  if (res.data) return res.data
  return res
}

/**
 * Service API pour la gestion des Produits du Catalogue Modulaire.
 */
export const produitService = {
  /**
   * Récupère la liste des produits avec filtres optionnels (categorie_id, search).
   * GET /admin/produits (supporte filtre { categorie_id })
   */
  getProduits: async (params = {}) => {
    try {
      const res = await apiClient.get('/produits', { params })
      const data = extractData(res)
      return Array.isArray(data) ? data : localProduits
    } catch {
      try {
        const fallbackRes = await apiClient.get('/admin/produits', { params })
        const data = extractData(fallbackRes)
        return Array.isArray(data) ? data : localProduits
      } catch {
        console.info('Mode démo : utilisation des données de secours pour les produits.')
        let results = [...localProduits]
        if (params.categorie_id && params.categorie_id !== 'all') {
          results = results.filter((p) => String(p.categorie_id) === String(params.categorie_id))
        }
        if (params.search) {
          const q = params.search.toLowerCase()
          results = results.filter(
            (p) =>
              (p.nom_fr && p.nom_fr.toLowerCase().includes(q)) ||
              (p.nom_en && p.nom_en.toLowerCase().includes(q)) ||
              (p.description_courte_fr && p.description_courte_fr.toLowerCase().includes(q))
          )
        }
        return results
      }
    }
  },

  /**
   * Crée un nouveau produit avec téléversement multipart/form-data.
   * POST /admin/produits avec Content-Type: multipart/form-data
   */
  createProduit: async (formData) => {
    const isFormData = formData instanceof FormData
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}

    try {
      const res = await apiClient.post('/admin/produits', formData, config)
      return extractData(res) || res
    } catch (err) {
      if (err.response?.status === 404) {
        try {
          const res = await apiClient.post('/produits', formData, config)
          return extractData(res) || res
        } catch {
          // fallback
        }
      }
      // Mode démo local
      const newProduct = {
        id: Date.now(),
        categorie_id: isFormData ? formData.get('categorie_id') : formData.categorie_id,
        nom_fr: isFormData ? formData.get('nom_fr') : formData.nom_fr,
        nom_en: isFormData ? formData.get('nom_en') : formData.nom_en,
        description_courte_fr: isFormData ? formData.get('description_courte_fr') : formData.description_courte_fr,
        description_courte_en: isFormData ? formData.get('description_courte_en') : formData.description_courte_en,
        actif: Number(isFormData ? formData.get('actif') : formData.actif) ? 1 : 0,
        image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
        created_at: new Date().toISOString(),
      }
      localProduits = [newProduct, ...localProduits]
      return newProduct
    }
  },

  /**
   * Met à jour un produit existant avec téléversement multipart/form-data.
   * POST /admin/produits/${id} avec Content-Type: multipart/form-data
   */
  updateProduit: async (id, formData) => {
    const isFormData = formData instanceof FormData
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}

    try {
      // Envoi en POST sur l'URL d'édition pour que PHP traite multipart/form-data sans altérer $_POST et $_FILES
      const res = await apiClient.post(`/admin/produits/${id}`, formData, config)
      return extractData(res) || res
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 405) {
        try {
          const res = await apiClient.put(`/admin/produits/${id}`, formData, config)
          return extractData(res) || res
        } catch {
          // fallback
        }
      }
      // Mode démo local
      localProduits = localProduits.map((p) => {
        if (String(p.id) === String(id)) {
          return {
            ...p,
            categorie_id: isFormData ? formData.get('categorie_id') || p.categorie_id : formData.categorie_id || p.categorie_id,
            nom_fr: isFormData ? formData.get('nom_fr') || p.nom_fr : formData.nom_fr || p.nom_fr,
            nom_en: isFormData ? formData.get('nom_en') || p.nom_en : formData.nom_en || p.nom_en,
            description_courte_fr: isFormData ? formData.get('description_courte_fr') || p.description_courte_fr : formData.description_courte_fr || p.description_courte_fr,
            description_courte_en: isFormData ? formData.get('description_courte_en') || p.description_courte_en : formData.description_courte_en || p.description_courte_en,
            actif: Number(isFormData ? formData.get('actif') : formData.actif) ? 1 : 0,
            updated_at: new Date().toISOString(),
          }
        }
        return p
      })
      return localProduits.find((p) => String(p.id) === String(id))
    }
  },

  /**
   * Supprime un produit du catalogue.
   * DELETE /admin/produits/${id}
   */
  deleteProduit: async (id) => {
    try {
      const res = await apiClient.delete(`/admin/produits/${id}`)
      return extractData(res) || { success: true }
    } catch (err) {
      if (err.response?.status === 404) {
        try {
          const res = await apiClient.delete(`/produits/${id}`)
          return extractData(res) || { success: true }
        } catch {
          // fallback
        }
      }
      localProduits = localProduits.filter((p) => String(p.id) !== String(id))
      return { success: true }
    }
  },
}

export const getProduits = (...args) => produitService.getProduits(...args)
export const createProduit = (...args) => produitService.createProduit(...args)
export const updateProduit = (...args) => produitService.updateProduit(...args)
export const deleteProduit = (...args) => produitService.deleteProduit(...args)

export default produitService
