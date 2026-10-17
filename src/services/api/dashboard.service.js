import apiClient from './client'

/**
 * Récupère les données consolidées du Dashboard d'administration.
 * GET /admin/dashboard
 */
export const getDashboardData = async () => {
  const res = await apiClient.get('/admin/dashboard')
  const body = res?.data !== undefined ? res.data : res
  return body?.data || body
}

/**
 * Récupère les compteurs en attente pour le CRM et la navigation latérale.
 * GET /admin/crm/counts
 */
export const getCrmCounts = async () => {
  const res = await apiClient.get('/admin/crm/counts')
  const body = res?.data !== undefined ? res.data : res
  return body?.data || body
}

export const dashboardService = {
  getDashboardData,
  getCrmCounts,
}

export default dashboardService
