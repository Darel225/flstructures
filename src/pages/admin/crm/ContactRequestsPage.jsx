import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ContactsIcon,
  SearchIcon,
  PhoneIcon,
  UserIcon,
  EyeIcon,
  MailIcon,
  TrashIcon,
} from '../../../components/admin/icons/AdminIcons'
import { toast } from 'sonner'

import {
  getContacts,
  updateContactStatus,
  deleteContact,
  normalizeContactStatus,
} from '../../../services/api/contact.service'
import { syncCrmMetrics } from '../../../services/api/crmQuerySync'
import DataTable from '../../../components/admin/ui/DataTable'
import TablePagination from '../../../components/admin/ui/TablePagination'
import SlideOverDrawer from '../../../components/admin/ui/SlideOverDrawer'
import ConfirmDialog from '../../../components/admin/ui/ConfirmDialog'

const STATUS_FILTERS = [
  { id: 'all', label: 'Tous' },
  { id: 'nouveau', label: 'Nouveaux' },
  { id: 'en_cours', label: 'En cours' },
  { id: 'traite', label: 'Traités' },
]

/**
 * Formatage de la date en "jj/mm/aaaa hh:mm"
 */
const formatContactDate = (dateStr) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

/**
 * Styles de statut :
 * - nouveau : Ambre
 * - en_cours : Bleu
 * - traite : Vert
 */
const getStatusStyle = (status) => {
  const norm = normalizeContactStatus(status)
  switch (norm) {
    case 'nouveau':
      return 'bg-amber-50 text-amber-800 border-amber-300 focus:ring-amber-500'
    case 'en_cours':
      return 'bg-blue-50 text-blue-800 border-blue-300 focus:ring-blue-500'
    case 'traite':
      return 'bg-emerald-50 text-emerald-800 border-emerald-300 focus:ring-emerald-500'
    default:
      return 'bg-gray-50 text-gray-700 border-gray-300'
  }
}

export default function ContactRequestsPage() {
  const queryClient = useQueryClient()

  // Filtres et pagination
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortColumn, setSortColumn] = useState('created_at')
  const [sortDirection, setSortDirection] = useState('desc')

  // Panneau latéral et modale
  const [selectedContact, setSelectedContact] = useState(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: () => {},
  })

  // Récupération réelle des données depuis l'API MySQL
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['admin-contacts', statusFilter, search],
    queryFn: () => getContacts({ status: statusFilter, search }),
  })

  // Déballage garanti en tableau JavaScript
  const rawList = useMemo(() => {
    if (Array.isArray(contacts)) return contacts
    if (Array.isArray(contacts?.data)) return contacts.data
    if (Array.isArray(contacts?.data?.data)) return contacts.data.data
    return []
  }, [contacts])

  // Changement de statut synchronisé avec l'API, le Drawer et le Tableau
  const handleStatusChange = async (contactId, newStatus) => {
    try {
      await updateContactStatus(contactId, newStatus)

      // Mise à jour immédiate du contact sélectionné si affiché dans le drawer
      setSelectedContact((prev) => {
        if (prev && String(prev.id) === String(contactId)) {
          return { ...prev, status: newStatus }
        }
        return prev
      })

      // Invalidation immédiate de toutes les métriques CRM et du Dashboard (0 ms)
      await syncCrmMetrics(queryClient)
      await queryClient.refetchQueries({ queryKey: ['admin-contacts'] })

      toast.success('Statut du message mis à jour avec succès')
    } catch (err) {
      console.error('Erreur changement statut:', err)
      toast.error('Erreur lors de la mise à jour du statut')
    }
  }

  // Mutation de suppression
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteContact(id),
    onSuccess: async () => {
      await syncCrmMetrics(queryClient)
      await queryClient.refetchQueries({ queryKey: ['admin-contacts'] })
      toast.success('Message de contact supprimé avec succès.')
      setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
      if (isDrawerOpen) setIsDrawerOpen(false)
    },
    onError: () => {
      toast.error('Erreur lors de la suppression du message.')
    },
  })

  const handleOpenDetail = (item) => {
    setSelectedContact(item)
    setIsDrawerOpen(true)
  }

  const handleDeletePrompt = (item) => {
    setConfirmDialog({
      isOpen: true,
      title: `Supprimer le message de ${item.nom_contact} ?`,
      message: `Voulez-vous supprimer définitivement le message de "${item.nom_contact}" (${item.sujet}) ? Cette action est irréversible.`,
      action: () => deleteMutation.mutate(item.id),
    })
  }

  // Filtrage robuste côté client pour l'onglet "Tous" et la recherche
  const displayedContacts = useMemo(() => {
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
        normalizeContactStatus(item.status) === statusFilter

      // 2. Filtre par recherche
      const q = (search || '').toLowerCase().trim()
      const matchesSearch =
        !q ||
        item.nom_contact?.toLowerCase().includes(q) ||
        item.email?.toLowerCase().includes(q) ||
        item.sujet?.toLowerCase().includes(q) ||
        item.message?.toLowerCase().includes(q) ||
        item.telephone?.toLowerCase().includes(q)

      return matchesStatus && matchesSearch
    })
  }, [rawList, statusFilter, search])

  // Tri
  const sortedData = useMemo(() => {
    return [...displayedContacts].sort((a, b) => {
      const valA = a[sortColumn] || ''
      const valB = b[sortColumn] || ''
      if (sortDirection === 'asc') return valA > valB ? 1 : -1
      return valA < valB ? 1 : -1
    })
  }, [displayedContacts, sortColumn, sortDirection])

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

  // Colonnes du tableau
  const columns = [
    {
      header: 'DATE',
      accessor: 'created_at',
      sortable: true,
      className: 'w-36 whitespace-nowrap',
      cell: (item) => (
        <span className="font-semibold text-xs text-[#111111] tabular-nums block">
          {formatContactDate(item.created_at)}
        </span>
      ),
    },
    {
      header: 'EXPÉDITEUR',
      accessor: 'nom_contact',
      sortable: true,
      cell: (item) => (
        <div>
          <span className="font-bold text-xs text-[#111111] block">
            {item.nom_contact}
          </span>
          <span className="text-[11.5px] text-[#777777] block mt-0.5">
            {item.email} {item.telephone ? `• ${item.telephone}` : ''}
          </span>
        </div>
      ),
    },
    {
      header: 'OBJET DU MESSAGE',
      accessor: 'sujet',
      sortable: true,
      cell: (item) => (
        <div className="max-w-[340px]">
          <span className="font-bold text-xs text-[#111111] block truncate" title={item.sujet}>
            {item.sujet}
          </span>
          <span className="text-[11px] text-[#777777] line-clamp-1 mt-0.5" title={item.message}>
            {item.message}
          </span>
        </div>
      ),
    },
    {
      header: 'STATUT',
      accessor: 'status',
      sortable: true,
      className: 'w-32',
      cell: (item) => (
        <select
          value={normalizeContactStatus(item.status)}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            e.stopPropagation()
            handleStatusChange(item.id, e.target.value)
          }}
          className={`text-[11.5px] font-semibold rounded-full px-2.5 py-1 border cursor-pointer focus:outline-none transition-colors shadow-2xs ${getStatusStyle(
            item.status
          )}`}
        >
          <option value="nouveau">Nouveau</option>
          <option value="en_cours">En cours</option>
          <option value="traite">Traité</option>
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
            title="Lire le message complet"
          >
            <EyeIcon size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleDeletePrompt(item)}
            className="p-2 rounded-lg text-[#777777] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            title="Supprimer ce message"
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
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-[#C0392B] text-xs font-semibold tracking-wide mb-2 border border-red-100">
            <ContactsIcon size={13} />
            <span>Boîte de Réception CRM</span>
          </div>
          <h1 className="fl-admin-title-page text-[#111111]">
            Messages de Contact & Demandes d’Information
          </h1>
          <p className="fl-admin-body text-[#666666] mt-1">
            Prise en charge, lecture et traitement des sollicitations reçues depuis le site public.
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="relative w-full sm:w-72">
          <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999999] pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher expéditeur, objet..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full h-11 pl-10 pr-3 text-sm bg-white border border-[#E8E4DF] rounded-xl text-[#111111] placeholder-[#999999] focus:outline-none focus:border-[#C0392B] focus:ring-2 focus:ring-[#C0392B]/15 transition-all"
          />
        </div>
      </div>

      {/* 2. Filtres d'état */}
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
        emptyTitle="Aucun message de contact"
        emptyMessage="Aucun message ne correspond à vos filtres actuels."
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

      {/* 5. Drawer d'Instruction & Lecture du message */}
      <SlideOverDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={
          selectedContact
            ? `Message de ${selectedContact.nom_contact}`
            : 'Lecture du message'
        }
        subtitle={selectedContact ? selectedContact.sujet : ''}
        footer={
          selectedContact && (
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={() => handleDeletePrompt(selectedContact)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
              >
                <TrashIcon size={14} />
                <span>Supprimer</span>
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedContact.email}?subject=RE: ${encodeURIComponent(
                    selectedContact.sujet || ''
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
        {selectedContact && (
          <div className="space-y-6">
            {/* Statut interactif & Date */}
            <div className="p-4 rounded-2xl bg-[#FAF8F6] border border-[#E8E4DF] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777] block">
                  Statut du dossier
                </span>
                <div className="mt-1">
                  <select
                    value={normalizeContactStatus(selectedContact.status)}
                    onChange={(e) => handleStatusChange(selectedContact.id, e.target.value)}
                    className={`text-xs font-bold rounded-full px-3 py-1.5 border cursor-pointer focus:outline-none transition-colors shadow-2xs ${getStatusStyle(
                      selectedContact.status
                    )}`}
                  >
                    <option value="nouveau">Nouveau</option>
                    <option value="en_cours">En cours</option>
                    <option value="traite">Traité</option>
                  </select>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777] block">
                  Date de réception
                </span>
                <span className="font-mono text-xs text-[#111111] font-bold block mt-1">
                  {formatContactDate(selectedContact.created_at)}
                </span>
              </div>
            </div>

            {/* Coordonnées de l'expéditeur */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#777777] flex items-center gap-1.5">
                <UserIcon size={14} className="text-[#666666]" />
                <span>Coordonnées de l&apos;Expéditeur</span>
              </h3>
              <div className="p-4 rounded-2xl bg-white border border-[#E8E4DF] space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#777777]">Nom complet :</span>
                  <span className="font-bold text-[#111111] text-sm">
                    {selectedContact.nom_contact}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#777777]">Email direct :</span>
                  <a
                    href={`mailto:${selectedContact.email}`}
                    className="text-[#C0392B] hover:underline flex items-center gap-1.5 font-bold"
                  >
                    <MailIcon size={13} />
                    <span>{selectedContact.email}</span>
                  </a>
                </div>
                {selectedContact.telephone && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#777777]">Téléphone :</span>
                    <a
                      href={`tel:${selectedContact.telephone}`}
                      className="font-mono text-[#111111] hover:text-[#C0392B] flex items-center gap-1.5 font-bold"
                    >
                      <PhoneIcon size={13} />
                      <span>{selectedContact.telephone}</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Objet & Corps du message */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#777777] flex items-center gap-1.5">
                <MailIcon size={14} className="text-[#666666]" />
                <span>Objet & Contenu de la Demande</span>
              </h3>
              <div className="p-5 rounded-2xl bg-white border border-[#E8E4DF] space-y-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777] block">
                    Objet
                  </span>
                  <h4 className="font-bold text-sm text-[#111111] mt-0.5">
                    {selectedContact.sujet}
                  </h4>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777] block mb-1.5">
                    Message
                  </span>
                  <div className="p-4 rounded-xl bg-[#FAF8F6] text-xs sm:text-sm text-[#222222] leading-relaxed whitespace-pre-line border border-[#E8E4DF]">
                    {selectedContact.message}
                  </div>
                </div>
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
