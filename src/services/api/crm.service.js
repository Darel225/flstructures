import apiClient from './client'
import devisService from './devis.service'
import partenaireService from './partenaire.service'
import contactService from './contact.service'
import hebergementRequestService from './hebergementRequest.service'

// ---------------------------------------------------------------------------
// JEU DE DONNÉES DE SECOURS RÉALISTE (Mode Démo Résilient)
// ---------------------------------------------------------------------------
const MOCK_DEVIS_DATA = [
  {
    id: 'DEV-2026-001',
    created_at: '2026-10-14T09:30:00Z',
    societe: 'Société Minière d’Ity (SMI)',
    contact_nom: 'Marc Diallo',
    email: 'm.diallo@smi-mining.ci',
    telephone: '+225 07 48 12 34 56',
    type_besoin: 'Base-vie 150 personnes avec réfectoire et infirmerie',
    site_minier: 'Mine d’or d’Ity (Zouan-Hounien)',
    volume_frequence: '14 modules 20ft + 4 modules 40ft',
    details:
      'Installation rapide requise avant la saison des pluies. Isolation thermique renforcée (double laine de roche) et sanitaires autonomes intégrés.',
    fichier_upload_url: 'https://fl-structures.ci/docs/cahier-des-charges-ity.pdf',
    fichier_nom: 'CCTP_BaseVie_Ity_2026_v2.pdf',
    status: 'en_attente',
    budget_estime: '48 500 000 FCFA',
    notes_admin: 'Priorité haute : appel d’offres restreint. Contact pris par WhatsApp.',
  },
  {
    id: 'DEV-2026-002',
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
    fichier_upload_url: 'https://fl-structures.ci/docs/plans-lafigue.pdf',
    fichier_nom: 'Plans_Implantation_Lafigue.pdf',
    status: 'en_cours',
    budget_estime: '22 000 000 FCFA',
    notes_admin: 'Devis technique n°1 envoyé le 14/10. En attente de validation DAF.',
  },
  {
    id: 'DEV-2026-003',
    created_at: '2026-10-11T11:45:00Z',
    societe: 'Perseus Mining Yaouré',
    contact_nom: 'Kouassi Yao',
    email: 'k.yao@perseusmining.com',
    telephone: '+225 07 11 22 33 44',
    type_besoin: 'Chambres VIP individuelles pour consultants géologues',
    site_minier: 'Mine de Yaouré (Angovia / Bouaflé)',
    volume_frequence: '8 modules VIP avec salle d’eau privative',
    details:
      'Finition haut standing : literie hôtelière, split silencieux et chauffe-eau solaire.',
    fichier_upload_url: null,
    fichier_nom: null,
    status: 'valide',
    budget_estime: '19 800 000 FCFA',
    notes_admin: 'Bon de commande n°PO-Yaoure-8874 reçu. Livraison prévue mi-novembre.',
  },
  {
    id: 'DEV-2026-004',
    created_at: '2026-10-09T14:10:00Z',
    societe: 'Roxgold Sango',
    contact_nom: 'Christian Bamba',
    email: 'c.bamba@roxgold.com',
    telephone: '+225 01 23 45 67 89',
    type_besoin: 'Magasin de stockage sécurisé pour pièces détachées',
    site_minier: 'Site de Séguéla',
    volume_frequence: '3 conteneurs 40ft blindés avec rayonnages lourds',
    details:
      'Portes renforcées avec serrures multipoints et ventilation haute forcée.',
    fichier_upload_url: 'https://fl-structures.ci/docs/specs-roxgold.pdf',
    fichier_nom: 'Specifications_Magasin_Securise.pdf',
    status: 'rejete',
    budget_estime: '11 500 000 FCFA',
    notes_admin: 'Capacité de levage sur site insuffisante de leur côté. Proposition reportée.',
  },
  {
    id: 'DEV-2026-005',
    created_at: '2026-10-06T08:30:00Z',
    societe: 'Tongon Gold Mine (Barrick)',
    contact_nom: 'Fatou Traoré',
    email: 'f.traore@barrick.com',
    telephone: '+225 07 98 76 54 32',
    type_besoin: 'Extension du réfectoire minier et cuisine industrielle',
    site_minier: 'Tongon (M’Bengué / Korhogo)',
    volume_frequence: '250 repas simultanés',
    details:
      'Respect strict des normes HACCP, hottes d’extraction inox et chambre froide modulaire.',
    fichier_upload_url: 'https://fl-structures.ci/docs/cahier-cuisine-tongon.pdf',
    fichier_nom: 'CCTP_Restauration_Tongon.pdf',
    status: 'en_attente',
    budget_estime: '62 000 000 FCFA',
    notes_admin: 'Demande majeure. Réunion de cadrage technique à planifier.',
  },
]

const MOCK_HEBERGEMENT_DATA = [
  {
    id: 'HEB-2026-001',
    created_at: '2026-10-14T10:15:00Z',
    entreprise: 'Endeavour Mining',
    nom_contact: 'Sophie Koné',
    email: 's.kone@endeavourmining.com',
    telephone: '+225 05 64 21 89 00',
    dates_sejour: '01 Nov 2026 - 15 Déc 2026',
    date_debut: '2026-11-01',
    date_fin: '2026-12-15',
    nombre_personnes: 8,
    type_residence: 'Résidence Executive - Plateau (4 apts)',
    message:
      'Séjour d’une équipe d’auditeurs financiers et ingénieurs de sécurité. Nous demandons une liaison Wi-Fi fibre haut débit garantie et un service de ménage quotidien.',
    status: 'en_attente',
  },
  {
    id: 'HEB-2026-002',
    created_at: '2026-10-12T15:40:00Z',
    entreprise: 'Perseus Mining',
    nom_contact: 'Dr. Alain Voisin',
    email: 'a.voisin@perseusmining.com',
    telephone: '+225 07 88 99 00 11',
    dates_sejour: '20 Oct 2026 - 30 Oct 2026',
    date_debut: '2026-10-20',
    date_fin: '2026-10-30',
    nombre_personnes: 2,
    type_residence: 'Villa Riviera Golf (VIP)',
    message:
      'Délégation de direction régionale. Accueil VIP aéroport et mise à disposition d’une salle de réunion privative dans la villa.',
    status: 'en_cours',
  },
  {
    id: 'HEB-2026-003',
    created_at: '2026-10-08T09:00:00Z',
    entreprise: 'Société Minière d’Ity (SMI)',
    nom_contact: 'Jean-Luc Kra',
    email: 'jl.kra@smi-mining.ci',
    telephone: '+225 07 45 67 89 01',
    dates_sejour: '15 Oct 2026 - 28 Oct 2026',
    date_debut: '2026-10-15',
    date_fin: '2026-10-28',
    nombre_personnes: 5,
    type_residence: 'Résidence Executive - Marcory Zone 4',
    message:
      'Formation continue des chefs d’équipes exploitation. Proximité de l’aéroport requise.',
    status: 'valide',
  },
  {
    id: 'HEB-2026-004',
    created_at: '2026-10-04T12:00:00Z',
    entreprise: 'Allied Gold Corp',
    nom_contact: 'Gilles Bérubé',
    email: 'g.berube@alliedgold.com',
    telephone: '+225 01 02 03 04 05',
    dates_sejour: '01 Nov 2026 - 05 Nov 2026',
    date_debut: '2026-11-01',
    date_fin: '2026-11-05',
    nombre_personnes: 12,
    type_residence: 'Bases-vie & Appartements multiples',
    message:
      'Recherche d’hébergement groupé complet. Malheureusement hors de notre zone de couverture pour cette date.',
    status: 'rejete',
  },
]

const MOCK_CONTACT_DATA = [
  {
    id: 'CNT-2026-001',
    created_at: '2026-10-14T17:10:00Z',
    nom_contact: 'Dr. Philippe Coulibaly',
    email: 'p.coulibaly@geoconsult-africa.com',
    telephone: '+225 07 89 45 12 00',
    sujet: 'Renseignement sur les fondations modulaires en sol latéritique',
    message:
      'Bonjour, nous intervenons en assistance géotechnique sur un futur projet minier dans l’ouest ivoirien. Nous souhaiterions recevoir vos recommandations de pré-chargement et ancrage au sol pour vos modules 20 et 40 pieds.',
    status: 'nouveau',
  },
  {
    id: 'CNT-2026-002',
    created_at: '2026-10-12T09:25:00Z',
    nom_contact: 'Élise N’Guessan',
    email: 'e.nguessan@groupe-bceao.ci',
    telephone: '+225 05 12 34 56 78',
    sujet: 'Visite de la résidence d’affaires au Plateau',
    message:
      'Bonjour, nous organisons une mission de 3 semaines pour 4 experts internationaux début décembre. Est-il possible de visiter vos appartements du Plateau cette semaine ? Merci de nous rappeler.',
    status: 'en_cours',
  },
  {
    id: 'CNT-2026-003',
    created_at: '2026-10-09T13:40:00Z',
    nom_contact: 'Yaya Sanogo',
    email: 'yaya.sanogo@sanogotrading.ci',
    telephone: '+225 01 99 88 77 66',
    sujet: 'Demande de catalogue général et mercuriale de prix',
    message:
      'Bonjour Monsieur le Directeur, pourriez-vous me faire parvenir votre plaquette commerciale à jour ainsi que la grille tarifaire de location et vente de conteneurs aménagés ? Cordialement.',
    status: 'traite',
  },
]

// Mémoire de travail locale en cas de mode démo
let localDevis = [...MOCK_DEVIS_DATA]
let localHebergements = [...MOCK_HEBERGEMENT_DATA]
let localContacts = [...MOCK_CONTACT_DATA]

/**
 * Service API pour la gestion CRM des 4 flux de demandes de FL Structures.
 */
export const crmService = {
  // -------------------------------------------------------------------------
  // 1. DEVIS STRUCTURES & MINES (table: devis_requests)
  // -------------------------------------------------------------------------
  getDevisRequests: (filters = {}) => devisService.getDevisRequests(filters),
  getDevisById: (id) => devisService.getDevisRequestById(id),
  createDevisRequest: (formData) => devisService.createDevisRequest(formData),
  updateDevisStatus: (id, status) => devisService.updateDevisStatus(id, status),
  deleteDevisRequest: (id) => devisService.deleteDevisRequest(id),

  // -------------------------------------------------------------------------
  // 2. RÉSERVATIONS SÉJOURS & HÉBERGEMENT (table: hebergement_requests)
  // -------------------------------------------------------------------------
  getHebergementRequests: (filters = {}) =>
    hebergementRequestService.getHebergementRequests(filters),

  getHebergementRequestById: (id) =>
    hebergementRequestService.getHebergementRequestById(id),

  updateHebergementRequestStatus: (id, status) =>
    hebergementRequestService.updateHebergementRequestStatus(id, status),

  deleteHebergementRequest: (id) =>
    hebergementRequestService.deleteHebergementRequest(id),

  // -------------------------------------------------------------------------
  // 3. CANDIDATURES PARTENAIRES (table: partenaire_requests)
  // -------------------------------------------------------------------------
  getPartenaireRequests: (filters = {}) => partenaireService.getPartenaires(filters),
  getPartenaireRequestById: (id) => partenaireService.getPartenaireById(id),
  createPartenaireRequest: (formData) => partenaireService.createPartenaireRequest(formData),
  updatePartenaireStatus: (id, status) => partenaireService.updatePartenaireStatus(id, status),
  deletePartenaire: (id) => partenaireService.deletePartenaire(id),

  // -------------------------------------------------------------------------
  // 4. MESSAGES DE CONTACT (table: contact_requests)
  // -------------------------------------------------------------------------
  getContactRequests: async (filters = {}) => {
    return contactService.getContacts(filters)
  },

  getContactRequestById: async (id) => {
    return contactService.getContactById(id)
  },

  updateContactStatus: async (id, status) => {
    return contactService.updateContactStatus(id, status)
  },

  deleteContact: async (id) => {
    return contactService.deleteContact(id)
  },

  // -------------------------------------------------------------------------
  // 5. COMPTEURS SYNCHRONISÉS POUR LES BADGES DE LA SIDEBAR
  // -------------------------------------------------------------------------
  getCrmCounts: async () => {
    try {
      const response = await apiClient.get('/admin/crm/counts')
      const body = response?.data !== undefined ? response.data : response
      const data = body?.data || body
      return {
        ...data,
        devis_pending: data.devis_pending ?? data.devis ?? 0,
        reservations_pending: data.reservations_pending ?? data.hebergements ?? 0,
        partenaires_pending: data.partenaires_pending ?? data.partenaires ?? 0,
        contacts_pending: data.contacts_pending ?? data.contacts ?? 0,
        devis: data.devis_pending ?? data.devis ?? 0,
        hebergements: data.reservations_pending ?? data.hebergements ?? 0,
        partenaires: data.partenaires_pending ?? data.partenaires ?? 0,
        contacts: data.contacts_pending ?? data.contacts ?? 0,
      }
    } catch {
      try {
        const response2 = await apiClient.get('/crm/counts')
        const body2 = response2?.data !== undefined ? response2.data : response2
        const data2 = body2?.data || body2
        return {
          ...data2,
          devis_pending: data2.devis_pending ?? data2.devis ?? 0,
          reservations_pending: data2.reservations_pending ?? data2.hebergements ?? 0,
          partenaires_pending: data2.partenaires_pending ?? data2.partenaires ?? 0,
          contacts_pending: data2.contacts_pending ?? data2.contacts ?? 0,
          devis: data2.devis_pending ?? data2.devis ?? 0,
          hebergements: data2.reservations_pending ?? data2.hebergements ?? 0,
          partenaires: data2.partenaires_pending ?? data2.partenaires ?? 0,
          contacts: data2.contacts_pending ?? data2.contacts ?? 0,
        }
      } catch {
        const counts = {
          devis_pending: localDevis.filter((d) => d.status === 'en_attente').length,
          reservations_pending: localHebergements.filter((h) => h.status === 'en_attente').length,
          partenaires_pending: 0,
          contacts_pending: localContacts.filter((c) => c.status === 'nouveau').length,
        }
        return {
          ...counts,
          devis: counts.devis_pending,
          hebergements: counts.reservations_pending,
          partenaires: counts.partenaires_pending,
          contacts: counts.contacts_pending,
          total:
            counts.devis_pending +
            counts.reservations_pending +
            counts.partenaires_pending +
            counts.contacts_pending,
        }
      }
    }
  },
}

export default crmService
