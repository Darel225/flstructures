import apiClient from './client'

const MOCK_DEVIS_DATA = [
  {
    id: 1,
    created_at: '2026-10-15T09:30:00Z',
    societe: "Mines d'Or de Tongon (Barrick)",
    contact_nom: 'Fatou Traoré',
    email: 'f.traore@barrick.com',
    telephone: '+225 07 98 76 54 32',
    type_besoin: 'Base-vie modulaire 200 personnes & réfectoire industriel',
    site_minier: 'Tongon Nord (M’Bengué / Korhogo)',
    volume_frequence: '50 modules conteneurisés - Phase 1',
    details:
      'Installation rapide requise avant la saison des pluies. Isolation thermique renforcée (double laine de roche) et sanitaires autonomes intégrés.',
    fichier_upload_url: null,
    fichier_nom: null,
    status: 'en_attente',
  },
  {
    id: 2,
    created_at: '2026-10-14T09:30:00Z',
    societe: 'Société Minière d’Ity (SMI)',
    contact_nom: 'Marc Diallo',
    email: 'm.diallo@smi-mining.ci',
    telephone: '+225 07 48 12 34 56',
    type_besoin: 'Hangar de maintenance grande portée',
    site_minier: 'Mine d’or d’Ity (Zouan-Hounien)',
    volume_frequence: '14 modules 20ft + 4 modules 40ft',
    details:
      'Structure métallo-textile grande portée libre pour abriter les engins de concassage.',
    fichier_upload_url: null,
    fichier_nom: null,
    status: 'en_attente',
  },
  {
    id: 3,
    created_at: '2026-10-13T16:20:00Z',
    societe: 'Endeavour Mining Côte d’Ivoire',
    contact_nom: 'Sophie Koné',
    email: 's.kone@endeavourmining.com',
    telephone: '+225 05 64 21 89 00',
    type_besoin: 'Bureaux administratifs de commandement de chantier',
    site_minier: 'Site de Lafigué (Dabakala)',
    volume_frequence: '6 modules 20ft connectés en open space',
    details:
      'Modules climatisés avec précâblage réseau blindé Cat6A et faux-plafonds acoustiques.',
    fichier_upload_url: null,
    fichier_nom: null,
    status: 'en_cours',
  },
]

let localDevis = [...MOCK_DEVIS_DATA]

const extractData = (res) => {
  if (!res) return null
  if (Array.isArray(res)) return res
  if (res.data && Array.isArray(res.data)) return res.data
  if (res.data?.data) return res.data.data
  if (res.data) return res.data
  return res
}

/**
 * Service API pour la gestion CRM des demandes de devis structures & sites miniers.
 */
export const devisService = {
  /**
   * Récupère la liste des demandes de devis avec filtres optionnels (status, search).
   * GET /admin/crm/devis (fallback /admin/devis ou /crm/devis)
   */
  getDevisRequests: async (params = {}) => {
    const cleanParams = {}
    if (params.status && params.status !== 'all') {
      cleanParams.status = params.status
    }
    if (params.search && params.search.trim()) {
      cleanParams.search = params.search.trim()
    }

    try {
      const res = await apiClient.get('/admin/crm/devis', { params: cleanParams })
      const data = extractData(res)
      return Array.isArray(data) ? data : localDevis
    } catch {
      try {
        const fallbackRes = await apiClient.get('/admin/devis', { params: cleanParams })
        const data = extractData(fallbackRes)
        return Array.isArray(data) ? data : localDevis
      } catch {
        try {
          const crmRes = await apiClient.get('/crm/devis', { params: cleanParams })
          const data = extractData(crmRes)
          return Array.isArray(data) ? data : localDevis
        } catch {
          console.info('Mode démo : utilisation des données de secours pour les devis.')
          let results = [...localDevis]
          if (cleanParams.status) {
            results = results.filter((d) => d.status === cleanParams.status)
          }
          if (cleanParams.search) {
            const q = cleanParams.search.toLowerCase()
            results = results.filter(
              (d) =>
                (d.societe && d.societe.toLowerCase().includes(q)) ||
                (d.contact_nom && d.contact_nom.toLowerCase().includes(q)) ||
                (d.site_minier && d.site_minier.toLowerCase().includes(q)) ||
                (d.email && d.email.toLowerCase().includes(q)) ||
                String(d.id).includes(q)
            )
          }
          return results
        }
      }
    }
  },

  /**
   * Récupère une demande de devis par son identifiant.
   * GET /admin/crm/devis/${id}
   */
  getDevisRequestById: async (id) => {
    try {
      const res = await apiClient.get(`/admin/crm/devis/${id}`)
      return extractData(res) || res
    } catch {
      try {
        const fallbackRes = await apiClient.get(`/admin/devis/${id}`)
        return extractData(fallbackRes) || fallbackRes
      } catch {
        const found = localDevis.find((d) => String(d.id) === String(id))
        return found || null
      }
    }
  },

  /**
   * Crée une nouvelle demande de devis B2B (support multipart/form-data pour PJ).
   * POST /api/v1/devis (avec fallbacks /admin/crm/devis et /admin/devis)
   */
  createDevisRequest: async (formData) => {
    const isFormData = formData instanceof FormData
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}

    try {
      const res = await apiClient.post('/devis', formData, config)
      return res.data?.data || res.data
    } catch (err) {
      if (err.response?.status === 404) {
        try {
          const res = await apiClient.post('/admin/crm/devis', formData, config)
          return res.data?.data || res.data
        } catch (crmErr) {
          if (crmErr.response?.status === 404) {
            const res = await apiClient.post('/admin/devis', formData, config)
            return res.data?.data || res.data
          }
          throw crmErr
        }
      }
      throw err
    }
  },

  /**
   * Met à jour le statut d'une demande de devis.
   * Envoi réel vers l'API POST /admin/devis/${id}/status (avec fallback PATCH si 405).
   */
  updateDevisStatus: async (id, status) => {
    const map = {
      'En attente': 'en_attente',
      'Nouveau': 'en_attente',
      'En cours': 'en_cours',
      'Validé / Traité': 'valide',
      'Validé': 'valide',
      'Rejeté': 'rejete',
    }
    const technicalStatus = map[status] || status

    // Envoi réel vers l'API sans faux succès mocké
    try {
      const res = await apiClient.post(`/admin/devis/${id}/status`, { status: technicalStatus })
      return res.data?.data || res.data
    } catch (err) {
      if (err.response?.status === 405) {
        const res = await apiClient.patch(`/admin/devis/${id}/status`, { status: technicalStatus })
        return res.data?.data || res.data
      }
      if (err.response?.status === 404) {
        try {
          const res = await apiClient.post(`/admin/crm/devis/${id}/status`, { status: technicalStatus })
          return res.data?.data || res.data
        } catch (crmErr) {
          if (crmErr.response?.status === 405) {
            const res = await apiClient.patch(`/admin/crm/devis/${id}/status`, { status: technicalStatus })
            return res.data?.data || res.data
          }
          throw crmErr
        }
      }
      throw err
    }
  },

  /**
   * Supprime une demande de devis.
   * DELETE /admin/crm/devis/${id}
   */
  deleteDevisRequest: async (id) => {
    try {
      const res = await apiClient.delete(`/admin/crm/devis/${id}`)
      return res.data?.data || res.data
    } catch (err) {
      if (err.response?.status === 404) {
        const res = await apiClient.delete(`/admin/devis/${id}`)
        return res.data?.data || res.data
      }
      throw err
    }
  },
}

export const updateDevisStatus = devisService.updateDevisStatus
export default devisService

