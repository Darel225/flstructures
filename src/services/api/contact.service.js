import apiClient from './client'

export const normalizeContactStatus = (status) => {
  const map = {
    'Nouveau': 'nouveau',
    'nouveau': 'nouveau',
    'new': 'nouveau',
    'En attente': 'nouveau',
    'en_attente': 'nouveau',
    'En cours': 'en_cours',
    'en_cours': 'en_cours',
    'in_progress': 'en_cours',
    'Traité': 'traite',
    'traite': 'traite',
    'Traité / Répondu': 'traite',
    'Traité / Traitée': 'traite',
    'Validé': 'traite',
    'valide': 'traite',
    'Clôturé': 'traite',
  }
  return map[status] || status || 'nouveau'
}

/**
 * Service API pour la gestion CRM et publique des messages de contact.
 * Connecté à la table contact_requests de la base MySQL.
 */
export const contactService = {
  /**
   * Envoi d'un message depuis le formulaire de contact public.
   * POST /api/v1/contact avec payload JSON { nom_contact, email, sujet, message, telephone }
   */
  sendContactMessage: async (data) => {
    const payload = {
      nom_contact: data.nom_contact?.trim(),
      email: data.email?.trim(),
      sujet: data.sujet?.trim(),
      message: data.message?.trim(),
      telephone: data.telephone ? data.telephone.trim() : null,
    }

    try {
      const res = await apiClient.post('/contact', payload)
      return res?.data !== undefined ? (res.data?.data || res.data) : res
    } catch (err) {
      if (err.response?.status === 404) {
        try {
          const res = await apiClient.post('/api/v1/contact', payload)
          return res?.data !== undefined ? (res.data?.data || res.data) : res
        } catch (err2) {
          if (err2.response?.status === 404) {
            const res = await apiClient.post('/contacts', payload)
            return res?.data !== undefined ? (res.data?.data || res.data) : res
          }
          throw err2
        }
      }
      throw err
    }
  },

  /**
   * Récupère la liste réelle des messages de contact depuis l'espace Admin.
   * GET /admin/crm/contacts (avec suppression du paramètre status si Tous/all/vide)
   */
  getContacts: async (params = {}) => {
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
      const res = await apiClient.get('/admin/crm/contacts', { params: cleanParams })
      return unpack(res)
    } catch (err) {
      if (err.response?.status === 404) {
        try {
          const fallbackRes = await apiClient.get('/admin/contacts', { params: cleanParams })
          return unpack(fallbackRes)
        } catch (fErr) {
          if (fErr.response?.status === 404) {
            try {
              const crmRes = await apiClient.get('/crm/contacts', { params: cleanParams })
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
   * Récupère le détail d'un message de contact par son ID.
   * GET /admin/crm/contacts/${id}
   */
  getContactById: async (id) => {
    try {
      const res = await apiClient.get(`/admin/crm/contacts/${id}`)
      const body = res?.data !== undefined ? res.data : res
      return body?.data?.data || body?.data || body || null
    } catch {
      try {
        const fallbackRes = await apiClient.get(`/admin/contacts/${id}`)
        const body = fallbackRes?.data !== undefined ? fallbackRes.data : fallbackRes
        return body?.data?.data || body?.data || body || null
      } catch {
        return null
      }
    }
  },

  /**
   * Met à jour le statut d'un message de contact en base.
   * POST vers /admin/crm/contacts/${id}/status avec { status: technicalStatus }.
   * AUCUN mock statique : l'erreur est levée si l'API échoue.
   */
  updateContactStatus: async (id, status) => {
    const technicalStatus = normalizeContactStatus(status)

    try {
      const res = await apiClient.post(`/admin/crm/contacts/${id}/status`, { status: technicalStatus })
      return res?.data !== undefined ? (res.data?.data || res.data) : res
    } catch (err) {
      if (err.response?.status === 405) {
        const res = await apiClient.patch(`/admin/crm/contacts/${id}/status`, { status: technicalStatus })
        return res?.data !== undefined ? (res.data?.data || res.data) : res
      }
      if (err.response?.status === 404) {
        try {
          const res = await apiClient.post(`/admin/contacts/${id}/status`, { status: technicalStatus })
          return res?.data !== undefined ? (res.data?.data || res.data) : res
        } catch (e2) {
          if (e2.response?.status === 405) {
            const res = await apiClient.patch(`/admin/contacts/${id}/status`, { status: technicalStatus })
            return res?.data !== undefined ? (res.data?.data || res.data) : res
          }
          if (e2.response?.status === 404) {
            try {
              const res = await apiClient.put(`/crm/contacts/${id}/status`, { status: technicalStatus })
              return res?.data !== undefined ? (res.data?.data || res.data) : res
            } catch (e3) {
              if (e3.response?.status === 405) {
                const res = await apiClient.patch(`/crm/contacts/${id}/status`, { status: technicalStatus })
                return res?.data !== undefined ? (res.data?.data || res.data) : res
              }
              throw e3
            }
          }
          throw e2
        }
      }
      throw err
    }
  },

  /**
   * Supprime un message de contact en base.
   * DELETE /admin/crm/contacts/${id}
   */
  deleteContact: async (id) => {
    try {
      const res = await apiClient.delete(`/admin/crm/contacts/${id}`)
      return res?.data !== undefined ? (res.data?.data || res.data) : res
    } catch (err) {
      if (err.response?.status === 404) {
        try {
          const res = await apiClient.delete(`/admin/contacts/${id}`)
          return res?.data !== undefined ? (res.data?.data || res.data) : res
        } catch (e2) {
          if (e2.response?.status === 404) {
            const res = await apiClient.delete(`/crm/contacts/${id}`)
            return res?.data !== undefined ? (res.data?.data || res.data) : res
          }
          throw e2
        }
      }
      throw err
    }
  },
}

export const sendContactMessage = contactService.sendContactMessage
export const getContacts = contactService.getContacts
export const getContactById = contactService.getContactById
export const updateContactStatus = contactService.updateContactStatus
export const deleteContact = contactService.deleteContact

export default contactService
