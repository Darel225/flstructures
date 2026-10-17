import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ReservationsIcon,
  SearchIcon,
  CalendarIcon,
  BuildingIcon,
  MailIcon,
  PhoneIcon,
  EyeIcon,
  TrashIcon,
  UserIcon,
} from '../../../components/admin/icons/AdminIcons'
import { toast } from 'sonner'

import {
  getHebergementRequests,
  updateHebergementRequestStatus,
  deleteHebergementRequest,
  normalizeHebergementStatus,
  getResidenceName,
  getCleanMessage,
} from '../../../services/api/hebergementRequest.service'
import { syncCrmMetrics } from '../../../services/api/crmQuerySync'
import DataTable from '../../../components/admin/ui/DataTable'
import TablePagination from '../../../components/admin/ui/TablePagination'
import SlideOverDrawer from '../../../components/admin/ui/SlideOverDrawer'
import ConfirmDialog from '../../../components/admin/ui/ConfirmDialog'

// eslint-disable-next-line react-refresh/only-export-components
export { getResidenceName, getCleanMessage }

const STATUS_FILTERS = [
  { id: 'all', label: 'Tous' },
  { id: 'en_attente', label: 'En attente' },
  { id: 'en_cours', label: 'En cours' },
  { id: 'valide', label: 'Validés' },
  { id: 'rejete', label: 'Rejetés' },
]

/**
 * Formatage de la date en "jj/mm/aaaa" à partir de created_at
 */
const formatHebergementDate = (dateStr) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Couleurs pour le sélecteur / badge de statut
 */
const getStatusStyle = (status) => {
  const norm = normalizeHebergementStatus(status)
  switch (norm) {
    case 'en_attente':
      return 'bg-amber-50 text-amber-800 border-amber-300 focus:ring-amber-500'
    case 'en_cours':
      return 'bg-blue-50 text-blue-800 border-blue-300 focus:ring-blue-500'
    case 'valide':
      return 'bg-emerald-50 text-emerald-800 border-emerald-300 focus:ring-emerald-500'
    case 'rejete':
      return 'bg-red-50 text-red-700 border-red-300 focus:ring-red-500'
    default:
      return 'bg-gray-50 text-gray-700 border-gray-300'
  }
}

export default function HebergementRequestsPage() {
  const queryClient = useQueryClient()

  // Filtres et pagination
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortColumn, setSortColumn] = useState('created_at')
  const [sortDirection, setSortDirection] = useState('desc')

  // Panneau latéral et modale
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: () => {},
  })

  // Récupération réelle des réservations via TanStack Query (AUCUN mock)
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['admin-hebergements-requests', statusFilter, search],
    queryFn: () => getHebergementRequests({ status: statusFilter, search }),
  })

  // Déballage garanti en tableau JavaScript
  const rawList = useMemo(() => {
    if (Array.isArray(requests)) return requests
    if (Array.isArray(requests?.data)) return requests.data
    if (Array.isArray(requests?.data?.data)) return requests.data.data
    return []
  }, [requests])

  // Changement de statut synchronisé avec l'API, le Drawer et le Tableau
  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await updateHebergementRequestStatus(requestId, newStatus)

      // Mise à jour immédiate du Drawer si ouvert
      setSelectedRequest((prev) => {
        if (prev && String(prev.id) === String(requestId)) {
          return { ...prev, status: newStatus }
        }
        return prev
      })

      // Invalidation immédiate de toutes les métriques CRM et du Dashboard (0 ms)
      await syncCrmMetrics(queryClient)
      await queryClient.refetchQueries({ queryKey: ['admin-hebergements-requests'] })

      toast.success('Statut de la réservation mis à jour avec succès')
    } catch (err) {
      console.error('Erreur changement statut réservation:', err)
      toast.error('Erreur lors de la mise à jour du statut')
    }
  }

  // Mutation de suppression
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteHebergementRequest(id),
    onSuccess: async () => {
      await syncCrmMetrics(queryClient)
      await queryClient.refetchQueries({ queryKey: ['admin-hebergements-requests'] })
      toast.success('Demande de séjour supprimée avec succès.')
      setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
      if (isDrawerOpen) setIsDrawerOpen(false)
    },
    onError: () => {
      toast.error('Erreur lors de la suppression de la réservation.')
    },
  })

  const handleOpenDetail = (item) => {
    setSelectedRequest(item)
    setIsDrawerOpen(true)
  }

  const handleDeletePrompt = (item) => {
    setConfirmDialog({
      isOpen: true,
      title: `Supprimer la réservation de ${item.entreprise} ?`,
      message: `Voulez-vous supprimer définitivement la réservation de séjour de "${item.entreprise}" (${item.nom_contact}) ? Cette action est irréversible.`,
      action: () => deleteMutation.mutate(item.id),
    })
  }

  // Filtrage côté client robuste pour l'onglet "Tous" et la recherche
  const displayedRequests = useMemo(() => {
    return rawList.filter((item) => {
      // 1. Filtre par statut
      const isAll =
        !statusFilter ||
        statusFilter === 'all' ||
        statusFilter === 'tous' ||
        statusFilter === 'Tous'
      const matchesStatus =
        isAll ||
        item.status === statusFilter ||
        normalizeHebergementStatus(item.status) === statusFilter

      // 2. Filtre par recherche
      const q = (search || '').toLowerCase().trim()
      const matchesSearch =
        !q ||
        item.entreprise?.toLowerCase().includes(q) ||
        item.nom_contact?.toLowerCase().includes(q) ||
        item.contact?.toLowerCase().includes(q) ||
        item.email?.toLowerCase().includes(q) ||
        item.telephone?.toLowerCase().includes(q) ||
        item.residence?.toLowerCase().includes(q) ||
        item.type_residence?.toLowerCase().includes(q) ||
        item.dates_sejour?.toLowerCase().includes(q) ||
        item.message?.toLowerCase().includes(q) ||
        String(item.id).toLowerCase().includes(q)

      return matchesStatus && matchesSearch
    })
  }, [rawList, statusFilter, search])

  // Tri
  const sortedData = useMemo(() => {
    return [...displayedRequests].sort((a, b) => {
      const valA = a[sortColumn] || ''
      const valB = b[sortColumn] || ''
      if (sortDirection === 'asc') return valA > valB ? 1 : -1
      return valA < valB ? 1 : -1
    })
  }, [displayedRequests, sortColumn, sortDirection])

  // Pagination côté client
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return sortedData.slice(startIndex, startIndex + pageSize)
  }, [sortedData, currentPage, pageSize])

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnKey)
    }
  }

  // Colonnes du tableau de bord
  const columns = [
    {
      header: 'DATE',
      accessor: 'created_at',
      sortable: true,
      className: 'w-28 whitespace-nowrap',
      cell: (item) => (
        <span className="font-semibold text-xs text-[#111111] tabular-nums block">
          {formatHebergementDate(item.created_at)}
        </span>
      ),
    },
    {
      header: 'ENTREPRISE & CONTACT',
      accessor: 'entreprise',
      sortable: true,
      cell: (item) => (
        <div>
          <span className="font-semibold text-neutral-900 block">
            {item.entreprise}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-0.5">
            <span>{item.nom_contact || item.contact || '—'}</span> • <span>{item.email}</span>
          </div>
          {/* Badge Résidence ciblée */}
          <div className="mt-1">
            <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-700">
              🏢 {getResidenceName(item)}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'PÉRIODE SOUHAITÉE',
      accessor: 'dates_sejour',
      sortable: true,
      cell: (item) => (
        <div className="flex items-center gap-1.5 text-[#333333]">
          <CalendarIcon size={14} className="text-[#C0392B] shrink-0" />
          <span className="font-semibold text-xs text-[#111111] truncate max-w-[220px]" title={item.dates_sejour}>
            {item.dates_sejour || '—'}
          </span>
        </div>
      ),
    },
    {
      header: 'EFFECTIF',
      accessor: 'nombre_personnes',
      sortable: true,
      className: 'w-28 text-center',
      cell: (item) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-[#E8E4DF] text-xs font-bold text-[#111111] shadow-2xs">
          <UserIcon size={12} className="text-[#777777]" />
          <span>{item.nombre_personnes || 1} pers.</span>
        </span>
      ),
    },
    {
      header: 'STATUT',
      accessor: 'status',
      sortable: true,
      className: 'w-36',
      cell: (item) => (
        <select
          value={normalizeHebergementStatus(item.status)}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            e.stopPropagation()
            handleStatusChange(item.id, e.target.value)
          }}
          className={`text-[11.5px] font-semibold rounded-full px-2.5 py-1 border cursor-pointer focus:outline-none transition-colors shadow-2xs ${getStatusStyle(
            item.status
          )}`}
        >
          <option value="en_attente">En attente</option>
          <option value="en_cours">En cours</option>
          <option value="valide">Validé</option>
          <option value="rejete">Rejeté</option>
        </select>
      ),
    },
    {
      header: 'ACTIONS',
      accessor: 'actions',
      className: 'w-24 text-right',
      cell: (item) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => handleOpenDetail(item)}
            className="p-2 rounded-lg text-[#777777] hover:text-[#C0392B] hover:bg-red-50 transition-colors cursor-pointer"
            title="Consulter et instruire la réservation"
          >
            <EyeIcon size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleDeletePrompt(item)}
            className="p-2 rounded-lg text-[#777777] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            title="Supprimer cette réservation"
          >
            <TrashIcon size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* 1. Bandeau supérieur */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E8E4DF]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-semibold tracking-wide mb-2 border border-blue-200">
            <ReservationsIcon size={14} />
            <span>Pôle Résidences Corporates</span>
          </div>
          <h1 className="fl-admin-title-page text-[#111111]">
            Réservations Séjours & Bases-Vie
          </h1>
          <p className="fl-admin-body text-[#666666] mt-1">
            Supervision, affectation et suivi des demandes de séjours pour cadres miniers, auditeurs et consultants.
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="relative w-full sm:w-72">
          <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999999] pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher entreprise, contact..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full h-11 pl-10 pr-3 text-sm bg-white border border-[#E8E4DF] rounded-xl text-[#111111] placeholder-[#999999] focus:outline-none focus:border-[#C0392B] focus:ring-2 focus:ring-[#C0392B]/15 transition-all"
          />
        </div>
      </div>

      {/* 2. Filtres par statut */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-[#E8E4DF] pb-0 scrollbar-none">
        {STATUS_FILTERS.map((filter) => {
          const isActive = statusFilter === filter.id
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => {
                setStatusFilter(filter.id)
                setCurrentPage(1)
              }}
              className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors relative border-b-2 cursor-pointer ${
                isActive
                  ? 'border-[#C0392B] text-[#C0392B] font-bold -mb-[1px]'
                  : 'border-transparent text-[#666666] hover:text-[#111111]'
              }`}
            >
              {filter.label}
            </button>
          )
        })}
      </div>

      {/* 3. Tableau de données */}
      <DataTable
        columns={columns}
        data={paginatedData}
        isLoading={isLoading}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        onRowClick={handleOpenDetail}
        emptyTitle="Aucune demande de séjour"
        emptyMessage="Aucune réservation d’hébergement ne correspond à vos filtres."
        emptyActionLabel="Réinitialiser les filtres"
        onEmptyAction={() => {
          setStatusFilter('all')
          setSearch('')
        }}
      />

      {/* 4. Pagination */}
      <TablePagination
        currentPage={currentPage}
        totalPages={Math.ceil(sortedData.length / pageSize) || 1}
        pageSize={pageSize}
        totalItems={sortedData.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      {/* 5. Drawer d'Instruction & Détails */}
      <SlideOverDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={
          selectedRequest ? `Séjour #${selectedRequest.id}` : 'Fiche de réservation'
        }
        subtitle={selectedRequest ? selectedRequest.entreprise : ''}
        footer={
          selectedRequest && (
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={() => handleDeletePrompt(selectedRequest)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
              >
                <TrashIcon size={14} />
                <span>Supprimer</span>
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedRequest.email}?subject=RE: Réservation Séjour ${encodeURIComponent(
                    selectedRequest.entreprise || ''
                  )}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#C0392B] hover:bg-[#A93226] shadow-sm transition-all cursor-pointer"
                >
                  <MailIcon size={14} />
                  <span>Répondre par Email</span>
                </a>
              </div>
            </div>
          )
        }
      >
        {selectedRequest && (
          <div className="space-y-6">
            {/* Statut & Date */}
            <div className="p-4 rounded-2xl bg-[#FAF8F6] border border-[#E8E4DF] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777] block">
                  Statut de la réservation
                </span>
                <div className="mt-1">
                  <select
                    value={normalizeHebergementStatus(selectedRequest.status)}
                    onChange={(e) => handleStatusChange(selectedRequest.id, e.target.value)}
                    className={`text-xs font-bold rounded-full px-3 py-1.5 border cursor-pointer focus:outline-none transition-colors shadow-2xs ${getStatusStyle(
                      selectedRequest.status
                    )}`}
                  >
                    <option value="en_attente">En attente</option>
                    <option value="en_cours">En cours</option>
                    <option value="valide">Validé</option>
                    <option value="rejete">Rejeté</option>
                  </select>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777] block">
                  Date de réception
                </span>
                <span className="font-mono text-xs text-[#111111] font-bold block mt-1">
                  {formatHebergementDate(selectedRequest.created_at)}
                </span>
              </div>
            </div>

            {/* Entreprise & Contact */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#777777] flex items-center gap-1.5">
                <BuildingIcon size={14} className="text-[#666666]" />
                <span>Société & Responsable Séjour</span>
              </h3>
              <div className="p-4 rounded-2xl bg-white border border-[#E8E4DF] space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#777777]">Entreprise :</span>
                  <span className="font-bold text-[#111111] text-sm">
                    {selectedRequest.entreprise}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#777777]">Interlocuteur :</span>
                  <span className="font-medium text-[#111111]">
                    {selectedRequest.nom_contact || selectedRequest.contact || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#777777]">Email direct :</span>
                  <a
                    href={`mailto:${selectedRequest.email}`}
                    className="text-[#C0392B] hover:underline flex items-center gap-1.5 font-bold"
                  >
                    <MailIcon size={13} />
                    <span>{selectedRequest.email}</span>
                  </a>
                </div>
                {selectedRequest.telephone && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#777777]">Téléphone :</span>
                    <a
                      href={`tel:${selectedRequest.telephone}`}
                      className="font-mono text-[#111111] hover:text-[#C0392B] flex items-center gap-1.5 font-bold"
                    >
                      <PhoneIcon size={13} />
                      <span>{selectedRequest.telephone}</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Période, Résidence & Effectif */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#777777] flex items-center gap-1.5">
                <CalendarIcon size={14} className="text-[#666666]" />
                <span>Détails du Séjour</span>
              </h3>
              <div className="p-4 rounded-2xl bg-white border border-[#E8E4DF] space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#777777]">Période souhaitée :</span>
                  <span className="font-bold text-[#111111] flex items-center gap-1.5">
                    <CalendarIcon size={13} className="text-[#C0392B]" />
                    <span>{selectedRequest.dates_sejour}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#777777]">Résidence ciblée :</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 border border-neutral-200/80 text-xs font-bold text-neutral-800">
                    🏢 {getResidenceName(selectedRequest)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#777777]">Effectif total :</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-[#C0392B] font-bold">
                    <UserIcon size={12} />
                    <span>{selectedRequest.nombre_personnes || 1} personne(s)</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Message particulier / Besoins spécifiques */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777] block">
                Besoins spécifiques / Précisions
              </span>
              <div className="p-4 rounded-xl bg-[#FAF8F6] text-xs sm:text-sm text-[#222222] leading-relaxed whitespace-pre-line border border-[#E8E4DF]">
                {getCleanMessage(selectedRequest.message || selectedRequest.details)}
              </div>
            </div>
          </div>
        )}
      </SlideOverDrawer>

      {/* 6. Boîte de confirmation */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
          confirmDialog.action()
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
        }}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant="danger"
        confirmText="Confirmer la suppression"
      />
    </div>
  )
}
