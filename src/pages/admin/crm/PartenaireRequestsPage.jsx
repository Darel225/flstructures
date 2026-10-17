import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  PartenairesIcon,
  SearchIcon,
  DownloadIcon,
  BuildingIcon,
  MailIcon,
  PhoneIcon,
  PdfIcon,
  EyeIcon,
  WrenchIcon,
  TrashIcon,
} from '../../../components/admin/icons/AdminIcons'
import { ExternalLink, CalendarIcon } from 'lucide-react'
import { toast } from 'sonner'

import {
  getPartenaires,
  updatePartenaireStatus,
  deletePartenaire,
  normalizePartenaireStatus,
} from '../../../services/api/partenaire.service'
import { syncCrmMetrics } from '../../../services/api/crmQuerySync'
import DataTable from '../../../components/admin/ui/DataTable'
import { resolveImageUrl } from '../../../utils/imageUrl'
import TablePagination from '../../../components/admin/ui/TablePagination'
import SlideOverDrawer from '../../../components/admin/ui/SlideOverDrawer'
import ConfirmDialog from '../../../components/admin/ui/ConfirmDialog'

const STATUS_FILTERS = [
  { id: 'all', label: 'Tous' },
  { id: 'en_attente', label: 'En attente' },
  { id: 'en_evaluation', label: 'En évaluation' },
  { id: 'valide', label: 'Agréés / Validés' },
  { id: 'rejete', label: 'Non retenus' },
]

function formatPartenaireDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function getDossierUrl(url) {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const clean = url.startsWith('/') ? url : `/${url}`
  return resolveImageUrl(clean)
}

function getStatusStyle(rawStatus) {
  const status = normalizePartenaireStatus(rawStatus)
  let style = 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'

  if (status === 'en_evaluation') {
    style = 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100'
  } else if (status === 'valide') {
    style = 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
  } else if (status === 'rejete') {
    style = 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
  }

  return style
}

export default function PartenaireRequestsPage() {
  const queryClient = useQueryClient()

  // Filtres et pagination
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortColumn, setSortColumn] = useState('created_at')
  const [sortDirection, setSortDirection] = useState('desc')

  // Tiroir Détails / Instruction
  const [selectedPartenaire, setSelectedPartenaire] = useState(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Dialogue de confirmation
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: () => {},
  })

  // Récupération réelle des candidatures partenaires depuis la table partenaire_requests
  const { data: partenaires = [], isLoading } = useQuery({
    queryKey: ['admin-partenaires', statusFilter, search],
    queryFn: () => getPartenaires({ status: statusFilter, search }),
  })

  // 1. Extraction sécurisée garantie en tableau JavaScript
  const rawList = useMemo(() => {
    if (Array.isArray(partenaires)) return partenaires
    if (Array.isArray(partenaires?.data)) return partenaires.data
    if (Array.isArray(partenaires?.data?.data)) return partenaires.data.data
    return []
  }, [partenaires])

  // Changement de statut synchronisé avec l'API, le Drawer et le Tableau
  const handleStatusChange = async (dossierId, newStatus) => {
    try {
      await updatePartenaireStatus(dossierId, newStatus)

      // Mise à jour immédiate du Drawer si ouvert
      setSelectedPartenaire((prev) => {
        if (prev && String(prev.id) === String(dossierId)) {
          return { ...prev, status: newStatus }
        }
        return prev
      })

      // Invalidation immédiate de toutes les métriques CRM et du Dashboard (0 ms)
      await syncCrmMetrics(queryClient)
      await queryClient.refetchQueries({ queryKey: ['admin-partenaires'] })

      toast.success('Statut partenaire mis à jour avec succès')
    } catch (err) {
      console.error('Erreur changement statut:', err)
      toast.error('Erreur lors de la mise à jour du statut')
    }
  }

  // Mutation de suppression
  const deleteMutation = useMutation({
    mutationFn: (id) => deletePartenaire(id),
    onSuccess: async () => {
      await syncCrmMetrics(queryClient)
      await queryClient.refetchQueries({ queryKey: ['admin-partenaires'] })
      toast.success('Candidature partenaire supprimée avec succès.')
      setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
      if (isDrawerOpen) setIsDrawerOpen(false)
    },
    onError: () => {
      toast.error('Erreur lors de la suppression de la candidature.')
    },
  })

  const handleOpenDetail = (item) => {
    setSelectedPartenaire(item)
    setIsDrawerOpen(true)
  }

  const handleDeletePrompt = (item) => {
    setConfirmDialog({
      isOpen: true,
      title: `Supprimer la candidature ${item.societe} ?`,
      message: `Voulez-vous supprimer définitivement le dossier partenaire de "${item.societe}" ? Cette action est irréversible.`,
      action: () => deleteMutation.mutate(item.id),
    })
  }

  // 2. Filtrage client robuste pour l'onglet "Tous" et la recherche
  const displayedPartenaires = useMemo(() => {
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
        normalizePartenaireStatus(item.status) === statusFilter

      // 2. Filtre par recherche
      const q = (search || '').toLowerCase().trim()
      const matchesSearch =
        !q ||
        item.societe?.toLowerCase().includes(q) ||
        item.contact_nom?.toLowerCase().includes(q) ||
        item.contact?.toLowerCase().includes(q) ||
        item.type_service?.toLowerCase().includes(q) ||
        item.email?.toLowerCase().includes(q) ||
        item.telephone?.toLowerCase().includes(q)

      return matchesStatus && matchesSearch
    })
  }, [rawList, statusFilter, search])

  // Tri
  const sortedData = useMemo(() => {
    return [...displayedPartenaires].sort((a, b) => {
      const valA = a[sortColumn] || ''
      const valB = b[sortColumn] || ''
      if (sortDirection === 'asc') return valA > valB ? 1 : -1
      return valA < valB ? 1 : -1
    })
  }, [displayedPartenaires, sortColumn, sortDirection])

  // Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return sortedData.slice(startIndex, startIndex + pageSize)
  }, [sortedData, currentPage, pageSize])

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  // Colonnes du tableau
  const columns = [
    {
      header: 'DATE',
      accessor: 'created_at',
      sortable: true,
      className: 'w-28 whitespace-nowrap',
      cell: (item) => (
        <span className="font-semibold text-xs text-[#111111] tabular-nums block">
          {formatPartenaireDate(item.created_at)}
        </span>
      ),
    },
    {
      header: 'SOCIÉTÉ & INTERLOCUTEUR',
      accessor: 'societe',
      sortable: true,
      cell: (item) => (
        <div>
          <span className="font-bold text-xs text-[#111111] block">
            {item.societe}
          </span>
          <span className="text-[11.5px] text-[#777777] block mt-0.5">
            {item.contact_nom || item.contact || '—'} • {item.email} • {item.telephone}
          </span>
        </div>
      ),
    },
    {
      header: 'PRESTATION / SPÉCIALITÉ',
      accessor: 'type_service',
      cell: (item) => (
        <div className="flex items-center gap-1.5 text-[#333333]">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#8E44AD] bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-md">
            <WrenchIcon size={12} className="shrink-0" />
            <span className="truncate max-w-[240px]" title={item.type_service}>
              {item.type_service || '—'}
            </span>
          </span>
        </div>
      ),
    },
    {
      header: 'DOSSIER JOINT',
      accessor: 'fichier_upload_url',
      className: 'w-32 text-center',
      cell: (item) => {
        const fileUrl = getDossierUrl(item.fichier_upload_url)
        if (fileUrl) {
          return (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-red-50 text-xs font-semibold text-[#C0392B] border border-red-100 transition-colors shadow-2xs"
              title={item.fichier_nom || 'Télécharger le dossier d’agrément'}
            >
              <DownloadIcon size={13} />
              <span className="font-mono text-[11px]">Dossier</span>
            </a>
          )
        }
        return <span className="text-[#999999] text-xs font-mono">-</span>
      },
    },
    {
      header: 'STATUT',
      accessor: 'status',
      sortable: true,
      className: 'w-36',
      cell: (item) => (
        <select
          value={normalizePartenaireStatus(item.status)}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            e.stopPropagation()
            handleStatusChange(item.id, e.target.value)
          }}
          className={`text-[11.5px] font-semibold rounded-full px-2.5 py-1 border cursor-pointer focus:outline-none transition-colors shadow-2xs ${getStatusStyle(item.status)}`}
        >
          <option value="en_attente">En attente</option>
          <option value="en_evaluation">En évaluation</option>
          <option value="valide">Agréé / Validé</option>
          <option value="rejete">Non retenu</option>
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
            title="Consulter et instruire la candidature"
          >
            <EyeIcon size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleDeletePrompt(item)}
            className="p-2 rounded-lg text-[#777777] hover:text-[#C0392B] hover:bg-red-50 transition-colors cursor-pointer"
            title="Supprimer la candidature"
          >
            <TrashIcon size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* 1. En-tête de page */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="fl-admin-micro text-[#C0392B] uppercase tracking-wider">
              CRM • MODULE PARTENAIRES & FOURNISSEURS
            </span>
          </div>
          <h1 className="fl-admin-title-page text-[#111111]">
            Candidatures Partenaires & Agrément Fournisseurs
          </h1>
          <p className="fl-admin-body text-[#666666] mt-1">
            Gestion, agrément technique et suivi des transporteurs, entreprises de levage, génie civil et énergies minières.
          </p>
        </div>
      </div>

      {/* 2. Barre d'outils : Filtres statut & Recherche */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Onglets de Statut */}
        <div className="flex items-center gap-1 border-b border-[#E8E4DF] pb-0 overflow-x-auto">
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
                className={`pb-3 px-3.5 text-xs whitespace-nowrap transition-all relative cursor-pointer ${
                  isActive
                    ? 'font-bold text-[#C0392B] border-b-2 border-[#C0392B] -mb-[1px]'
                    : 'font-medium text-[#777777] hover:text-[#111111] border-b-2 border-transparent'
                }`}
              >
                {filter.label}
              </button>
            )
          })}
        </div>

        {/* Barre de recherche */}
        <div className="relative w-full sm:w-80">
          <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999999] pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher société, contact, spécialité..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-3.5 text-xs bg-white border border-[#E8E4DF] rounded-xl text-[#111111] placeholder-[#999999] focus:outline-none focus:border-[#C0392B] focus:ring-2 focus:ring-[#C0392B]/15 transition-all shadow-xs"
          />
        </div>
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
        emptyTitle="Aucune candidature partenaire"
        emptyMessage={
          search || statusFilter !== 'all'
            ? 'Aucune entreprise ne correspond à vos critères de recherche.'
            : 'Aucune candidature enregistrée pour le moment.'
        }
      />

      {/* 4. Pagination */}
      <TablePagination
        currentPage={currentPage}
        totalPages={Math.ceil(displayedPartenaires.length / pageSize) || 1}
        pageSize={pageSize}
        totalItems={displayedPartenaires.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      {/* 5. Tiroir / Drawer d'Instruction & Détails */}
      <SlideOverDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedPartenaire ? selectedPartenaire.societe : 'Détails Partenaire'}
        subtitle={selectedPartenaire ? `Candidature #${selectedPartenaire.id}` : ''}
        footer={
          <div className="flex items-center justify-between w-full">
            <button
              type="button"
              onClick={() => {
                if (!selectedPartenaire) return
                handleDeletePrompt(selectedPartenaire)
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#C0392B] hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <TrashIcon size={14} />
              <span>Supprimer le dossier</span>
            </button>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[#111111] bg-white border border-[#E8E4DF] hover:bg-[#FAF8F6] transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        }
      >
        {selectedPartenaire && (
          <div className="space-y-6">
            {/* En-tête : Société, date et sélecteur de statut actif */}
            <div className="p-4 rounded-2xl bg-[#FAF8F6] border border-[#E8E4DF] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-[#111111]">{selectedPartenaire.societe}</h4>
                  <span className="text-[11.5px] text-[#777777] flex items-center gap-1 mt-0.5">
                    <CalendarIcon size={12} />
                    <span>Déposée le {formatPartenaireDate(selectedPartenaire.created_at)}</span>
                  </span>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#777777] mb-1 text-right">
                    Statut d&apos;agrément
                  </label>
                  <select
                    value={normalizePartenaireStatus(selectedPartenaire.status)}
                    onChange={(e) => handleStatusChange(selectedPartenaire.id, e.target.value)}
                    className={`text-[11.5px] font-semibold rounded-full px-2.5 py-1 border cursor-pointer focus:outline-none transition-colors shadow-2xs ${getStatusStyle(selectedPartenaire.status)}`}
                  >
                    <option value="en_attente">En attente</option>
                    <option value="en_evaluation">En évaluation</option>
                    <option value="valide">Agréé / Validé</option>
                    <option value="rejete">Non retenu</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Coordonnées Entreprise & Contact (cliquables) */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#777777] flex items-center gap-2">
                <BuildingIcon size={14} />
                <span>Interlocuteur & Contact</span>
              </h3>
              <div className="p-4 rounded-2xl bg-white border border-[#E8E4DF] shadow-xs space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#777777]">Raison Sociale :</span>
                  <span className="font-bold text-[#111111]">{selectedPartenaire.societe}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#777777]">Représentant :</span>
                  <span className="font-medium text-[#111111]">
                    {selectedPartenaire.contact_nom || selectedPartenaire.contact || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#777777]">Email Professionnel :</span>
                  <a
                    href={`mailto:${selectedPartenaire.email}`}
                    className="text-[#C0392B] font-semibold hover:underline flex items-center gap-1.5"
                  >
                    <MailIcon size={13} />
                    <span>{selectedPartenaire.email}</span>
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#777777]">Téléphone Direct :</span>
                  <a
                    href={`tel:${selectedPartenaire.telephone}`}
                    className="text-[#111111] font-semibold hover:text-[#C0392B] flex items-center gap-1.5 tabular-nums"
                  >
                    <PhoneIcon size={13} />
                    <span>{selectedPartenaire.telephone}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Prestation & Spécialité */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#777777] flex items-center gap-2">
                <PartenairesIcon size={14} />
                <span>Prestation & Capacités Techniques</span>
              </h3>
              <div className="p-4 rounded-2xl bg-white border border-[#E8E4DF] shadow-xs space-y-3 text-xs">
                <div>
                  <span className="text-[#777777] block text-[11.5px] mb-0.5">Domaine d&apos;expertise :</span>
                  <p className="font-bold text-[#111111] text-[13px]">
                    {selectedPartenaire.type_service}
                  </p>
                </div>

                {selectedPartenaire.description && (
                  <div>
                    <span className="text-[#777777] block text-[11.5px] mb-0.5">Moyens & Références :</span>
                    <p className="p-3 rounded-xl bg-[#FAF8F6] text-[#555555] italic border border-[#E8E4DF] leading-relaxed">
                      &quot;{selectedPartenaire.description}&quot;
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Dossier d'agrément joint (DFE, Kbis, Plaquette) */}
            {selectedPartenaire.fichier_upload_url && (
              <div className="p-4 rounded-2xl bg-[#FAF8F6] border border-[#E8E4DF] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#8E44AD] border border-purple-100 flex items-center justify-center shrink-0">
                    <PdfIcon size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#111111] block">
                      {selectedPartenaire.fichier_nom || 'Dossier d’agrément'}
                    </span>
                    <span className="text-[11px] text-[#777777]">Document légal attaché (DFE, Kbis, Assurance)</span>
                  </div>
                </div>

                <a
                  href={getDossierUrl(selectedPartenaire.fichier_upload_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-xs font-semibold text-[#111111] bg-white border border-[#E8E4DF] hover:bg-[#FAF8F6] hover:text-[#C0392B] transition-colors shadow-2xs"
                >
                  <DownloadIcon size={14} />
                  <span>Consulter</span>
                  <ExternalLink size={12} className="text-[#777777]" />
                </a>
              </div>
            )}
          </div>
        )}
      </SlideOverDrawer>

      {/* 6. Boîte de dialogue de confirmation */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.action}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant="danger"
        confirmText="Confirmer la suppression"
      />
    </div>
  )
}
