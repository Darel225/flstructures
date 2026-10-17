import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CategoriesIcon,
  PlusIcon,
  SearchIcon,
  EditIcon,
  TrashIcon,
  ImageIcon,
  CheckIcon,
} from '../../../components/admin/icons/AdminIcons'
import { toast } from 'sonner'

import categoryService from '../../../services/api/category.service'
import { resolveImageUrl, handleImageError } from '../../../utils/imageUrl'
import DataTable from '../../../components/admin/ui/DataTable'
import TablePagination from '../../../components/admin/ui/TablePagination'
import SlideOverDrawer from '../../../components/admin/ui/SlideOverDrawer'
import ConfirmDialog from '../../../components/admin/ui/ConfirmDialog'
import StatusBadge from '../../../components/admin/ui/StatusBadge'
import FormInput from '../../../components/admin/forms/FormInput'
import FormSwitch from '../../../components/admin/forms/FormSwitch'
import BilingualTabs from '../../../components/admin/forms/BilingualTabs'
import ImageUploader from '../../../components/admin/forms/ImageUploader'

export default function CategoriesListPage() {
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortColumn, setSortColumn] = useState('ordre_affichage')
  const [sortDirection, setSortDirection] = useState('asc')

  // Panneau latéral & modale
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [activeLang, setActiveLang] = useState('fr')

  // État unifié du formulaire (persistant entre les onglets FR et EN)
  const [form, setForm] = useState({
    nom_fr: '',
    nom_en: '',
    ordre_affichage: 1,
    actif: 1,
    image: null,
    image_preview: '',
  })
  const [formErrors, setFormErrors] = useState({})

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: () => {},
  })

  // Récupération des catégories
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  })

  // Invalidation globale des caches TanStack Query
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['categories'] })
    queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
    queryClient.invalidateQueries({ queryKey: ['produits'] })
    queryClient.invalidateQueries({ queryKey: ['admin-produits'] })
    queryClient.invalidateQueries({ queryKey: ['catalog', 'categories'] })
    queryClient.invalidateQueries({ queryKey: ['catalog', 'produits'] })
  }

  // Mutation de Création
  const createMutation = useMutation({
    mutationFn: (formData) => categoryService.createCategory(formData),
    onSuccess: (newCat) => {
      invalidateAll()
      const title = newCat?.nom_fr || form.nom_fr
      toast.success(`Catégorie "${title}" créée avec succès.`)
      setIsDrawerOpen(false)
      setEditingCategory(null)
      setForm({
        nom_fr: '',
        nom_en: '',
        ordre_affichage: 1,
        actif: 1,
        image: null,
        image_preview: '',
      })
      setFormErrors({})
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Erreur lors de la création de la catégorie.')
    },
  })

  // Mutation de Mise à jour
  const updateMutation = useMutation({
    mutationFn: ({ id, formData }) => categoryService.updateCategory(id, formData),
    onSuccess: (updated) => {
      invalidateAll()
      const title = updated?.nom_fr || form.nom_fr
      toast.success(`Catégorie "${title}" mise à jour avec succès.`)
      setIsDrawerOpen(false)
      setEditingCategory(null)
      setForm({
        nom_fr: '',
        nom_en: '',
        ordre_affichage: 1,
        actif: 1,
        image: null,
        image_preview: '',
      })
      setFormErrors({})
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour.')
    },
  })

  // Mutation de Suppression
  const deleteMutation = useMutation({
    mutationFn: (id) => categoryService.deleteCategory(id),
    onSuccess: () => {
      invalidateAll()
      toast.success('Catégorie supprimée avec succès.')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression.')
    },
  })

  // Ouvrir le formulaire en mode édition
  const handleEdit = (category) => {
    setEditingCategory(category)
    setForm({
      nom_fr: category.nom_fr || '',
      nom_en: category.nom_en || '',
      ordre_affichage: category.ordre_affichage ?? 1,
      actif: Number(category.actif) ? 1 : 0,
      image: null,
      image_preview: category.image_url ? resolveImageUrl(category.image_url) : '',
    })
    setFormErrors({})
    setActiveLang('fr')
    setIsDrawerOpen(true)
  }

  // Ouvrir en mode création
  const handleCreateNew = () => {
    setEditingCategory(null)
    setForm({
      nom_fr: '',
      nom_en: '',
      ordre_affichage: Array.isArray(categories) ? categories.length + 1 : 1,
      actif: 1,
      image: null,
      image_preview: '',
    })
    setFormErrors({})
    setActiveLang('fr')
    setIsDrawerOpen(true)
  }

  // Soumission du formulaire
  const handleSubmitForm = (e) => {
    if (e) e.preventDefault()

    const errors = {}
    if (!form.nom_fr || !form.nom_fr.trim()) {
      errors.nom_fr = 'Le nom de la catégorie (français) est obligatoire.'
      setActiveLang('fr')
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      toast.error('Veuillez renseigner les champs obligatoires.')
      return
    }

    const formData = new FormData()
    formData.append('nom_fr', form.nom_fr.trim())
    formData.append('nom_en', (form.nom_en || '').trim())
    formData.append('ordre_affichage', Number(form.ordre_affichage || 1))
    formData.append('actif', form.actif ? 1 : 0)

    // Fichier image réel si sélectionné depuis l'ordinateur
    if (form.image instanceof File) {
      formData.append('image', form.image)
    } else if (!form.image_preview) {
      // Suppression explicite de l'image si le visuel a été retiré
      formData.append('image_url', '')
    }

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  // Filtrage et Tri
  const filteredData = useMemo(() => {
    let result = Array.isArray(categories) ? [...categories] : []
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim()
      result = result.filter(
        (c) =>
          (c.nom_fr && c.nom_fr.toLowerCase().includes(q)) ||
          (c.nom_en && c.nom_en.toLowerCase().includes(q))
      )
    }
    return result.sort((a, b) => {
      const valA = a[sortColumn]
      const valB = b[sortColumn]
      if (sortDirection === 'asc') return valA > valB ? 1 : -1
      return valA < valB ? 1 : -1
    })
  }, [categories, searchTerm, sortColumn, sortDirection])

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
    }
  }

  // Colonnes du tableau
  const columns = [
    {
      header: 'Visuel',
      accessor: 'image_url',
      className: 'w-16',
      cell: (item) => {
        const resolvedSrc = resolveImageUrl(item.image_url)
        return (
          <div className="w-12 h-10 rounded-xl overflow-hidden bg-[#FAF8F6] border border-[#E8E4DF] flex items-center justify-center shrink-0">
            {resolvedSrc ? (
              <img
                src={resolvedSrc}
                alt={item.nom_fr}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            ) : (
              <ImageIcon size={18} className="text-[#999999]" />
            )}
          </div>
        )
      },
    },
    {
      header: 'Nom de la Catégorie',
      accessor: 'nom_fr',
      sortable: true,
      cell: (item) => (
        <div>
          <span className="font-semibold text-[#111111] block">
            {item.nom_fr}
          </span>
          {item.nom_en && (
            <span className="text-[12px] text-[#777777] font-medium">
              EN: {item.nom_en}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Ordre',
      accessor: 'ordre_affichage',
      sortable: true,
      className: 'font-mono font-medium text-[#111111] tabular-nums',
    },
    {
      header: 'Statut',
      accessor: 'actif',
      sortable: true,
      cell: (item) => {
        const isActif = Number(item.actif) === 1 || item.actif === true
        return (
          <StatusBadge
            status={isActif}
            label={isActif ? '• Publié' : '• Brouillon'}
            variant={isActif ? 'success' : 'neutral'}
          />
        )
      },
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (item) => (
        <div
          className="flex items-center justify-end gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => handleEdit(item)}
            className="p-1.5 rounded-lg hover:bg-[#FAF8F6] text-[#666666] hover:text-[#111111] border border-transparent hover:border-[#E8E4DF] transition-colors cursor-pointer"
            title="Modifier"
          >
            <EditIcon size={15} />
          </button>
          <button
            type="button"
            onClick={() => {
              setConfirmDialog({
                isOpen: true,
                title: `Supprimer la catégorie "${item.nom_fr}" ?`,
                message:
                  'Attention : cette suppression détachera également tous les produits modulaires qui lui sont rattachés.',
                action: () => deleteMutation.mutate(item.id),
              })
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

  return (
    <div className="space-y-6">
      {/* 1. En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E8E4DF]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-[#C0392B] text-xs font-medium tracking-wide mb-2 border border-red-100">
            <CategoriesIcon size={13} />
            <span>Catalogue Modulaire</span>
          </div>
          <h1 className="fl-admin-title-page text-[#111111]">
            Catégories de Structures
          </h1>
          <p className="fl-admin-body text-[#666666] mt-1">
            Gérez les groupes principaux de hangars, tentes, abris de maintenance et bases-vie.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-xl text-xs font-semibold text-white bg-[#C0392B] hover:bg-[#A93226] shadow-xs hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-[#C0392B]/30 cursor-pointer"
          >
            <PlusIcon size={15} />
            <span>Nouvelle Catégorie</span>
          </button>
        </div>
      </div>

      {/* 2. Recherche & Filtres */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999999] pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher une catégorie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 pl-10 pr-3 text-sm bg-white border border-[#E8E4DF] rounded-xl text-[#111111] placeholder-[#999999] focus:outline-none focus:border-[#C0392B] focus:ring-2 focus:ring-[#C0392B]/15 transition-all shadow-xs"
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
        onRowClick={handleEdit}
        emptyTitle="Aucune catégorie de structure"
        emptyMessage="Créez votre première catégorie pour organiser le catalogue de produits."
        emptyActionLabel="Créer une catégorie"
        onEmptyAction={handleCreateNew}
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

      {/* 5. SlideOverDrawer : Création / Édition */}
      <SlideOverDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false)
          setEditingCategory(null)
        }}
        title={
          editingCategory
            ? `Modifier : ${editingCategory.nom_fr || ''}`
            : 'Créer une Catégorie Modulaire'
        }
        subtitle="Renseignez les dénominations bilingues et les paramètres d’affichage."
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              onClick={() => {
                setIsDrawerOpen(false)
                setEditingCategory(null)
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#777777] hover:text-[#111111] hover:bg-[#FAF8F6] transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={createMutation.isPending || updateMutation.isPending}
              onClick={handleSubmitForm}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#C0392B] hover:bg-[#A93226] shadow-xs transition-all disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#C0392B]/30 cursor-pointer"
            >
              <CheckIcon size={14} />
              <span>
                {createMutation.isPending || updateMutation.isPending
                  ? 'Enregistrement...'
                  : editingCategory
                  ? 'Mettre à jour'
                  : 'Créer la catégorie'}
              </span>
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmitForm} className="space-y-6">
          {/* Commutateur de langue */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DF]">
            <span className="fl-admin-micro text-[#777777]">
              Langue d’édition
            </span>
            <BilingualTabs activeTab={activeLang} onChange={setActiveLang} />
          </div>

          {/* Nom Bilingue (conservé sans réinitialisation entre onglets) */}
          {activeLang === 'fr' ? (
            <FormInput
              label="Nom de la Catégorie (Français) *"
              placeholder="ex: Hangars de Stockage Lourds"
              required
              value={form.nom_fr}
              onChange={(e) => {
                const val = e.target.value
                setForm((prev) => ({ ...prev, nom_fr: val }))
                if (formErrors.nom_fr) setFormErrors((prev) => ({ ...prev, nom_fr: null }))
              }}
              error={formErrors.nom_fr}
            />
          ) : (
            <FormInput
              label="Nom de la Catégorie (Anglais)"
              placeholder="ex: Heavy Industrial Storage Hangars"
              value={form.nom_en}
              onChange={(e) => {
                const val = e.target.value
                setForm((prev) => ({ ...prev, nom_en: val }))
                if (formErrors.nom_en) setFormErrors((prev) => ({ ...prev, nom_en: null }))
              }}
              error={formErrors.nom_en}
            />
          )}

          {/* Ordre d'affichage */}
          <FormInput
            type="number"
            label="Ordre d’affichage"
            placeholder="1"
            hint="Définit la position dans la liste (1 en premier)."
            required
            value={form.ordre_affichage}
            onChange={(e) => {
              const val = e.target.value
              setForm((prev) => ({ ...prev, ordre_affichage: val }))
            }}
            error={formErrors.ordre_affichage}
          />

          {/* Visuel représentatif avec prévisualisation instantanée */}
          <ImageUploader
            value={form.image_preview}
            file={form.image}
            onChange={(file, previewUrl) => {
              setForm((prev) => ({
                ...prev,
                image: file,
                image_preview: previewUrl,
              }))
            }}
            label="Visuel représentatif"
            hint="JPEG, PNG ou WebP · Téléversement direct depuis votre appareil"
            aspectRatio="aspect-[16/9]"
            error={formErrors.image}
          />

          {/* Interrupteur Catégorie active */}
          <div className="pt-2 border-t border-[#E8E4DF]">
            <FormSwitch
              checked={Boolean(form.actif)}
              onChange={(checked) => setForm((prev) => ({ ...prev, actif: checked ? 1 : 0 }))}
              label="Catégorie active"
              description="Si désactivé, cette catégorie et ses produits ne seront pas visibles par les clients."
            />
          </div>
        </form>
      </SlideOverDrawer>

      {/* 6. Modale de confirmation */}
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
        confirmText="Supprimer définitivement"
      />
    </div>
  )
}
