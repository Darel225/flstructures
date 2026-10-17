/**
 * Helper de synchronisation globale pour rafraîchir instantanément (0 ms)
 * toutes les métriques CRM, les flux d'alertes et les compteurs de la Sidebar.
 */
export const syncCrmMetrics = async (queryClient) => {
  if (!queryClient) return
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['admin-dashboard'], refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: ['crm-counts'], refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: ['crm', 'counts'], refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: ['admin-devis'], refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: ['devis'], refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: ['crm', 'devis'], refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: ['admin-hebergements-requests'], refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: ['crm', 'hebergements'], refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: ['admin-partenaires'], refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: ['crm', 'partenaires'], refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: ['admin-contacts'], refetchType: 'all' }),
    queryClient.invalidateQueries({ queryKey: ['crm', 'contacts'], refetchType: 'all' }),
  ])
}

export default syncCrmMetrics
