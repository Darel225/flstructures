import apiClient from './client'

export const normalizeHebergementStatus = (status) => {
  const map = {
    'En attente': 'en_attente',
    'en_attente': 'en_attente',
    'En cours': 'en_cours',
    'en_cours': 'en_cours',
    'Validés': 'valide',
    'Validé': 'valide',
    'valide': 'valide',
    'Rejetés': 'rejete',
    'Rejeté': 'rejete',
    'rejete': 'rejete',
  }
  return map[status] || status || 'en_attente'
}

/**
 * Extrait le nom de la résidence depuis le message ou la propriété
 */
export const getResidenceName = (item) => {
  if (item?.residence_nom) return item.residence_nom
  if (item?.residence_ciblee) return item.residence_ciblee
  const match = item?.message?.match(/\[Résidence\s*:\s*([^|\]]+)/i)
  if (match) return match[1].trim()
  if (item?.type_residence) return item.type_residence
  if (item?.residence) return item.residence
  return 'Résidence générale / Non spécifiée'
}

/**
 * Nettoie le message pour retirer le tag technique [Résidence : ... | Tél : ...]
 */
export const getCleanMessage = (message) => {
  if (!message) return 'Aucune précision particulière.'
  return message.replace(/\[Résidence\s*:[^\]]+\]\s*/i, '').trim() || 'Aucune précision particulière.'
}

/**
 * Service API pour la gestion CRM des réservations de séjours et hébergements B2B.
 * Connecté à la table MySQL hebergement_requests.
 */
export const hebergementRequestService = {
  /**
   * Création d'une demande de réservation de séjour.
   * POST /api/v1/crm/hebergements (avec fallbacks)
   */
  createHebergementRequest: async (data) => {
    const payload = {
      entreprise: data.entreprise?.trim(),
      nom_contact: data.nom_contact?.trim(),
      email: data.email?.trim(),
      telephone: data.telephone ? data.telephone.trim() : null,
      residence: data.residence?.trim() || data.type_residence?.trim(),
      type_residence: data.type_residence?.trim() || data.residence?.trim(),
      dates_sejour: data.dates_sejour?.trim(),
      date_debut: data.date_debut || null,
      date_fin: data.date_fin || null,
      nombre_personnes: Number(data.nombre_personnes) || 1,
      message: data.message?.trim() || data.details?.trim() || null,
    }

    try {
      const res = await apiClient.post('/crm/hebergements', payload)
      return res?.data !== undefined ? (res.data?.data || res.data) : res
    } catch (err) {
      if (err.response?.status === 404) {
        try {
          const res = await apiClient.post('/api/v1/crm/hebergements', payload)
          return res?.data !== undefined ? (res.data?.data || res.data) : res
        } catch (err2) {
          if (err2.response?.status === 404) {
            try {
              const res = await apiClient.post('/hebergement-requests', payload)
              return res?.data !== undefined ? (res.data?.data || res.data) : res
            } catch (err3) {
              if (err3.response?.status === 404) {
                const res = await apiClient.post('/admin/crm/hebergements', payload)
                return res?.data !== undefined ? (res.data?.data || res.data) : res
              }
              throw err3
            }
          }
          throw err2
        }
      }
      throw err
    }
  },

  /**
   * Récupère la liste réelle des demandes d'hébergement.
   * GET /admin/crm/hebergements (params: { status, search })
   */
  getHebergementRequests: async (params = {}) => {
    const cleanParams = { ...params }
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
      if (Array.isArray(body)) return body
      if (Array.isArray(body?.data)) return body.data
      if (Array.isArray(body?.data?.data)) return body.data.data
      return []
    }

    try {
      const res = await apiClient.get('/admin/crm/hebergements', { params: cleanParams })
      return unpack(res)
    } catch (err) {
      if (err.response?.status === 404) {
        try {
          const fallbackRes = await apiClient.get('/crm/hebergements', { params: cleanParams })
          return unpack(fallbackRes)
        } catch (fErr) {
          if (fErr.response?.status === 404) {
            try {
              const res = await apiClient.get('/admin/hebergements/requests', { params: cleanParams })
              return unpack(res)
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
   * Récupère le détail d'une réservation de séjour par son ID.
   * GET /admin/crm/hebergements/${id}
   */
  getHebergementRequestById: async (id) => {
    try {
      const res = await apiClient.get(`/admin/crm/hebergements/${id}`)
      const body = res?.data !== undefined ? res.data : res
      return body?.data?.data || body?.data || body || null
    } catch {
      try {
        const fallbackRes = await apiClient.get(`/crm/hebergements/${id}`)
        const body = fallbackRes?.data !== undefined ? fallbackRes.data : fallbackRes
        return body?.data?.data || body?.data || body || null
      } catch {
        return null
      }
    }
  },

  /**
   * Met à jour le statut d'une réservation de séjour en base.
   * POST /admin/crm/hebergements/${id}/status avec payload { status: technicalStatus }
   */
  updateHebergementRequestStatus: async (id, status) => {
    const technicalStatus = normalizeHebergementStatus(status)

    try {
      const res = await apiClient.post(`/admin/crm/hebergements/${id}/status`, {
        status: technicalStatus,
      })
      return res?.data !== undefined ? (res.data?.data || res.data) : res
    } catch (err) {
      if (err.response?.status === 405) {
        const res = await apiClient.patch(`/admin/crm/hebergements/${id}/status`, {
          status: technicalStatus,
        })
        return res?.data !== undefined ? (res.data?.data || res.data) : res
      }
      if (err.response?.status === 404) {
        try {
          const res = await apiClient.put(`/crm/hebergements/${id}/status`, {
            status: technicalStatus,
          })
          return res?.data !== undefined ? (res.data?.data || res.data) : res
        } catch (e2) {
          if (e2.response?.status === 405) {
            const res = await apiClient.patch(`/crm/hebergements/${id}/status`, {
              status: technicalStatus,
            })
            return res?.data !== undefined ? (res.data?.data || res.data) : res
          }
          throw e2
        }
      }
      throw err
    }
  },

  /**
   * Supprime une demande de réservation de séjour en base.
   * DELETE /admin/crm/hebergements/${id}
   */
  deleteHebergementRequest: async (id) => {
    try {
      const res = await apiClient.delete(`/admin/crm/hebergements/${id}`)
      return res?.data !== undefined ? (res.data?.data || res.data) : res
    } catch (err) {
      if (err.response?.status === 404) {
        const res = await apiClient.delete(`/crm/hebergements/${id}`)
        return res?.data !== undefined ? (res.data?.data || res.data) : res
      }
      throw err
    }
  },
}

export const getHebergementRequests = hebergementRequestService.getHebergementRequests
export const getHebergementRequestById = hebergementRequestService.getHebergementRequestById
export const createHebergementRequest = hebergementRequestService.createHebergementRequest
export const updateHebergementRequestStatus = hebergementRequestService.updateHebergementRequestStatus
export const deleteHebergementRequest = hebergementRequestService.deleteHebergementRequest

export default hebergementRequestService
