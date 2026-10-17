import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  DevisIcon,
  SearchIcon,
  DownloadIcon,
  BuildingIcon,
  MailIcon,
  PhoneIcon,
  EyeIcon,
  MapPinIcon,
  TrashIcon,
} from '../../../components/admin/icons/AdminIcons'
import { FileText, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

import devisService, { updateDevisStatus } from '../../../services/api/devis.service'
import { syncCrmMetrics } from '../../../services/api/crmQuerySync'
import { resolveImageUrl } from '../../../utils/imageUrl'
import DataTable from '../../../components/admin/ui/DataTable'
import TablePagination from '../../../components/admin/ui/TablePagination'
import SlideOverDrawer from '../../../components/admin/ui/SlideOverDrawer'
import ConfirmDialog from '../../../components/admin/ui/ConfirmDialog'

const STATUS_FILTERS = [
  { id: 'all', label: 'Tous' },
  { id: 'en_attente', label: 'Nouveaux / En attente' },
  { id: 'en_cours', label: 'En cours' },
  { id: 'valide', label: 'Validés / Traités' },
  { id: 'rejete', label: 'Rejetés' },
]

function formatDevisRef(id) {
  if (!id) return '#DEV-0001'
  const str = String(id)
  if (str.startsWith('#')) return str
  if (str.startsWith('DEV-')) return `#${str}`
  return `#DEV-${str.padStart(4, '0')}`
}

function formatDevisDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function normalizeStatus(status) {
  const map = {
    'En attente': 'en_attente',
    'Nouveau': 'en_attente',
    'En cours': 'en_cours',
    'Validé / Traité': 'valide',
    'Validé': 'valide',
    'Rejeté': 'rejete',
  }
  return map[status] || status || 'en_attente'
}

function getStatusStyle(rawStatus) {
  const status = normalizeStatus(rawStatus)
  let style = 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'

  if (status === 'en_cours') {
    style = 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100'
  } else if (status === 'valide') {
    style = 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
  } else if (status === 'rejete') {
    style = 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
  }

  return style
}

export default function DevisRequestsPage() {
  const queryClient = useQueryClient()

  // Filtres et pagination
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortColumn, setSortColumn] = useState('created_at')
  const [sortDirection, setSortDirection] = useState('desc')

  // Tiroir Détails / Instruction
  const [selectedDevis, setSelectedDevis] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Modale de confirmation de suppression
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: () => {},
  })

  // Récupération des devis
  const { data: rawDevis = [], isLoading } = useQuery({
    queryKey: ['devis', statusFilter, searchTerm],
    queryFn: () => devisService.getDevisRequests({ status: statusFilter, search: searchTerm }),
  })

  const devisList = useMemo(() => {
    if (Array.isArray(rawDevis)) return rawDevis
    if (Array.isArray(rawDevis?.data)) return rawDevis.data
    return []
  }, [rawDevis])

  // Changement de statut synchronisé avec l'API, le Drawer et le Tableau
  const handleStatusChange = async (dossierId, newStatus) => {
    try {
      // 1. Appel API réel
      await updateDevisStatus(dossierId, newStatus)

      // 2. Mise à jour immédiate de l'état local du Drawer
      setSelectedDevis((prev) => {
        if (prev && String(prev.id) === String(dossierId)) {
          return { ...prev, status: newStatus }
        }
        return prev
      })

      // 3. Forcer le rafraîchissement immédiat de toutes les métriques CRM et du Dashboard
      await syncCrmMetrics(queryClient)
      await queryClient.refetchQueries({ queryKey: ['devis'] })

      toast.success('Statut mis à jour avec succès')
    } catch (error) {
      console.error('Erreur changement statut:', error)
      toast.error('Erreur lors de la mise à jour du statut en base')
    }
  }

  // Mutation de Suppression
  const deleteMutation = useMutation({
    mutationFn: (id) => devisService.deleteDevisRequest(id),
    onSuccess: async () => {
      await syncCrmMetrics(queryClient)
      toast.success('Demande de devis supprimée avec succès.')
      setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
      if (isDetailOpen) setIsDetailOpen(false)
    },
    onError: () => {
      toast.error('Erreur lors de la suppression de la demande.')
    },
  })

  const handleOpenDetail = (item) => {
    setSelectedDevis(item)
    setIsDetailOpen(true)
  }

  const handleDeletePrompt = (item) => {
    setConfirmDialog({
      isOpen: true,
      title: `Supprimer la demande ${formatDevisRef(item.id)} ?`,
      message: `Voulez-vous supprimer définitivement le dossier de "${item.societe}" ? Cette action est irréversible.`,
      action: () => deleteMutation.mutate(item.id),
    })
  }

  // Filtrage local en direct
  const filteredData = useMemo(() => {
    let result = Array.isArray(devisList) ? [...devisList] : []

    if (statusFilter !== 'all') {
      result = result.filter((d) => d.status === statusFilter)
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim()
      result = result.filter(
        (d) =>
          (d.societe && d.societe.toLowerCase().includes(q)) ||
          (d.contact_nom && d.contact_nom.toLowerCase().includes(q)) ||
          (d.site_minier && d.site_minier.toLowerCase().includes(q)) ||
          (d.email && d.email.toLowerCase().includes(q)) ||
          (d.telephone && d.telephone.toLowerCase().includes(q)) ||
          (d.type_besoin && d.type_besoin.toLowerCase().includes(q)) ||
          String(d.id).toLowerCase().includes(q)
      )
    }

    return result.sort((a, b) => {
      const valA = a[sortColumn] || ''
      const valB = b[sortColumn] || ''
      if (sortDirection === 'asc') return valA > valB ? 1 : -1
      return valA < valB ? 1 : -1
    })
  }, [devisList, statusFilter, searchTerm, sortColumn, sortDirection])

  // Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredData.slice(startIndex, startIndex + pageSize)
  }, [filteredData, currentPage, pageSize])

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
      header: 'Date & Réf',
      accessor: 'created_at',
      sortable: true,
      className: 'w-32',
      cell: (item) => (
        <div>
          <span className="font-semibold text-xs text-[#111111] block tabular-nums">
            {formatDevisDate(item.created_at)}
          </span>
          <span className="font-mono text-[11px] text-[#777777] block">
            {formatDevisRef(item.id)}
          </span>
        </div>
      ),
    },
    {
      header: 'Société & Contact',
      accessor: 'societe',
      sortable: true,
      cell: (item) => (
        <div>
          <span className="font-bold text-xs text-[#111111] block">
            {item.societe}
          </span>
          <span className="text-[11.5px] text-[#777777] block">
            {item.contact_nom} • {item.email} • {item.telephone}
          </span>
        </div>
      ),
    },
    {
      header: 'Besoin & Site',
      accessor: 'type_besoin',
      cell: (item) => (
        <div className="space-y-1">
          <span className="text-xs font-semibold text-[#111111] line-clamp-1 block">
            {item.type_besoin}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-[#C0392B] font-medium bg-red-50/70 border border-red-100/80 px-2 py-0.5 rounded-md">
            <MapPinIcon size={12} className="shrink-0" />
            <span className="truncate max-w-[200px]">{item.site_minier}</span>
          </span>
        </div>
      ),
    },
    {
      header: 'Volume',
      accessor: 'volume_frequence',
      className: 'w-36',
      cell: (item) => (
        <span className="text-xs text-[#444444] font-medium block">
          {item.volume_frequence || '—'}
        </span>
      ),
    },
    {
      header: 'PJ',
      accessor: 'fichier_upload_url',
      className: 'w-14 text-center',
      cell: (item) => {
        if (item.fichier_upload_url) {
          return (
            <a
              href={resolveImageUrl(item.fichier_upload_url)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex p-1.5 rounded-lg text-[#C0392B] hover:bg-red-50 hover:text-[#A93226] transition-colors"
              title="Consulter la pièce jointe (CCTP / Plan)"
            >
              <DownloadIcon size={16} />
            </a>
          )
        }
        return <span className="text-xs text-[#999999]">—</span>
      },
    },
    {
      header: 'Statut',
      accessor: 'status',
      sortable: true,
      className: 'w-36',
      cell: (item) => (
        <select
          value={normalizeStatus(item.status)}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            e.stopPropagation()
            handleStatusChange(item.id, e.target.value)
          }}
          className={`text-[11.5px] font-semibold rounded-full px-2.5 py-1 border cursor-pointer focus:outline-none transition-colors shadow-2xs ${getStatusStyle(item.status)}`}
        >
          <option value="en_attente">En attente</option>
          <option value="en_cours">En cours</option>
          <option value="valide">Validé / Traité</option>
          <option value="rejete">Rejeté</option>
        </select>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      className: 'w-24 text-right',
      cell: (item) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => handleOpenDetail(item)}
            className="p-2 rounded-lg text-[#777777] hover:text-[#C0392B] hover:bg-red-50 transition-colors cursor-pointer"
            title="Consulter et instruire la demande"
          >
            <EyeIcon size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleDeletePrompt(item)}
            className="p-2 rounded-lg text-[#777777] hover:text-[#C0392B] hover:bg-red-50 transition-colors cursor-pointer"
            title="Supprimer la demande"
          >
            <TrashIcon size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* 1. En-tête de page (mode consultation & traitement exclusif) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="fl-admin-micro text-[#C0392B] uppercase tracking-wider">
              CRM • MODULE COMMERCIAL
            </span>
          </div>
          <h1 className="fl-admin-title-page text-[#111111]">
            Devis Structures & Sites Miniers
          </h1>
          <p className="fl-admin-body text-[#666666] mt-1">
            Gestion, qualification et instruction des demandes de bases-vie, conteneurs et hangars de chantier.
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
            placeholder="Rechercher société, contact, site, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
        emptyTitle="Aucune demande de devis"
        emptyMessage={
          searchTerm || statusFilter !== 'all'
            ? 'Aucun dossier ne correspond à vos critères de recherche.'
            : 'Aucune demande enregistrée dans la base.'
        }
      />

      {/* 4. Pagination */}
      <TablePagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredData.length / pageSize) || 1}
        pageSize={pageSize}
        totalItems={filteredData.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      {/* 5. Modal / Drawer d'Instruction et Détails */}
      <SlideOverDrawer
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedDevis ? `Dossier ${formatDevisRef(selectedDevis.id)}` : 'Détails du Devis'}
        subtitle={selectedDevis ? selectedDevis.societe : ''}
        footer={
          <div className="flex items-center justify-between w-full">
            <button
              type="button"
              onClick={() => {
                if (!selectedDevis) return
                handleDeletePrompt(selectedDevis)
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#C0392B] hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <TrashIcon size={14} />
              <span>Supprimer le dossier</span>
            </button>
            <button
              type="button"
              onClick={() => setIsDetailOpen(false)}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[#111111] bg-white border border-[#E8E4DF] hover:bg-[#FAF8F6] transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        }
      >
        {selectedDevis && (
          <div className="space-y-6">
            {/* En-tête : Réf, Date et sélecteur de statut direct */}
            <div className="p-4 rounded-2xl bg-[#FAF8F6] border border-[#E8E4DF] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs text-[#777777] block">
                    Référence : {formatDevisRef(selectedDevis.id)}
                  </span>
                  <span className="text-xs text-[#111111] font-semibold block mt-0.5">
                    Enregistré le {formatDevisDate(selectedDevis.created_at)}
                  </span>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#777777] mb-1 text-right">
                    Statut du dossier
                  </label>
                  <select
                    value={normalizeStatus(selectedDevis.status)}
                    onChange={(e) => handleStatusChange(selectedDevis.id, e.target.value)}
                    className={`text-[11.5px] font-semibold rounded-full px-2.5 py-1 border cursor-pointer focus:outline-none transition-colors shadow-2xs ${getStatusStyle(selectedDevis.status)}`}
                  >
                    <option value="en_attente">En attente</option>
                    <option value="en_cours">En cours</option>
                    <option value="valide">Validé / Traité</option>
                    <option value="rejete">Rejeté</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Coordonnées Entreprise & Contact (cliquables) */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#777777] flex items-center gap-2">
                <BuildingIcon size={14} />
                <span>Entreprise & Interlocuteur</span>
              </h3>
              <div className="p-4 rounded-2xl bg-white border border-[#E8E4DF] shadow-xs space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#777777]">Raison Sociale :</span>
                  <span className="font-bold text-[#111111]">{selectedDevis.societe}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#777777]">Contact Référent :</span>
                  <span className="font-medium text-[#111111]">{selectedDevis.contact_nom}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#777777]">Email Professionnel :</span>
                  <a
                    href={`mailto:${selectedDevis.email}`}
                    className="text-[#C0392B] font-semibold hover:underline flex items-center gap-1.5"
                  >
                    <MailIcon size={13} />
                    <span>{selectedDevis.email}</span>
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#777777]">Téléphone Direct :</span>
                  <a
                    href={`tel:${selectedDevis.telephone}`}
                    className="text-[#111111] font-semibold hover:text-[#C0392B] flex items-center gap-1.5 tabular-nums"
                  >
                    <PhoneIcon size={13} />
                    <span>{selectedDevis.telephone}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Spécifications du site & Besoin */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#777777] flex items-center gap-2">
                <DevisIcon size={14} />
                <span>Spécifications Chantier & Besoin</span>
              </h3>
              <div className="p-4 rounded-2xl bg-white border border-[#E8E4DF] shadow-xs space-y-3 text-xs">
                <div>
                  <span className="text-[#777777] block text-[11.5px] mb-0.5">Site Minier / Localité :</span>
                  <div className="flex items-center gap-1.5 font-bold text-[#111111]">
                    <MapPinIcon size={14} className="text-[#C0392B]" />
                    <span>{selectedDevis.site_minier}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[#777777] block text-[11.5px] mb-0.5">Nature du Besoin :</span>
                  <p className="font-semibold text-[#111111] text-[13px]">
                    {selectedDevis.type_besoin}
                  </p>
                </div>

                <div>
                  <span className="text-[#777777] block text-[11.5px] mb-0.5">Volume & Fréquence :</span>
                  <p className="text-[#444444] font-medium">
                    {selectedDevis.volume_frequence || 'Non spécifié'}
                  </p>
                </div>

                {selectedDevis.details && (
                  <div>
                    <span className="text-[#777777] block text-[11.5px] mb-0.5">Détails complémentaires :</span>
                    <p className="p-3 rounded-xl bg-[#FAF8F6] text-[#555555] italic border border-[#E8E4DF]">
                      &quot;{selectedDevis.details}&quot;
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Document CCTP / Plan joint */}
            {selectedDevis.fichier_upload_url && (
              <div className="p-4 rounded-2xl bg-[#FAF8F6] border border-[#E8E4DF] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-[#C0392B] border border-red-100 flex items-center justify-center shrink-0">
                    <FileText size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#111111] block">
                      {selectedDevis.fichier_nom || 'Cahier des charges / Plan'}
                    </span>
                    <span className="text-[11px] text-[#777777]">Document technique attaché</span>
                  </div>
                </div>

                <a
                  href={resolveImageUrl(selectedDevis.fichier_upload_url)}
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

      {/* 6. Boîte de dialogue de confirmation de suppression */}
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
