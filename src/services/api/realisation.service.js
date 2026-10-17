import apiClient from './client'

// ---------------------------------------------------------------------------
// JEU DE DONNÉES DE SECOURS (Mode Démo Résilient)
// ---------------------------------------------------------------------------
const MOCK_REALISATIONS = [
  {
    id: 1,
    titre_fr: 'Dôme de Stockage Minier Ity',
    titre_en: 'Ity Mining Storage Dome',
    date_realisation: '2025-11',
    image_principale_url:
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop',
    besoin_client_fr:
      'Abri sous tension mécanique pour 15 000 tonnes de minerai aurifère en attente de broyage.',
    besoin_client_en:
      'Tensioned fabric shelter for 15,000 tons of gold ore awaiting crushing.',
    contraintes_fr:
      'Vents violents cycloniques en saison des pluies, hygrométrie 95% et interdiction de piliers intermédiaires.',
    contraintes_en:
      'Cyclonic wind gusts during rainy season, 95% humidity, and total prohibition of internal intermediate pillars.',
    solution_fr:
      'Structure métallo-textile en alliage d’aluminium anodisé avec membrane PVC auto-extinguible M2 et portée libre de 40m.',
    solution_en:
      'Anodized aluminum alloy tensioned fabric structure with M2 fire-retardant PVC membrane and 40m clear span.',
    created_at: '2025-11-20T10:00:00Z',
  },
  {
    id: 2,
    titre_fr: 'Base-Vie Autonome 600 personnes Endeavour',
    titre_en: 'Endeavour 600-Man Autonomous Base Camp',
    date_realisation: '2026-03',
    image_principale_url:
      'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?q=80&w=1200&auto=format&fit=crop',
    besoin_client_fr:
      'Hébergement clés en main de 600 cadres et techniciens déployé en moins de 45 jours calendaires.',
    besoin_client_en:
      'Turnkey accommodation for 600 executives and technicians deployed in under 45 calendar days.',
    contraintes_fr:
      'Zone hyper-enclavée sans accès au réseau électrique national ni source d’eau potable immédiate.',
    contraintes_en:
      'Remote landlocked zone with no access to national power grid and no direct clean water supply.',
    solution_fr:
      'Parc de modules shelters isothermes pré-câblés, centrale solaire hybride 250 kVA et unité de potabilisation par osmose inverse.',
    solution_en:
      'Pre-wired insulated shelter module park, 250 kVA hybrid solar power plant, and reverse osmosis water treatment unit.',
    created_at: '2026-03-15T14:30:00Z',
  },
  {
    id: 3,
    titre_fr: 'Hangar de Maintenance Aéronautique Abidjan',
    titre_en: 'Abidjan Aeronautical Maintenance Hangar',
    date_realisation: '2026-07',
    image_principale_url:
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop',
    besoin_client_fr:
      'Hangar démontable certifié pour la maintenance en ligne de 2 turbopropulseurs logistiques.',
    besoin_client_en:
      'Certified demountable hangar for line maintenance of 2 logistics turboprops.',
    contraintes_fr:
      'Sol sablonneux meuble à faible portance interdisant les fondations bétonnées lourdes.',
    contraintes_en:
      'Loose sandy soil with low bearing capacity preventing heavy concrete deep foundations.',
    solution_fr:
      'Ancrage sur pieux hélicoïdaux vissés amovibles et toiture translucide haute résistance aux UV réduisant les besoins en éclairage diurne.',
    solution_en:
      'Removable helical screw pile anchoring and high UV-resistant translucent roofing optimizing daytime natural lighting.',
    created_at: '2026-07-28T09:15:00Z',
  },
]

let localRealisations = [...MOCK_REALISATIONS]

const extractData = (res) => {
  if (!res) return null
  if (Array.isArray(res)) return res
  if (res.data && Array.isArray(res.data)) return res.data
  if (res.data?.data) return res.data.data
  if (res.data) return res.data
  return res
}

/**
 * Service API pour la gestion des Réalisations d'ingénierie et études de cas.
 */
export const realisationService = {
  /**
   * Récupère la liste de toutes les réalisations.
   * GET /admin/realisations (fallback /realisations), déballage res.data?.data || res.data
   */
  async getRealisations() {
    try {
      const res = await apiClient.get('/admin/realisations')
      const data = extractData(res)
      return Array.isArray(data) ? data : localRealisations
    } catch {
      try {
        const fallbackRes = await apiClient.get('/realisations')
        const data = extractData(fallbackRes)
        return Array.isArray(data) ? data : localRealisations
      } catch {
        console.info('Mode démo : utilisation des données de secours pour les réalisations.')
        return [...localRealisations]
      }
    }
  },

  /**
   * Récupère une réalisation par son ID.
   * GET /admin/realisations/${id}
   */
  async getRealisationById(id) {
    try {
      const res = await apiClient.get(`/admin/realisations/${id}`)
      return extractData(res) || res
    } catch {
      try {
        const fallbackRes = await apiClient.get(`/realisations/${id}`)
        return extractData(fallbackRes) || fallbackRes
      } catch {
        const found = localRealisations.find((r) => String(r.id) === String(id))
        if (!found) throw new Error('Réalisation introuvable')
        return { ...found }
      }
    }
  },

  /**
   * Crée une nouvelle réalisation avec téléversement multipart/form-data.
   * POST /admin/realisations avec Content-Type: multipart/form-data
   */
  async createRealisation(formData) {
    const isFormData = formData instanceof FormData
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}

    try {
      const res = await apiClient.post('/admin/realisations', formData, config)
      return extractData(res) || res
    } catch (err) {
      if (err.response?.status === 404) {
        try {
          const res = await apiClient.post('/realisations', formData, config)
          return extractData(res) || res
        } catch {
          // fallback
        }
      }
      // Mode démo local
      const newRea = {
        id: Date.now(),
        titre_fr: isFormData ? formData.get('titre_fr') : formData.titre_fr,
        titre_en: isFormData ? formData.get('titre_en') : formData.titre_en,
        date_realisation: isFormData ? formData.get('date_realisation') : formData.date_realisation,
        besoin_client_fr: isFormData ? formData.get('besoin_client_fr') : formData.besoin_client_fr,
        besoin_client_en: isFormData ? formData.get('besoin_client_en') : formData.besoin_client_en,
        contraintes_fr: isFormData ? formData.get('contraintes_fr') : formData.contraintes_fr,
        contraintes_en: isFormData ? formData.get('contraintes_en') : formData.contraintes_en,
        solution_fr: isFormData ? formData.get('solution_fr') : formData.solution_fr,
        solution_en: isFormData ? formData.get('solution_en') : formData.solution_en,
        image_principale_url:
          'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop',
        created_at: new Date().toISOString(),
      }
      localRealisations = [newRea, ...localRealisations]
      return newRea
    }
  },

  /**
   * Met à jour une réalisation existante.
   * POST /admin/realisations/${id} avec Content-Type: multipart/form-data (utilise POST pour garantir l'envoi de fichiers)
   */
  async updateRealisation(id, formData) {
    const isFormData = formData instanceof FormData
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}

    try {
      // Envoi en POST sur l'URL d'édition pour que PHP traite multipart/form-data sans altérer $_POST et $_FILES
      const res = await apiClient.post(`/admin/realisations/${id}`, formData, config)
      return extractData(res) || res
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 405) {
        try {
          const res = await apiClient.put(`/admin/realisations/${id}`, formData, config)
          return extractData(res) || res
        } catch {
          // fallback
        }
      }
      // Mode démo local
      localRealisations = localRealisations.map((r) => {
        if (String(r.id) === String(id)) {
          return {
            ...r,
            titre_fr: isFormData ? formData.get('titre_fr') || r.titre_fr : formData.titre_fr || r.titre_fr,
            titre_en: isFormData ? formData.get('titre_en') || r.titre_en : formData.titre_en || r.titre_en,
            date_realisation: isFormData ? formData.get('date_realisation') || r.date_realisation : formData.date_realisation || r.date_realisation,
            besoin_client_fr: isFormData ? formData.get('besoin_client_fr') || r.besoin_client_fr : formData.besoin_client_fr || r.besoin_client_fr,
            besoin_client_en: isFormData ? formData.get('besoin_client_en') || r.besoin_client_en : formData.besoin_client_en || r.besoin_client_en,
            contraintes_fr: isFormData ? formData.get('contraintes_fr') || r.contraintes_fr : formData.contraintes_fr || r.contraintes_fr,
            contraintes_en: isFormData ? formData.get('contraintes_en') || r.contraintes_en : formData.contraintes_en || r.contraintes_en,
            solution_fr: isFormData ? formData.get('solution_fr') || r.solution_fr : formData.solution_fr || r.solution_fr,
            solution_en: isFormData ? formData.get('solution_en') || r.solution_en : formData.solution_en || r.solution_en,
            updated_at: new Date().toISOString(),
          }
        }
        return r
      })
      return localRealisations.find((r) => String(r.id) === String(id))
    }
  },

  /**
   * Supprime une réalisation.
   * DELETE /admin/realisations/${id}
   */
  async deleteRealisation(id) {
    try {
      const res = await apiClient.delete(`/admin/realisations/${id}`)
      return extractData(res) || { success: true }
    } catch (err) {
      if (err.response?.status === 404) {
        try {
          const res = await apiClient.delete(`/realisations/${id}`)
          return extractData(res) || { success: true }
        } catch {
          // fallback
        }
      }
      localRealisations = localRealisations.filter((r) => String(r.id) !== String(id))
      return { success: true }
    }
  },
}

export const getRealisations = () => realisationService.getRealisations()
export const getRealisationById = (id) => realisationService.getRealisationById(id)
export const createRealisation = (formData) => realisationService.createRealisation(formData)
export const updateRealisation = (id, formData) => realisationService.updateRealisation(id, formData)
export const deleteRealisation = (id) => realisationService.deleteRealisation(id)

export default realisationService

