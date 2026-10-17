import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ProjetsIcon,
  PlusIcon,
  SearchIcon,
  EditIcon,
  TrashIcon,
  CalendarIcon,
  ImageIcon,
  CheckIcon,
  AlertTriangleIcon,
  WrenchIcon,
} from '../../../components/admin/icons/AdminIcons'
import { toast } from 'sonner'

import realisationService from '../../../services/api/realisation.service'
import { resolveImageUrl, handleImageError } from '../../../utils/imageUrl'
import DataTable from '../../../components/admin/ui/DataTable'
import TablePagination from '../../../components/admin/ui/TablePagination'
import SlideOverDrawer from '../../../components/admin/ui/SlideOverDrawer'
import ConfirmDialog from '../../../components/admin/ui/ConfirmDialog'
import FormInput from '../../../components/admin/forms/FormInput'
import FormTextarea from '../../../components/admin/forms/FormTextarea'
import BilingualTabs from '../../../components/admin/forms/BilingualTabs'
import DatePicker from '../../../components/admin/forms/DatePicker'
import ImageUploader from '../../../components/admin/forms/ImageUploader'

function normalizeIsoDate(d) {
  if (!d) return ''
  if (/^\d{4}-\d{2}$/.test(d)) return `${d}-01`
  if (/^\d{4}-\d{2}-\d{2}/.test(d)) return d.slice(0, 10)
  return d
}

function formatDeliveryDate(str) {
  if (!str) return '—'
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const [y, m] = str.slice(0, 10).split('-')
    return `${m}/${y}`
  }
  if (/^\d{4}-\d{2}$/.test(str)) {
    const [y, m] = str.split('-')
    return `${m}/${y}`
  }
  return str
}

export default function RealisationsListPage() {
  const queryClient = useQueryClient()

  // Filtres & Pagination
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Tiroir & Formulaire
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingRealisation, setEditingRealisation] = useState(null)
  const [activeLang, setActiveLang] = useState('fr')

  // État React unifié sans perte de saisie
  const [form, setForm] = useState({
    titre_fr: '',
    titre_en: '',
    date_realisation: '',
    image: null,
    image_preview: '',
    besoin_client_fr: '',
    besoin_client_en: '',
    contraintes_fr: '',
    contraintes_en: '',
    solution_fr: '',
    solution_en: '',
  })
  const [formErrors, setFormErrors] = useState({})

  // Modale de confirmation
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: () => {},
  })

  // Récupération des réalisations
  const { data: rawRealisations = [], isLoading } = useQuery({
    queryKey: ['realisations'],
    queryFn: () => realisationService.getRealisations(),
  })

  const realisations = useMemo(() => {
    if (Array.isArray(rawRealisations)) return rawRealisations
    if (Array.isArray(rawRealisations?.data)) return rawRealisations.data
    return []
  }, [rawRealisations])

  // Invalidation globale des caches TanStack Query
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['realisations'] })
    queryClient.invalidateQueries({ queryKey: ['admin-realisations'] })
  }

  // Mutations
  const createMutation = useMutation({
    mutationFn: (formData) => realisationService.createRealisation(formData),
    onSuccess: (newRea) => {
      invalidateAll()
      const title = newRea?.titre_fr || form.titre_fr
      toast.success(`Étude de cas "${title}" enregistrée avec succès.`)
      setIsDrawerOpen(false)
      setEditingRealisation(null)
      resetForm()
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Erreur lors de la création de la réalisation.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }) => realisationService.updateRealisation(id, formData),
    onSuccess: (updated) => {
      invalidateAll()
      const title = updated?.titre_fr || form.titre_fr
      toast.success(`Réalisation "${title}" mise à jour avec succès.`)
      setIsDrawerOpen(false)
      setEditingRealisation(null)
      resetForm()
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Erreur lors de la modification.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => realisationService.deleteRealisation(id),
    onSuccess: () => {
      invalidateAll()
      toast.success('Étude de cas supprimée avec succès.')
      setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression.')
    },
  })

  const resetForm = () => {
    setForm({
      titre_fr: '',
      titre_en: '',
      date_realisation: new Date().toISOString().slice(0, 10),
      image: null,
      image_preview: '',
      besoin_client_fr: '',
      besoin_client_en: '',
      contraintes_fr: '',
      contraintes_en: '',
      solution_fr: '',
      solution_en: '',
    })
    setFormErrors({})
  }

  // Ouverture tiroir Création
  const handleOpenCreate = () => {
    setEditingRealisation(null)
    setActiveLang('fr')
    resetForm()
    setIsDrawerOpen(true)
  }

  // Ouverture tiroir Édition
  const handleOpenEdit = (item) => {
    setEditingRealisation(item)
    setActiveLang('fr')
    setForm({
      titre_fr: item.titre_fr || '',
      titre_en: item.titre_en || '',
      date_realisation: normalizeIsoDate(item.date_realisation),
      image: null,
      image_preview: item.image_principale_url ? resolveImageUrl(item.image_principale_url) : '',
      besoin_client_fr: item.besoin_client_fr || '',
      besoin_client_en: item.besoin_client_en || '',
      contraintes_fr: item.contraintes_fr || '',
      contraintes_en: item.contraintes_en || '',
      solution_fr: item.solution_fr || '',
      solution_en: item.solution_en || '',
    })
    setFormErrors({})
    setIsDrawerOpen(true)
  }

  // Soumission
  const handleSubmitForm = (e) => {
    if (e) e.preventDefault()

    const errors = {}
    if (!form.titre_fr || !form.titre_fr.trim()) {
      errors.titre_fr = 'Le titre du projet (français) est obligatoire.'
      setActiveLang('fr')
    }
    if (!form.date_realisation || !form.date_realisation.trim()) {
      errors.date_realisation = 'La date de livraison est requise.'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      toast.error('Veuillez renseigner les champs obligatoires.')
      return
    }

    const formData = new FormData()
    formData.append('titre_fr', form.titre_fr.trim())
    formData.append('titre_en', (form.titre_en || '').trim())
    formData.append('date_realisation', form.date_realisation.trim())
    formData.append('besoin_client_fr', (form.besoin_client_fr || '').trim())
    formData.append('besoin_client_en', (form.besoin_client_en || '').trim())
    formData.append('contraintes_fr', (form.contraintes_fr || '').trim())
    formData.append('contraintes_en', (form.contraintes_en || '').trim())
    formData.append('solution_fr', (form.solution_fr || '').trim())
    formData.append('solution_en', (form.solution_en || '').trim())

    // Fichier image réel téléversé depuis l'appareil
    if (form.image instanceof File) {
      formData.append('image', form.image)
      formData.append('image_principale', form.image)
    }

    if (editingRealisation) {
      updateMutation.mutate({ id: editingRealisation.id, formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  // Confirmation suppression
  const handleDeletePrompt = (item) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Supprimer cette étude de cas ?',
      message: `Voulez-vous supprimer définitivement "${item.titre_fr}" ? Les références associées seront dépubliées.`,
      action: () => deleteMutation.mutate(item.id),
    })
  }

  // Filtrage en temps réel sur titre_fr, titre_en, date_realisation et solution_fr
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return realisations
    const q = searchTerm.toLowerCase().trim()
    return realisations.filter((item) => {
      const fr = (item.titre_fr || '').toLowerCase()
      const en = (item.titre_en || '').toLowerCase()
      const sol = (item.solution_fr || '').toLowerCase()
      const date = (item.date_realisation || '').toLowerCase()
      return fr.includes(q) || en.includes(q) || sol.includes(q) || date.includes(q)
    })
  }, [realisations, searchTerm])

  // Pagination
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, currentPage, pageSize])

  // Colonnes du tableau
  const columns = [
    {
      header: 'Chantier & Visuel',
      accessor: 'titre_fr',
      cell: (item) => {
        const resolvedSrc = resolveImageUrl(item.image_principale_url)
        return (
          <div className="flex items-center gap-3">
            <div className="w-16 h-12 rounded-xl bg-[#FAF8F6] border border-[#E8E4DF] overflow-hidden shrink-0">
              {resolvedSrc ? (
                <img
                  src={resolvedSrc}
                  alt={item.titre_fr}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#999999]">
                  <ImageIcon size={16} />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-xs text-[#111111] block truncate">
                {item.titre_fr}
              </span>
              <span className="text-[11.5px] text-[#777777] block truncate">
                EN: {item.titre_en || '—'}
              </span>
            </div>
          </div>
        )
      },
    },
    {
      header: 'Date de livraison',
      accessor: 'date_realisation',
      cell: (item) => (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#E8E4DF] text-[#111111] font-mono text-xs tabular-nums shadow-2xs">
          <CalendarIcon size={12} className="text-[#C0392B]" />
          <span>{formatDeliveryDate(item.date_realisation)}</span>
        </div>
      ),
    },
    {
      header: 'Solution déployée',
      accessor: 'solution_fr',
      cell: (item) => (
        <p className="text-xs text-[#555555] line-clamp-2 max-w-sm">
          {item.solution_fr || '—'}
        </p>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleOpenEdit(item)
            }}
            className="p-1.5 rounded-lg hover:bg-[#FAF8F6] text-[#666666] hover:text-[#111111] border border-transparent hover:border-[#E8E4DF] transition-colors cursor-pointer"
            title="Modifier"
          >
            <EditIcon size={15} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleDeletePrompt(item)
            }}
            className="p-1.5 rounded-lg hover:bg-[#FDF2F2] text-[#999999] hover:text-[#C0392B] border border-transparent hover:border-red-100 transition-colors cursor-pointer"
            title="Supprimer"
          >
            <TrashIcon size={15} />
          </button>
        </div>
      ),
    },
  ]

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      {/* En-tête de page */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E8E4DF]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-[#C0392B] text-xs font-medium tracking-wide mb-2 border border-red-100">
            <ProjetsIcon size={13} />
            <span>Études de Cas & Portfolio</span>
          </div>
          <h1 className="fl-admin-title-page text-[#111111]">
            Réalisations & Études de Cas
          </h1>
          <p className="fl-admin-body text-[#666666] mt-1">
            Portfolio d&apos;ingénierie modulaire, structures métallo-textiles et bases-vie livrées.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 h-11 px-5 rounded-xl text-xs font-semibold text-white bg-[#C0392B] hover:bg-[#A93226] shadow-xs hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-[#C0392B]/30 cursor-pointer"
        >
          <PlusIcon size={15} />
          <span>Nouvelle Réalisation</span>
        </button>
      </div>

      {/* Barre de recherche temps réel */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999999] pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher par titre, solution, date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 pl-10 pr-3 text-sm bg-white border border-[#E8E4DF] rounded-xl text-[#111111] placeholder-[#999999] focus:outline-none focus:border-[#C0392B] focus:ring-2 focus:ring-[#C0392B]/15 transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Tableau des réalisations */}
      <DataTable
        columns={columns}
        data={paginatedData}
        isLoading={isLoading}
        onRowClick={handleOpenEdit}
        emptyTitle="Aucune réalisation trouvée"
        emptyMessage={
          searchTerm
            ? `Aucune réalisation ne correspond à "${searchTerm}".`
            : 'Ajoutez votre première étude de cas pour enrichir le portfolio.'
        }
        emptyActionLabel="Ajouter une réalisation"
        onEmptyAction={handleOpenCreate}
      />

      {/* Pagination */}
      <TablePagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredData.length / pageSize) || 1}
        pageSize={pageSize}
        totalItems={filteredData.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      {/* Tiroir d'Ajout / Modification */}
      <SlideOverDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false)
          setEditingRealisation(null)
        }}
        title={
          editingRealisation
            ? `Modifier l'Étude de Cas : ${editingRealisation.titre_fr || ''}`
            : 'Nouvelle Étude de Cas d’Ingénierie'
        }
        subtitle="Renseignez le triptyque B2B complet, le visuel et les informations de livraison."
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              onClick={() => {
                setIsDrawerOpen(false)
                setEditingRealisation(null)
              }}
              className="px-4 py-2.5 text-xs font-semibold text-[#777777] hover:text-[#111111] hover:bg-[#FAF8F6] rounded-xl transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSubmitForm}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#C0392B] hover:bg-[#A93226] text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 transition-all focus:outline-none focus:ring-2 focus:ring-[#C0392B]/30 cursor-pointer"
            >
              <CheckIcon size={14} />
              <span>
                {isSaving
                  ? 'Enregistrement...'
                  : editingRealisation
                    ? 'Mettre à jour l’étude'
                    : 'Créer l’étude de cas'}
              </span>
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmitForm} className="space-y-6">
          {/* Commutateur de langue (sans perte de saisie) */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF8F6] border border-[#E8E4DF]">
            <div>
              <span className="text-xs font-semibold text-[#111111] block">
                Langue de rédaction
              </span>
              <span className="text-[11.5px] text-[#777777]">
                Basculez entre le français et l&apos;anglais pour compléter le triptyque sans perte.
              </span>
            </div>
            <BilingualTabs activeTab={activeLang} onChange={setActiveLang} />
          </div>

          {/* TITRE ET DATE */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              {activeLang === 'fr' ? (
                <FormInput
                  label="Titre du projet (Français) *"
                  placeholder="ex: Dôme de Stockage Minier Ity"
                  required
                  value={form.titre_fr}
                  onChange={(e) => {
                    const val = e.target.value
                    setForm((prev) => ({ ...prev, titre_fr: val }))
                    if (formErrors.titre_fr) setFormErrors((prev) => ({ ...prev, titre_fr: null }))
                  }}
                  error={formErrors.titre_fr}
                />
              ) : (
                <FormInput
                  label="Titre du projet (Anglais)"
                  placeholder="ex: Ity Mining Storage Dome"
                  value={form.titre_en}
                  onChange={(e) => {
                    const val = e.target.value
                    setForm((prev) => ({ ...prev, titre_en: val }))
                    if (formErrors.titre_en) setFormErrors((prev) => ({ ...prev, titre_en: null }))
                  }}
                  error={formErrors.titre_en}
                />
              )}
            </div>

            <div>
              <DatePicker
                value={form.date_realisation}
                onChange={(val) => {
                  setForm((prev) => ({ ...prev, date_realisation: val }))
                  if (formErrors.date_realisation) {
                    setFormErrors((prev) => ({ ...prev, date_realisation: null }))
                  }
                }}
                label="Date de livraison"
                required
                error={formErrors.date_realisation}
              />
            </div>
          </div>

          {/* IMAGE PRINCIPALE DU CHANTIER */}
          <div className="space-y-3">
            <ImageUploader
              value={form.image_preview}
              file={form.image}
              onChange={(file, previewUrl) => {
                setForm((prev) => ({
                  ...prev,
                  image: file,
                  image_preview: previewUrl,
                }))
                if (formErrors.image) setFormErrors((prev) => ({ ...prev, image: null }))
              }}
              label="Image principale du chantier"
              hint="JPEG, PNG ou WebP · 5 Mo max · Téléversement direct depuis l'appareil"
              aspectRatio="aspect-video"
              error={formErrors.image}
            />
          </div>

          {/* LE TRIPTYQUE D'INGÉNIERIE B2B */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E8E4DF]">
              <ProjetsIcon size={16} className="text-[#C0392B]" />
              <h2 className="fl-admin-micro text-[#777777]">
                Le Triptyque d&apos;Ingénierie B2B ({activeLang.toUpperCase()})
              </h2>
            </div>

            {/* 1. BESOIN CLIENT */}
            <div className="p-4 rounded-2xl border border-[#E8E4DF] bg-white space-y-2">
              <div className="flex items-center gap-2 text-[#111111]">
                <span className="w-2 h-2 rounded-full bg-[#C0392B]" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  1. Le Besoin Client
                </span>
              </div>
              <p className="text-[11.5px] text-[#777777]">
                Volume de stockage attendu, effectif à loger, échéances de livraison...
              </p>
              {activeLang === 'fr' ? (
                <FormTextarea
                  placeholder="ex: Abri sous tension mécanique pour 15 000 tonnes de minerai aurifère..."
                  rows={3}
                  value={form.besoin_client_fr}
                  onChange={(e) => {
                    const val = e.target.value
                    setForm((prev) => ({ ...prev, besoin_client_fr: val }))
                  }}
                  error={formErrors.besoin_client_fr}
                />
              ) : (
                <FormTextarea
                  placeholder="e.g. Tensioned fabric shelter for 15,000 tons of gold ore awaiting crushing..."
                  rows={3}
                  value={form.besoin_client_en}
                  onChange={(e) => {
                    const val = e.target.value
                    setForm((prev) => ({ ...prev, besoin_client_en: val }))
                  }}
                  error={formErrors.besoin_client_en}
                />
              )}
            </div>

            {/* 2. CONTRAINTES DU SITE */}
            <div className="p-4 rounded-2xl border border-[#E8E4DF] bg-white space-y-2">
              <div className="flex items-center gap-2 text-[#111111]">
                <AlertTriangleIcon size={14} className="text-amber-600" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  2. Les Contraintes du Site & Terrain
                </span>
              </div>
              <p className="text-[11.5px] text-[#777777]">
                Hygrométrie, vent, absence de réseau électrique, sol sablonneux, enclavement...
              </p>
              {activeLang === 'fr' ? (
                <FormTextarea
                  placeholder="ex: Vents cycloniques violents, hygrométrie 95% et interdiction de piliers intermédiaires..."
                  rows={3}
                  value={form.contraintes_fr}
                  onChange={(e) => {
                    const val = e.target.value
                    setForm((prev) => ({ ...prev, contraintes_fr: val }))
                  }}
                  error={formErrors.contraintes_fr}
                />
              ) : (
                <FormTextarea
                  placeholder="e.g. Cyclonic wind gusts, 95% humidity, and total prohibition of intermediate pillars..."
                  rows={3}
                  value={form.contraintes_en}
                  onChange={(e) => {
                    const val = e.target.value
                    setForm((prev) => ({ ...prev, contraintes_en: val }))
                  }}
                  error={formErrors.contraintes_en}
                />
              )}
            </div>

            {/* 3. SOLUTION TECHNIQUE */}
            <div className="p-4 rounded-2xl border border-[#E8E4DF] bg-white space-y-2">
              <div className="flex items-center gap-2 text-[#111111]">
                <WrenchIcon size={14} className="text-[#1E824C]" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  3. La Solution Technique FL Structures
                </span>
              </div>
              <p className="text-[11.5px] text-[#777777]">
                Matériaux déployés, portée libre, fondations modulaires, énergie hybride...
              </p>
              {activeLang === 'fr' ? (
                <FormTextarea
                  placeholder="ex: Structure métallo-textile en aluminium anodisé avec membrane PVC auto-extinguible M2..."
                  rows={3}
                  value={form.solution_fr}
                  onChange={(e) => {
                    const val = e.target.value
                    setForm((prev) => ({ ...prev, solution_fr: val }))
                  }}
                  error={formErrors.solution_fr}
                />
              ) : (
                <FormTextarea
                  placeholder="e.g. Anodized aluminum tensioned fabric structure with M2 fire-retardant PVC membrane..."
                  rows={3}
                  value={form.solution_en}
                  onChange={(e) => {
                    const val = e.target.value
                    setForm((prev) => ({ ...prev, solution_en: val }))
                  }}
                  error={formErrors.solution_en}
                />
              )}
            </div>
          </div>
        </form>
      </SlideOverDrawer>

      {/* Dialogue de confirmation */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.action}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Supprimer définitivement"
        cancelText="Annuler"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
