import apiClient from './client'

// ---------------------------------------------------------------------------
// JEU DE DONNÉES DE SECOURS (Mode Démo Résilient)
// ---------------------------------------------------------------------------
const MOCK_EQUIPEMENTS = [
  {
    id: 1,
    nom_fr: 'Climatisation Tropicalisée Inverter',
    nom_en: 'Tropicalized Inverter AC',
    icon_name: 'Wind',
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id: 2,
    nom_fr: 'Groupe Électrogène & Énergie 24/7',
    nom_en: '24/7 Power Generator Backup',
    icon_name: 'Zap',
    created_at: '2026-09-02T08:00:00Z',
  },
  {
    id: 3,
    nom_fr: 'Restauration & Cuisine Équipée',
    nom_en: 'Equipped Canteen & Catering',
    icon_name: 'Utensils',
    created_at: '2026-09-03T08:00:00Z',
  },
  {
    id: 4,
    nom_fr: 'Liaison Satellite Starlink Haut Débit',
    nom_en: 'High-Speed Starlink Satellite Network',
    icon_name: 'Satellite',
    created_at: '2026-09-04T08:00:00Z',
  },
  {
    id: 5,
    nom_fr: 'Sécurité & Vidéosurveillance 24/7',
    nom_en: '24/7 Security Guard & CCTV',
    icon_name: 'ShieldCheck',
    created_at: '2026-09-05T08:00:00Z',
  },
  {
    id: 6,
    nom_fr: 'Literie Hôtelière 5 Étoiles',
    nom_en: '5-Star Hotel Bedding & Linen',
    icon_name: 'Bed',
    created_at: '2026-09-06T08:00:00Z',
  },
  {
    id: 7,
    nom_fr: 'Espace de Travail Ergonomique',
    nom_en: 'Ergonomic Workstation & Desks',
    icon_name: 'Briefcase',
    created_at: '2026-09-07T08:00:00Z',
  },
  {
    id: 8,
    nom_fr: 'Eau Potable & Station de Filtration',
    nom_en: 'Potable Water & Filtration Station',
    icon_name: 'Droplets',
    created_at: '2026-09-08T08:00:00Z',
  },
]

let localEquipements = [...MOCK_EQUIPEMENTS]

/**
 * Extrait les données de la réponse API selon le format retourné (res.data?.data || res.data || res).
 */
const extractData = (res) => {
  if (!res) return null
  if (Array.isArray(res)) return res
  if (res.data && Array.isArray(res.data)) return res.data
  if (res.data?.data) return res.data.data
  if (res.data) return res.data
  return res
}

/**
 * Service API pour la gestion du référentiel des équipements d'hébergement.
 * Endpoints administratifs préfixés par /admin/equipements avec fallback vers /equipements.
 */
export const equipementService = {
  /**
   * Récupère la liste de tous les équipements actifs.
   * GET /admin/equipements (fallback /equipements) -> res.data?.data || res.data
   */
  getEquipements: async () => {
    try {
      const res = await apiClient.get('/admin/equipements')
      const data = extractData(res)
      return Array.isArray(data) ? data : localEquipements
    } catch {
      try {
        const fallbackRes = await apiClient.get('/equipements')
        const data = extractData(fallbackRes)
        return Array.isArray(data) ? data : localEquipements
      } catch {
        console.info('Mode démo : utilisation des données de secours pour les équipements.')
        return [...localEquipements]
      }
    }
  },

  /**
   * Crée un nouvel équipement avec charge utile purement JSON.
   * POST /admin/equipements avec { nom_fr, nom_en, icon_name }
   */
  createEquipement: async (data) => {
    const payload = {
      nom_fr: data.nom_fr,
      nom_en: data.nom_en || '',
      icon_name: data.icon_name || 'Wifi',
    }

    try {
      const res = await apiClient.post('/admin/equipements', payload)
      return extractData(res) || res
    } catch (err) {
      if (err.response?.status === 404) {
        try {
          const res = await apiClient.post('/equipements', payload)
          return extractData(res) || res
        } catch {
          // Ignorer et passer au mock fallback
        }
      }
      const newEquipement = {
        id: Date.now(),
        created_at: new Date().toISOString(),
        ...payload,
      }
      localEquipements = [newEquipement, ...localEquipements]
      return newEquipement
    }
  },

  /**
   * Met à jour un équipement existant avec charge utile JSON.
   * PUT /admin/equipements/${id} (ou POST /admin/equipements/${id}) avec { nom_fr, nom_en, icon_name }
   */
  updateEquipement: async (id, data) => {
    const payload = {
      nom_fr: data.nom_fr,
      nom_en: data.nom_en || '',
      icon_name: data.icon_name || 'Wifi',
    }

    try {
      const res = await apiClient.put(`/admin/equipements/${id}`, payload)
      return extractData(res) || res
    } catch (err) {
      if (err.response?.status === 405 || err.response?.status === 404) {
        try {
          const res = await apiClient.post(`/admin/equipements/${id}`, payload)
          return extractData(res) || res
        } catch {
          // Ignorer et passer au mock fallback
        }
      }
      localEquipements = localEquipements.map((eq) =>
        String(eq.id) === String(id)
          ? { ...eq, ...payload, updated_at: new Date().toISOString() }
          : eq
      )
      return localEquipements.find((eq) => String(eq.id) === String(id))
    }
  },

  /**
   * Supprime un équipement du référentiel.
   * DELETE /admin/equipements/${id}
   */
  deleteEquipement: async (id) => {
    try {
      const res = await apiClient.delete(`/admin/equipements/${id}`)
      return extractData(res) || { success: true }
    } catch (err) {
      if (err.response?.status === 404) {
        try {
          const res = await apiClient.delete(`/equipements/${id}`)
          return extractData(res) || { success: true }
        } catch {
          // Ignorer et passer au mock fallback
        }
      }
      localEquipements = localEquipements.filter((eq) => String(eq.id) !== String(id))
      return { success: true }
    }
  },
}

export default equipementService
