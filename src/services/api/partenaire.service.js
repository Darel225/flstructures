import apiClient from './client'

export const normalizePartenaireStatus = (status) => {
  const map = {
    'En attente': 'en_attente',
    'en_attente': 'en_attente',
    'En cours': 'en_evaluation',
    'en_cours': 'en_evaluation',
    'En évaluation': 'en_evaluation',
    'en_evaluation': 'en_evaluation',
    'Agréés / Validés': 'valide',
    'Agréé': 'valide',
    'Agréés': 'valide',
    'valide': 'valide',
    'Validé': 'valide',
    'Non retenus': 'rejete',
    'Non retenu': 'rejete',
    'Rejeté': 'rejete',
    'rejete': 'rejete',
  }
  return map[status] || status || 'en_attente'
}

/**
 * Service API pour la gestion CRM des candidatures partenaires & fournisseurs.
 * 100% connecté à la base MySQL partenaire_requests, AUCUN mock statique.
 */
export const partenaireService = {
  /**
   * Récupère la liste réelle des candidatures partenaires depuis la table partenaire_requests.
   * GET /admin/crm/partenaires (avec fallback /admin/partenaires ou /crm/partenaires)
   */
  getPartenaires: async (params = {}) => {
    const cleanParams = { ...params }
    // Si le statut est 'all', 'tous', 'Tous' ou vide, NE PAS l'envoyer au backend
    if (
      !cleanParams.status ||
      cleanParams.status === 'all' ||
      cleanParams.status === 'tous' ||
      cleanParams.status === 'Tous'
    ) {
      delete cleanParams.status
    }
    const searchVal = cleanParams.search || cleanParams.search_term
    if (!searchVal || !searchVal.trim()) {
      delete cleanParams.search
      delete cleanParams.search_term
    } else {
      cleanParams.search = searchVal.trim()
    }

    const unpack = (res) => {
      const body = res?.data !== undefined ? res.data : res
      // Déballage garanti en tableau JavaScript
      if (Array.isArray(body)) return body
      if (Array.isArray(body?.data)) return body.data
      if (Array.isArray(body?.data?.data)) return body.data.data
      return []
    }

    try {
      const res = await apiClient.get('/admin/crm/partenaires', { params: cleanParams })
      return unpack(res)
    } catch (err) {
      if (err.response?.status === 404) {
        try {
          const fallbackRes = await apiClient.get('/admin/partenaires', { params: cleanParams })
          return unpack(fallbackRes)
        } catch (fErr) {
          if (fErr.response?.status === 404) {
            try {
              const crmRes = await apiClient.get('/crm/partenaires', { params: cleanParams })
              return unpack(crmRes)
            } catch {
              return []
            }
          }
          throw fErr
        }
      }
      throw err
    }
  },

  /**
   * Récupère une candidature par son identifiant réel.
   * GET /admin/crm/partenaires/${id}
   */
  getPartenaireById: async (id) => {
    try {
      const res = await apiClient.get(`/admin/crm/partenaires/${id}`)
      const body = res?.data !== undefined ? res.data : res
      return body?.data?.data || body?.data || body || null
    } catch {
      try {
        const fallbackRes = await apiClient.get(`/admin/partenaires/${id}`)
        const body = fallbackRes?.data !== undefined ? fallbackRes.data : fallbackRes
        return body?.data?.data || body?.data || body || null
      } catch {
        return null
      }
    }
  },

  /**
   * Crée une candidature partenaire / agrément fournisseur (multipart/form-data).
   * POST /api/v1/partenaires (avec fallback /partenaires et /admin/crm/partenaires)
   */
  createPartenaireRequest: async (formData) => {
    const isFormData = formData instanceof FormData
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}

    try {
      const res = await apiClient.post('/api/v1/partenaires', formData, config)
      return res.data?.data || res.data
    } catch (err) {
      if (err.response?.status === 404) {
        try {
          const res = await apiClient.post('/partenaires', formData, config)
          return res.data?.data || res.data
        } catch (pErr) {
          if (pErr.response?.status === 404) {
            const res = await apiClient.post('/admin/crm/partenaires', formData, config)
            return res.data?.data || res.data
          }
          throw pErr
        }
      }
      throw err
    }
  },

  /**
   * Met à jour le statut d'une candidature partenaire en base.
   * POST vers /admin/crm/partenaires/${id}/status avec { status: technicalStatus }.
   */
  updatePartenaireStatus: async (id, status) => {
    const map = {
      'En attente': 'en_attente',
      'en_attente': 'en_attente',
      'En évaluation': 'en_evaluation',
      'en_evaluation': 'en_evaluation',
      'En cours': 'en_evaluation',
      'en_cours': 'en_evaluation',
      'Agréés / Validés': 'valide',
      'Agréé': 'valide',
      'valide': 'valide',
      'Validé': 'valide',
      'Non retenus': 'rejete',
      'Non retenu': 'rejete',
      'Rejeté': 'rejete',
      'rejete': 'rejete',
    }
    const technicalStatus = map[status] || status

    try {
      const res = await apiClient.post(`/admin/crm/partenaires/${id}/status`, { status: technicalStatus })
      return res.data?.data || res.data
    } catch (err) {
      if (err.response?.status === 405) {
        const res = await apiClient.patch(`/admin/crm/partenaires/${id}/status`, { status: technicalStatus })
        return res.data?.data || res.data
      }
      if (err.response?.status === 404) {
        try {
          const res = await apiClient.post(`/admin/partenaires/${id}/status`, { status: technicalStatus })
          return res.data?.data || res.data
        } catch (e2) {
          if (e2.response?.status === 405) {
            const res = await apiClient.patch(`/admin/partenaires/${id}/status`, { status: technicalStatus })
            return res.data?.data || res.data
          }
          throw e2
        }
      }
      throw err
    }
  },

  /**
   * Supprime une candidature partenaire en base.
   * DELETE /admin/crm/partenaires/${id}
   */
  deletePartenaire: async (id) => {
    try {
      const res = await apiClient.delete(`/admin/crm/partenaires/${id}`)
      return res.data?.data || res.data
    } catch (err) {
      if (err.response?.status === 404) {
        const res = await apiClient.delete(`/admin/partenaires/${id}`)
        return res.data?.data || res.data
      }
      throw err
    }
  },
}

export const getPartenaires = partenaireService.getPartenaires
export const getPartenaireById = partenaireService.getPartenaireById
export const createPartenaireRequest = partenaireService.createPartenaireRequest
export const updatePartenaireStatus = partenaireService.updatePartenaireStatus
export const deletePartenaire = partenaireService.deletePartenaire

export default partenaireService
