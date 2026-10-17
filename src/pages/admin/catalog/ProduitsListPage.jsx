import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ProduitsIcon,
  PlusIcon,
  SearchIcon,
  EditIcon,
  TrashIcon,
  ImageIcon,
  CheckIcon,
  CategoriesIcon,
} from '../../../components/admin/icons/AdminIcons'
import { toast } from 'sonner'

import produitService from '../../../services/api/produit.service'
import categoryService from '../../../services/api/category.service'
import { resolveImageUrl, handleImageError } from '../../../utils/imageUrl'
import DataTable from '../../../components/admin/ui/DataTable'
import TablePagination from '../../../components/admin/ui/TablePagination'
import SlideOverDrawer from '../../../components/admin/ui/SlideOverDrawer'
import ConfirmDialog from '../../../components/admin/ui/ConfirmDialog'
import StatusBadge from '../../../components/admin/ui/StatusBadge'
import FormInput from '../../../components/admin/forms/FormInput'
import FormTextarea from '../../../components/admin/forms/FormTextarea'
import FormSelect from '../../../components/admin/forms/FormSelect'
import FormSwitch from '../../../components/admin/forms/FormSwitch'
import BilingualTabs from '../../../components/admin/forms/BilingualTabs'
import ImageUploader from '../../../components/admin/forms/ImageUploader'

export default function ProduitsListPage() {
  const queryClient = useQueryClient()

  // Filtres
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortColumn, setSortColumn] = useState('nom_fr')
  const [sortDirection, setSortDirection] = useState('asc')

  // Tiroir & Dialogue
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingProduit, setEditingProduit] = useState(null)
  const [activeLang, setActiveLang] = useState('fr')

  // État unifié du formulaire (persistant sans perte entre les onglets de langue)
  const [form, setForm] = useState({
    categorie_id: '',
    nom_fr: '',
    nom_en: '',
    description_courte_fr: '',
    description_courte_en: '',
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

  // Récupération des catégories (pour filtre et sélecteur dans le formulaire)
  const { data: rawCategories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  })

  const categories = useMemo(() => {
    if (Array.isArray(rawCategories)) return rawCategories
    if (Array.isArray(rawCategories?.data)) return rawCategories.data
    return []
  }, [rawCategories])

  // Récupération des produits
  const { data: rawProduits = [], isLoading } = useQuery({
    queryKey: ['produits', selectedCategory, searchTerm],
    queryFn: () =>
      produitService.getProduits({
        categorie_id: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchTerm || undefined,
      }),
  })

  const produits = useMemo(() => {
    if (Array.isArray(rawProduits)) return rawProduits
    if (Array.isArray(rawProduits?.data)) return rawProduits.data
    return []
  }, [rawProduits])

  // Dictionnaire ID -> Nom Catégorie
  const categoryMap = useMemo(() => {
    const map = {}
    categories.forEach((c) => {
      map[c.id] = c.nom_fr
    })
    return map
  }, [categories])

  // Invalidation globale des caches TanStack Query
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['categories'] })
    queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
    queryClient.invalidateQueries({ queryKey: ['produits'] })
    queryClient.invalidateQueries({ queryKey: ['admin-produits'] })
    queryClient.invalidateQueries({ queryKey: ['catalog', 'categories'] })
    queryClient.invalidateQueries({ queryKey: ['catalog', 'produits'] })
  }

  // Mutations
  const createMutation = useMutation({
    mutationFn: (formData) => produitService.createProduit(formData),
    onSuccess: (newProd) => {
      invalidateAll()
      const title = newProd?.nom_fr || form.nom_fr
      toast.success(`Produit "${title}" ajouté au catalogue.`)
      setIsDrawerOpen(false)
      setEditingProduit(null)
      setForm({
        categorie_id: categories[0]?.id ? String(categories[0].id) : '',
        nom_fr: '',
        nom_en: '',
        description_courte_fr: '',
        description_courte_en: '',
        actif: 1,
        image: null,
        image_preview: '',
      })
      setFormErrors({})
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Erreur lors de la création du produit.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }) => produitService.updateProduit(id, formData),
    onSuccess: (updated) => {
      invalidateAll()
      const title = updated?.nom_fr || form.nom_fr
      toast.success(`Produit "${title}" mis à jour avec succès.`)
      setIsDrawerOpen(false)
      setEditingProduit(null)
      setForm({
        categorie_id: categories[0]?.id ? String(categories[0].id) : '',
        nom_fr: '',
        nom_en: '',
        description_courte_fr: '',
        description_courte_en: '',
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

  const deleteMutation = useMutation({
    mutationFn: (id) => produitService.deleteProduit(id),
    onSuccess: () => {
      invalidateAll()
      toast.success('Produit retiré du catalogue.')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression.')
    },
  })

  // Actions d'ouverture
  const handleEdit = (produit) => {
    setEditingProduit(produit)
    setForm({
      categorie_id: produit.categorie_id ? String(produit.categorie_id) : (categories[0]?.id ? String(categories[0].id) : ''),
      nom_fr: produit.nom_fr || '',
      nom_en: produit.nom_en || '',
      description_courte_fr: produit.description_courte_fr || '',
      description_courte_en: produit.description_courte_en || '',
      actif: Number(produit.actif) ? 1 : 0,
      image: null,
      image_preview: produit.image_url ? resolveImageUrl(produit.image_url) : '',
    })
    setFormErrors({})
    setActiveLang('fr')
    setIsDrawerOpen(true)
  }

  const handleCreateNew = () => {
    setEditingProduit(null)
    setForm({
      categorie_id: categories[0]?.id ? String(categories[0].id) : '',
      nom_fr: '',
      nom_en: '',
      description_courte_fr: '',
      description_courte_en: '',
      actif: 1,
      image: null,
      image_preview: '',
    })
    setFormErrors({})
    setActiveLang('fr')
    setIsDrawerOpen(true)
  }

  // Soumission
  const handleSubmitForm = (e) => {
    if (e) e.preventDefault()

    const errors = {}
    if (!form.categorie_id) {
      errors.categorie_id = 'Veuillez sélectionner une catégorie principale.'
    }
    if (!form.nom_fr || !form.nom_fr.trim()) {
      errors.nom_fr = 'Le nom du produit (français) est obligatoire.'
      setActiveLang('fr')
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      toast.error('Veuillez renseigner les champs obligatoires.')
      return
    }

    const formData = new FormData()
    formData.append('categorie_id', Number(form.categorie_id))
    formData.append('nom_fr', form.nom_fr.trim())
    formData.append('nom_en', (form.nom_en || '').trim())
    formData.append('description_courte_fr', (form.description_courte_fr || '').trim())
    formData.append('description_courte_en', (form.description_courte_en || '').trim())
    formData.append('actif', form.actif ? 1 : 0)

    // Fichier image réel téléversé depuis l'ordinateur
    if (form.image instanceof File) {
      formData.append('image', form.image)
    }

    if (editingProduit) {
      updateMutation.mutate({ id: editingProduit.id, formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  // Filtrage local supplémentaire et Tri
  const filteredData = useMemo(() => {
    let result = Array.isArray(produits) ? [...produits] : []

    if (selectedCategory !== 'all') {
      result = result.filter((p) => String(p.categorie_id) === String(selectedCategory))
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim()
      result = result.filter(
        (p) =>
          (p.nom_fr && p.nom_fr.toLowerCase().includes(q)) ||
          (p.nom_en && p.nom_en.toLowerCase().includes(q)) ||
          (p.description_courte_fr && p.description_courte_fr.toLowerCase().includes(q))
      )
    }

    return result.sort((a, b) => {
      const valA = a[sortColumn]
      const valB = b[sortColumn]
      if (sortDirection === 'asc') return valA > valB ? 1 : -1
      return valA < valB ? 1 : -1
    })
  }, [produits, selectedCategory, searchTerm, sortColumn, sortDirection])

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

  // Définition des colonnes du tableau
  const columns = [
    {
      header: 'Photo',
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
      header: 'Désignation du Produit',
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
      header: 'Catégorie Associée',
      accessor: 'categorie_id',
      sortable: true,
      cell: (item) => {
        const catName = item.categorie_nom_fr || categoryMap[item.categorie_id] || 'Non catégorisé'
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF8F6] border border-[#E8E4DF] text-xs font-medium text-[#111111]">
            <CategoriesIcon size={12} className="text-[#C0392B]" />
            <span>{catName}</span>
          </span>
        )
      },
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
            label={isActif ? '• Actif' : '• Brouillon'}
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
                title: `Supprimer le produit "${item.nom_fr}" ?`,
                message:
                  'Ce produit modulaire ne sera plus disponible dans le catalogue et sur les formulaires de devis.',
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
            <ProduitsIcon size={13} />
            <span>Catalogue Modulaire</span>
          </div>
          <h1 className="fl-admin-title-page text-[#111111]">
            Produits & Structures Modulaires
          </h1>
          <p className="fl-admin-body text-[#666666] mt-1">
            Gérez la gamme de hangars, dômes géodésiques, conteneurs et tentes industrielles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-xl text-xs font-semibold text-white bg-[#C0392B] hover:bg-[#A93226] shadow-xs hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-[#C0392B]/30 cursor-pointer"
          >
            <PlusIcon size={15} />
            <span>Ajouter un Produit</span>
          </button>
        </div>
      </div>

      {/* 2. Barre d'outils : Filtres & Recherche */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Recherche instantanée */}
        <div className="relative w-full sm:w-80">
          <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999999] pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher par nom de produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 pl-10 pr-3 text-sm bg-white border border-[#E8E4DF] rounded-xl text-[#111111] placeholder-[#999999] focus:outline-none focus:border-[#C0392B] focus:ring-2 focus:ring-[#C0392B]/15 transition-all shadow-xs"
          />
        </div>

        {/* Filtre par Catégorie */}
        <div className="w-full sm:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full h-11 px-3 text-xs bg-white border border-[#E8E4DF] rounded-xl text-[#111111] focus:outline-none focus:border-[#C0392B] focus:ring-2 focus:ring-[#C0392B]/15 transition-all shadow-xs cursor-pointer font-medium"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nom_fr}
              </option>
            ))}
          </select>
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
        emptyTitle="Aucun produit trouvé"
        emptyMessage={
          searchTerm || selectedCategory !== 'all'
            ? 'Aucun produit ne correspond à vos critères de filtrage.'
            : 'Ajoutez votre premier produit modulaire au catalogue.'
        }
        emptyActionLabel="Ajouter un produit"
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
          setEditingProduit(null)
        }}
        title={
          editingProduit
            ? `Modifier : ${editingProduit.nom_fr || ''}`
            : 'Ajouter un Produit Modulaire'
        }
        subtitle="Renseignez la catégorie de rattachement, le nom et les descriptions."
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              onClick={() => {
                setIsDrawerOpen(false)
                setEditingProduit(null)
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
                  : editingProduit
                  ? 'Mettre à jour'
                  : 'Enregistrer le produit'}
              </span>
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmitForm} className="space-y-6">
          {/* Choix de la catégorie */}
          <FormSelect
            label="Catégorie Principale"
            required
            value={form.categorie_id}
            onChange={(e) => {
              const val = e.target.value
              setForm((prev) => ({ ...prev, categorie_id: val }))
              if (formErrors.categorie_id) {
                setFormErrors((prev) => ({ ...prev, categorie_id: null }))
              }
            }}
            error={formErrors.categorie_id}
            options={categories.map((c) => ({
              value: String(c.id),
              label: c.nom_fr,
            }))}
          />

          {/* Commutateur de langue */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DF]">
            <span className="fl-admin-micro text-[#777777]">
              Langue de saisie
            </span>
            <BilingualTabs activeTab={activeLang} onChange={setActiveLang} />
          </div>

          {/* Nom du produit (persistant) */}
          {activeLang === 'fr' ? (
            <FormInput
              label="Nom du Produit (Français) *"
              placeholder="ex: Hangar Almaconst Portée 20m"
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
              label="Nom du Produit (Anglais)"
              placeholder="ex: Almaconst Heavy Hangar 20m Span"
              value={form.nom_en}
              onChange={(e) => {
                const val = e.target.value
                setForm((prev) => ({ ...prev, nom_en: val }))
                if (formErrors.nom_en) setFormErrors((prev) => ({ ...prev, nom_en: null }))
              }}
              error={formErrors.nom_en}
            />
          )}

          {/* Description courte (persistant) */}
          {activeLang === 'fr' ? (
            <FormTextarea
              label="Description Technique Courte (Français)"
              placeholder="Spécifications acier, isolation, usage recommandé..."
              rows={3}
              value={form.description_courte_fr}
              onChange={(e) => {
                const val = e.target.value
                setForm((prev) => ({ ...prev, description_courte_fr: val }))
              }}
              error={formErrors.description_courte_fr}
            />
          ) : (
            <FormTextarea
              label="Short Technical Description (English)"
              placeholder="Steel frame specs, insulation, recommended usage..."
              rows={3}
              value={form.description_courte_en}
              onChange={(e) => {
                const val = e.target.value
                setForm((prev) => ({ ...prev, description_courte_en: val }))
              }}
              error={formErrors.description_courte_en}
            />
          )}

          {/* Vraie zone de téléversement d'image depuis l'ordinateur (Remplacement du champ texte) */}
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
            label="Visuel représentatif du produit"
            hint="JPEG, PNG ou WebP · Téléversement direct depuis votre appareil"
            aspectRatio="aspect-[16/9]"
            error={formErrors.image}
          />

          {/* Interrupteur Produit publié au catalogue */}
          <div className="pt-2 border-t border-[#E8E4DF]">
            <FormSwitch
              checked={Boolean(form.actif)}
              onChange={(checked) => setForm((prev) => ({ ...prev, actif: checked ? 1 : 0 }))}
              label="Produit publié au catalogue"
              description="Si coché, ce produit sera accessible en ligne et sélectionnable dans le configurateur de devis."
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
