import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ResidencesIcon,
  PlusIcon,
  MinusIcon,
  SearchIcon,
  EditIcon,
  TrashIcon,
  CheckIcon,
  ImageIcon,
  EquipementsIcon,
} from '../../../components/admin/icons/AdminIcons'
import { toast } from 'sonner'

import hebergementService from '../../../services/api/hebergement.service'
import equipementService from '../../../services/api/equipement.service'
import { hebergementSchema } from '../../../schemas/engineeringSchemas'
import DataTable from '../../../components/admin/ui/DataTable'
import TablePagination from '../../../components/admin/ui/TablePagination'
import SlideOverDrawer from '../../../components/admin/ui/SlideOverDrawer'
import ConfirmDialog from '../../../components/admin/ui/ConfirmDialog'
import StatusBadge from '../../../components/admin/ui/StatusBadge'
import { resolveImageUrl, handleImageError } from '../../../utils/imageUrl'
import FormInput from '../../../components/admin/forms/FormInput'
import FormTextarea from '../../../components/admin/forms/FormTextarea'
import FormSwitch from '../../../components/admin/forms/FormSwitch'
import BilingualTabs from '../../../components/admin/forms/BilingualTabs'
import GalleryUploader from '../../../components/admin/forms/GalleryUploader'
import { renderLucideIcon } from '../../../components/admin/forms/iconList'
import { generateUniqueSlug } from '../../../utils/slugify'

export default function HebergementsListPage() {
  const queryClient = useQueryClient()

  // Filtres & Pagination
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL') // 'ALL' | 'ACTIVE' | 'INACTIVE'
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Tiroir & Formulaire
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingHebergement, setEditingHebergement] = useState(null)
  const [activeLang, setActiveLang] = useState('fr')
  const [selectedFiles, setSelectedFiles] = useState([])

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setEditingHebergement(null)
    setSelectedFiles([])
    reset()
  }

  // Modale de confirmation
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: () => {},
  })

  // Formulaire React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(hebergementSchema),
    defaultValues: {
      nom_residence: '',
      slug: '',
      localisation: '',
      nombre_pieces: 1,
      capacite_accueil: 2,
      description_fr: '',
      description_en: '',
      is_active: true,
      images: [],
      equipement_ids: [],
    },
  })

  // Récupération des hébergements
  const {
    data: hebergements = [],
    isLoading: isLoadingHebergements,
    refetch: refetchHebergements,
  } = useQuery({
    queryKey: ['hebergements'],
    queryFn: () => hebergementService.getHebergements(),
  })

  // Récupération du référentiel des équipements pour la grille de cases à cocher
  const { data: equipements = [] } = useQuery({
    queryKey: ['equipements'],
    queryFn: () => equipementService.getEquipements(),
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => hebergementService.createHebergement(data),
    onSuccess: (newHeb) => {
      queryClient.invalidateQueries({ queryKey: ['hebergements'] })
      queryClient.invalidateQueries({ queryKey: ['admin-hebergements'] })
      refetchHebergements()
      const resName = newHeb?.nom_residence || 'Nouvelle résidence'
      toast.success(`Résidence "${resName}" créée avec succès.`)
      handleCloseDrawer()
    },
    onError: (err) => {
      console.error('[Hebergements] Erreur lors de la création :', err)
      const errorMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Erreur lors de la création de la résidence.'
      toast.error(errorMsg)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => hebergementService.updateHebergement(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['hebergements'] })
      queryClient.invalidateQueries({ queryKey: ['admin-hebergements'] })
      refetchHebergements()
      const resName = updated?.nom_residence || 'Résidence'
      toast.success(`Résidence "${resName}" mise à jour.`)
      handleCloseDrawer()
    },
    onError: (err) => {
      console.error('[Hebergements] Erreur lors de la mise à jour :', err)
      const errorMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Erreur lors de la mise à jour.'
      toast.error(errorMsg)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => hebergementService.deleteHebergement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hebergements'] })
      queryClient.invalidateQueries({ queryKey: ['admin-hebergements'] })
      refetchHebergements()
      toast.success('Hébergement supprimé.')
      setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
    },
    onError: () => toast.error('Erreur lors de la suppression.'),
  })

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, currentStatus }) =>
      hebergementService.updateHebergement(id, { is_active: !currentStatus }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['hebergements'] })
      queryClient.invalidateQueries({ queryKey: ['admin-hebergements'] })
      refetchHebergements()
      toast.success(
        `Statut mis à jour : ${updated.is_active ? 'Actif' : 'Inactif'}`
      )
    },
    onError: () => toast.error('Impossible de modifier le statut.'),
  })

  // Filtrage des données
  const filteredData = useMemo(() => {
    return hebergements.filter((item) => {
      // Filtre statut
      if (statusFilter === 'ACTIVE' && !item.is_active) return false
      if (statusFilter === 'INACTIVE' && item.is_active) return false

      // Filtre texte
      if (!searchTerm.trim()) return true
      const q = searchTerm.toLowerCase()
      return (
        item.nom_residence?.toLowerCase().includes(q) ||
        item.localisation?.toLowerCase().includes(q) ||
        item.description_fr?.toLowerCase().includes(q) ||
        item.description_en?.toLowerCase().includes(q)
      )
    })
  }, [hebergements, statusFilter, searchTerm])

  // Pagination
  const totalItems = filteredData.length
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, currentPage, pageSize])

  // Ouverture tiroir Création
  const handleOpenCreate = () => {
    setEditingHebergement(null)
    setActiveLang('fr')
    setSelectedFiles([])
    reset({
      nom_residence: '',
      slug: '',
      localisation: '',
      nombre_pieces: 1,
      capacite_accueil: 2,
      description_fr: '',
      description_en: '',
      is_active: true,
      images: [],
      equipement_ids: [],
    })
    setIsDrawerOpen(true)
  }

  // Ouverture tiroir Édition avec chargement complet et pré-remplissage des relations
  const handleOpenEdit = async (item) => {
    setEditingHebergement(item)
    setActiveLang('fr')
    setSelectedFiles([])

    const extractEquipementIds = (source) => {
      if (Array.isArray(source.equipements) && source.equipements.length > 0) {
        return source.equipements.map((e) => Number(typeof e === 'object' && e !== null ? e.id : e))
      }
      if (Array.isArray(source.equipement_ids) && source.equipement_ids.length > 0) {
        return source.equipement_ids.map((id) => Number(typeof id === 'object' && id !== null ? id.id : id))
      }
      return []
    }

    const formatImageUrl = (url) => {
      if (!url) return ''
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
        return url
      }
      return resolveImageUrl(url)
    }

    const extractImages = (source) => {
      if (Array.isArray(source.images) && source.images.length > 0) {
        return source.images.map((img, idx) => {
          if (typeof img === 'string') {
            return {
              image_url: formatImageUrl(img),
              is_cover: idx === 0,
            }
          }
          const rawUrl = img.image_url || img.url || ''
          return {
            id: img.id,
            image_url: formatImageUrl(rawUrl),
            is_cover: Boolean(img.is_cover),
          }
        })
      }
      if (source.cover_image_url) {
        return [
          {
            image_url: formatImageUrl(source.cover_image_url),
            is_cover: true,
          },
        ]
      }
      return []
    }

    const initialEquipIds = extractEquipementIds(item)
    const initialImages = extractImages(item)

    reset({
      nom_residence: item.nom_residence || '',
      slug: item.slug || '',
      localisation: item.localisation || '',
      description_fr: item.description_fr || '',
      description_en: item.description_en || '',
      nombre_pieces: Number(item.nombre_pieces || 1),
      capacite_accueil: Number(item.capacite_accueil || 2),
      is_active: Boolean(item.is_active),
      equipement_ids: initialEquipIds,
      images: initialImages,
    })
    setIsDrawerOpen(true)

    // Compléter avec les données complètes de l'API si l'identifiant est disponible
    if (item.id) {
      try {
        const fresh = await hebergementService.getHebergementById(item.id)
        if (fresh) {
          const freshEquipIds = extractEquipementIds(fresh).map((id) => {
            const num = Number(id)
            return !isNaN(num) && id !== '' && id !== null ? num : id
          })
          const freshImages = extractImages(fresh)

          reset({
            nom_residence: fresh.nom_residence || item.nom_residence || '',
            slug: fresh.slug || item.slug || '',
            localisation: fresh.localisation || item.localisation || '',
            nombre_pieces: Number(fresh.nombre_pieces || item.nombre_pieces || 1),
            capacite_accueil: Number(fresh.capacite_accueil || item.capacite_accueil || 2),
            description_fr: fresh.description_fr || item.description_fr || '',
            description_en: fresh.description_en || item.description_en || '',
            is_active: Boolean(fresh.is_active ?? item.is_active),
            images: freshImages.length > 0 ? freshImages : initialImages,
            equipement_ids: freshEquipIds.length > 0 ? freshEquipIds : initialEquipIds,
          })
        }
      } catch (err) {
        console.warn('[Hebergements] Détails additionnels non joignables, conservation des données reçues :', err)
      }
    }
  }

  // Callback d'erreur de validation React Hook Form
  const onFormError = (validationErrors) => {
    console.error('Erreurs de validation:', validationErrors)
    const errorKeys = Object.keys(validationErrors)
    if (errorKeys.length > 0) {
      const firstKey = errorKeys[0]
      const firstError = validationErrors[firstKey]
      const fieldLabels = {
        nom_residence: 'Nom de la résidence',
        localisation: 'Localisation géographique',
        description_fr: 'Description en français',
        description_en: 'Description en anglais',
        nombre_pieces: 'Nombre de pièces',
        capacite_accueil: "Capacité d'accueil",
        images: 'Galerie photos',
        equipement_ids: 'Équipements du site',
      }
      const label = fieldLabels[firstKey] || firstKey
      const msg = firstError?.message || 'Champ requis ou format invalide.'
      toast.error(`Formulaire incomplet : ${label} - ${msg}`, { duration: 5000 })

      // Si l'erreur concerne la description en anglais et qu'on est sur FR, basculer vers EN
      if (validationErrors.description_en && activeLang !== 'en') {
        setActiveLang('en')
      } else if (validationErrors.description_fr && activeLang !== 'fr') {
        setActiveLang('fr')
      }
    }
  }

  // Suppression d'une photo existante sur le serveur lors de l'édition
  const handleDeleteExistingImage = async (img) => {
    if (editingHebergement?.id && img?.id) {
      try {
        await hebergementService.deleteImage(editingHebergement.id, img.id)
        toast.success('Photo supprimée de la résidence.')
      } catch (err) {
        console.error('[Hebergements] Erreur suppression image :', err)
        toast.error("Impossible de supprimer la photo sur le serveur.")
      }
    }
  }

  // Changement de la couverture principale d'une image existante lors de l'édition
  const handleSetCoverExistingImage = async (img) => {
    if (editingHebergement?.id && img?.id) {
      try {
        await hebergementService.setCoverImage(editingHebergement.id, img.id)
        toast.success('Photo de couverture mise à jour.')
      } catch (err) {
        console.error('[Hebergements] Erreur définition couverture :', err)
      }
    }
  }

  // Soumission formulaire avec slug auto et persistance du slug en édition
  const onSubmit = (formData) => {
    console.log('[Hebergements] Validation réussie, données saisies :', formData)
    const existingSlugs = hebergements.map((h) => h.slug).filter(Boolean)
    const currentSlug = editingHebergement ? editingHebergement.slug : ''
    const finalSlug = editingHebergement
      ? editingHebergement.slug || generateUniqueSlug(formData.nom_residence, existingSlugs, currentSlug)
      : generateUniqueSlug(formData.nom_residence, existingSlugs)

    // Vrais fichiers images (File objects)
    const filesToUpload =
      selectedFiles && selectedFiles.length > 0
        ? selectedFiles
        : (formData.images || []).map((img) => img.file).filter(Boolean)

    if (editingHebergement) {
      // Construction FormData multipart/form-data pour la mise à jour
      const updateData = new FormData()
      updateData.append('nom_residence', formData.nom_residence)
      updateData.append('localisation', formData.localisation)
      if (formData.description_fr) updateData.append('description_fr', formData.description_fr)
      if (formData.description_en) updateData.append('description_en', formData.description_en)
      updateData.append('is_active', formData.is_active ? 1 : 0)
      if (finalSlug) updateData.append('slug', finalSlug)
      updateData.append('nombre_pieces', Number(formData.nombre_pieces || 1))
      updateData.append('capacite_accueil', Number(formData.capacite_accueil || 2))

      // Équipements cochés (permettant d'ajouter ou de désélectionner)
      if (Array.isArray(formData.equipement_ids)) {
        formData.equipement_ids.forEach((id) => {
          updateData.append('equipement_ids[]', Number(id))
        })
      }

      // Photos existantes conservées
      const keptImages = (formData.images || []).filter((img) => img.id && !img.file)
      keptImages.forEach((img) => {
        updateData.append('kept_image_ids[]', img.id)
      })

      // Image de couverture
      const coverImage = (formData.images || []).find((img) => img.is_cover)
      if (coverImage?.id) {
        updateData.append('cover_image_id', coverImage.id)
      }

      // Nouvelles photos File
      if (filesToUpload && filesToUpload.length > 0) {
        filesToUpload.forEach((file) => {
          updateData.append('images[]', file)
        })
      }

      console.log('[Hebergements] Appel mutation updateHebergement avec FormData :', {
        id: editingHebergement.id,
        nom_residence: formData.nom_residence,
        new_images: filesToUpload.length,
        equipement_ids: formData.equipement_ids,
      })
      updateMutation.mutate({ id: editingHebergement.id, data: updateData })
    } else {
      // Construction du FormData multipart/form-data
      const multipartData = new FormData()
      multipartData.append('nom_residence', formData.nom_residence)
      multipartData.append('localisation', formData.localisation)
      if (formData.description_fr) multipartData.append('description_fr', formData.description_fr)
      if (formData.description_en) multipartData.append('description_en', formData.description_en)
      multipartData.append('is_active', formData.is_active ? 1 : 0)
      if (finalSlug) multipartData.append('slug', finalSlug)
      multipartData.append('nombre_pieces', Number(formData.nombre_pieces || 1))
      multipartData.append('capacite_accueil', Number(formData.capacite_accueil || 2))

      // Équipements
      if (Array.isArray(formData.equipement_ids)) {
        formData.equipement_ids.forEach((id) => {
          multipartData.append('equipement_ids[]', id)
        })
      }

      // Vrais fichiers images (File objects)
      if (filesToUpload && filesToUpload.length > 0) {
        filesToUpload.forEach((file) => {
          multipartData.append('images[]', file)
        })
      }

      console.log('[Hebergements] Appel mutation createHebergement avec FormData :', {
        nom_residence: formData.nom_residence,
        images_count: filesToUpload.length,
        equipement_ids: formData.equipement_ids,
      })

      createMutation.mutate(multipartData)
    }
  }

  // Demande de suppression
  const handleDeletePrompt = (item) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Supprimer cette résidence ?',
      message: `Êtes-vous sûr de vouloir supprimer définitivement "${item.nom_residence}" ? Cette action est irréversible.`,
      action: () => deleteMutation.mutate(item.id),
    })
  }

  // Configuration des colonnes DataTable
  const columns = [
    {
      header: 'Visuel / Couverture',
      accessor: 'cover_image_url',
      cell: (item) => {
        const coverImg = item.cover_image_url
          ? item.cover_image_url.startsWith('http')
            ? item.cover_image_url
            : resolveImageUrl(item.cover_image_url)
          : item.images?.find((img) => img.is_cover)?.image_url ||
            item.images?.[0]?.image_url ||
            null

        const fullCoverSrc =
          coverImg &&
          !coverImg.startsWith('http') &&
          !coverImg.startsWith('blob:') &&
          !coverImg.startsWith('data:')
            ? resolveImageUrl(coverImg)
            : coverImg

        return (
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-12 rounded-xl bg-[#FAF8F6] border border-[#E8E4DF] overflow-hidden shrink-0 group">
              {fullCoverSrc ? (
                <img
                  src={fullCoverSrc}
                  alt={item.nom_residence}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  onError={handleImageError}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#999999]">
                  <ImageIcon size={18} />
                </div>
              )}
              {item.images?.length > 1 && (
                <div className="absolute bottom-1 right-1 bg-black/60 text-[10px] font-mono text-white px-1.5 py-0.5 rounded leading-tight">
                  +{item.images.length - 1}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-xs text-[#111111] block truncate">
                {item.nom_residence}
              </span>
              <span className="text-[11.5px] text-[#777777] font-mono block truncate">
                /{item.slug}
              </span>
            </div>
          </div>
        )
      },
    },
    {
      header: 'Localisation',
      accessor: 'localisation',
      cell: (item) => (
        <span className="truncate text-xs text-[#333333] font-medium">{item.localisation}</span>
      ),
    },
    {
      header: 'Pièces & Capacité',
      cell: (item) => (
        <div className="text-xs text-[#333333] font-medium whitespace-nowrap tabular-nums">
          {`${item.nombre_pieces || 1} pièces • ${item.capacite_accueil || 2} pers.`}
        </div>
      ),
    },
    {
      header: 'Équipements inclus',
      accessor: 'equipement_ids',
      cell: (item) => {
        const count = item.equipements_count ?? item.equipements?.length ?? 0
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white text-[#111111] border border-[#E8E4DF]">
              <EquipementsIcon size={12} className="text-[#C0392B]" />
              <span className="tabular-nums">{count}</span> {`équipement${count > 1 ? 's' : ''}`}
            </span>
          </div>
        )
      },
    },
    {
      header: 'Statut',
      accessor: 'is_active',
      cell: (item) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            toggleStatusMutation.mutate({
              id: item.id,
              currentStatus: item.is_active,
            })
          }}
          title="Cliquer pour changer le statut"
          className="transition-transform hover:scale-105 active:scale-95"
        >
          <StatusBadge status={item.is_active ? 'ACTIVE' : 'INACTIVE'} />
        </button>
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
            className="p-1.5 rounded-lg hover:bg-[#FAF8F6] text-[#666666] hover:text-[#111111] border border-transparent hover:border-[#E8E4DF] transition-colors"
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
            className="p-1.5 rounded-lg hover:bg-[#FDF2F2] text-[#999999] hover:text-[#C0392B] border border-transparent hover:border-red-100 transition-colors"
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
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium tracking-wide mb-2 border border-blue-100">
            <ResidencesIcon size={13} />
            <span>Pôle Hébergement & Bases-Vie</span>
          </div>
          <h1 className="fl-admin-title-page text-[#111111]">
            Bases-Vie & Résidences Corporates
          </h1>
          <p className="fl-admin-body text-[#666666] mt-1">
            Supervision des complexes résidentiels, parcs modulaires miniers et résidences d&apos;affaires.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 h-11 px-5 rounded-xl text-xs font-semibold text-white bg-[#C0392B] hover:bg-[#A93226] shadow-xs hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-[#C0392B]/30"
        >
          <PlusIcon size={15} />
          <span>Nouvelle Résidence / Base-Vie</span>
        </button>
      </div>

      {/* Barre d'outils & Filtres */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Filtres de statut */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-[#E8E4DF] pb-0 scrollbar-none">
          {[
            { label: 'Tous', value: 'ALL' },
            { label: 'Actifs', value: 'ACTIVE' },
            { label: 'Inactifs', value: 'INACTIVE' },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setStatusFilter(tab.value)
                setCurrentPage(1)
              }}
              className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors relative border-b-2 ${
                statusFilter === tab.value
                  ? 'border-[#C0392B] text-[#C0392B] font-semibold -mb-[1px]'
                  : 'border-transparent text-[#666666] hover:text-[#111111]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Recherche */}
        <div className="relative w-full sm:w-80">
          <SearchIcon
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999999] pointer-events-none"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Rechercher par nom, site ou localisation..."
            className="w-full h-11 pl-10 pr-3 text-sm bg-white border border-[#E8E4DF] rounded-xl text-[#111111] placeholder-[#999999] focus:outline-none focus:border-[#C0392B] focus:ring-2 focus:ring-[#C0392B]/15 transition-all"
          />
        </div>
      </div>

      {/* Tableau de données */}
      <DataTable
        columns={columns}
        data={paginatedData}
        isLoading={isLoadingHebergements}
        onRowClick={(item) => handleOpenEdit(item)}
        emptyMessage="Aucune base-vie ou résidence trouvée."
      />

      {/* Pagination */}
      <TablePagination
        totalItems={totalItems}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setCurrentPage(1)
        }}
      />

      {/* Tiroir latéral de Création / Édition */}
      <SlideOverDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={
          editingHebergement
            ? `Modifier : ${editingHebergement.nom_residence}`
            : 'Nouvelle Base-Vie / Résidence'
        }
        subtitle="Renseignez l'emplacement, les galeries photos et le référentiel d'équipements sur site."
        maxWidth="sm:max-w-3xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <button
              type="button"
              onClick={handleCloseDrawer}
              className="px-4 py-2 text-xs font-semibold text-[#777777] hover:text-[#111111] hover:bg-[#FAF8F6] rounded-xl transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="hebergement-form"
              onClick={handleSubmit(onSubmit, onFormError)}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#C0392B] hover:bg-[#A93226] text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 transition-all focus:outline-none focus:ring-2 focus:ring-[#C0392B]/30 cursor-pointer"
            >
              <CheckIcon size={14} />
              <span>
                {isSaving
                  ? 'Enregistrement...'
                  : editingHebergement
                    ? 'Mettre à jour le site'
                    : 'Créer la résidence'}
              </span>
            </button>
          </div>
        }
      >
        <form
          id="hebergement-form"
          onSubmit={handleSubmit(onSubmit, onFormError)}
          className="space-y-6"
        >
          {/* SECTION 1 : INFORMATIONS GÉNÉRALES */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E8E4DF]">
              <ResidencesIcon size={16} className="text-[#C0392B]" />
              <h2 className="fl-admin-micro text-[#777777]">
                1. Identification & Emplacement
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Nom de la résidence / base-vie"
                placeholder="ex: Base-Vie Minière Tongon (Nord)"
                required
                error={errors.nom_residence?.message}
                {...register('nom_residence')}
              />

              <FormInput
                label="Localisation géographique"
                placeholder="ex: Site Minier d'Ity, Région du Cavally"
                required
                error={errors.localisation?.message}
                {...register('localisation')}
              />
            </div>

            {/* Steppers : Nombre de pièces & Capacité d'accueil */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#FAF8F6] border border-[#E8E4DF]">
              {/* Nombre de pièces */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#111111]">
                  Nombre de pièces <span className="text-[#C0392B]">*</span>
                </label>
                <Controller
                  name="nombre_pieces"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center rounded-xl border border-[#E8E4DF] bg-white overflow-hidden w-full max-w-[180px] h-11">
                      <button
                        type="button"
                        onClick={() => field.onChange(Math.max(1, (Number(field.value) || 1) - 1))}
                        disabled={Number(field.value) <= 1}
                        className="p-3 text-[#666666] hover:bg-[#FAF8F6] hover:text-[#111111] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        aria-label="Diminuer le nombre de pièces"
                      >
                        <MinusIcon size={14} />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const v =
                            e.target.value === ''
                              ? ''
                              : Math.min(20, Math.max(1, Number(e.target.value)))
                          field.onChange(v)
                        }}
                        className="w-full text-center text-xs font-semibold text-[#111111] bg-transparent focus:outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => field.onChange(Math.min(20, (Number(field.value) || 1) + 1))}
                        disabled={Number(field.value) >= 20}
                        className="p-3 text-[#666666] hover:bg-[#FAF8F6] hover:text-[#111111] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        aria-label="Augmenter le nombre de pièces"
                      >
                        <PlusIcon size={14} />
                      </button>
                    </div>
                  )}
                />
                {errors.nombre_pieces?.message && (
                  <p className="text-xs text-[#C0392B]">{errors.nombre_pieces.message}</p>
                )}
                <p className="text-[11.5px] text-[#777777]">1 à 20 pièces</p>
              </div>

              {/* Capacité d'accueil */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#111111]">
                  Capacité d'accueil <span className="text-[#C0392B]">*</span>
                </label>
                <Controller
                  name="capacite_accueil"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center rounded-xl border border-[#E8E4DF] bg-white overflow-hidden w-full max-w-[180px] h-11">
                      <button
                        type="button"
                        onClick={() => field.onChange(Math.max(1, (Number(field.value) || 1) - 1))}
                        disabled={Number(field.value) <= 1}
                        className="p-3 text-[#666666] hover:bg-[#FAF8F6] hover:text-[#111111] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        aria-label="Diminuer la capacité d'accueil"
                      >
                        <MinusIcon size={14} />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const v =
                            e.target.value === ''
                              ? ''
                              : Math.min(50, Math.max(1, Number(e.target.value)))
                          field.onChange(v)
                        }}
                        className="w-full text-center text-xs font-semibold text-[#111111] bg-transparent focus:outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => field.onChange(Math.min(50, (Number(field.value) || 1) + 1))}
                        disabled={Number(field.value) >= 50}
                        className="p-3 text-[#666666] hover:bg-[#FAF8F6] hover:text-[#111111] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        aria-label="Augmenter la capacité d'accueil"
                      >
                        <PlusIcon size={14} />
                      </button>
                    </div>
                  )}
                />
                {errors.capacite_accueil?.message && (
                  <p className="text-xs text-[#C0392B]">{errors.capacite_accueil.message}</p>
                )}
                <p className="text-[11.5px] text-[#777777]">1 à 50 personnes</p>
              </div>
            </div>

            {/* Interrupteur Statut Actif */}
            <div className="p-4 bg-white rounded-2xl border border-[#E8E4DF]">
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <FormSwitch
                    label="Publication active"
                    description="Si désactivé, ce site sera masqué du catalogue public d'hébergement."
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            {/* Descriptions bilingues */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-[#111111]">
                  Description du complexe
                </label>
                <BilingualTabs activeTab={activeLang} onChange={setActiveLang} />
              </div>

              {activeLang === 'fr' ? (
                <FormTextarea
                  placeholder="Détaillez les caractéristiques, le nombre de lits, la sécurité et les services de restauration..."
                  rows={4}
                  required
                  error={errors.description_fr?.message}
                  {...register('description_fr')}
                />
              ) : (
                <FormTextarea
                  placeholder="Describe camp capacities, room fittings, security procedures and catering services..."
                  rows={4}
                  error={errors.description_en?.message}
                  {...register('description_en')}
                />
              )}
            </div>
          </div>

          {/* SECTION 2 : GALERIE MULTIMÉDIA */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E8E4DF]">
              <ImageIcon size={16} className="text-[#C0392B]" />
              <h2 className="fl-admin-micro text-[#777777]">
                2. Galerie Multimédia & Clichés
              </h2>
            </div>

            <Controller
              name="images"
              control={control}
              render={({ field }) => (
                <GalleryUploader
                  value={field.value}
                  onChange={field.onChange}
                  onFilesChange={setSelectedFiles}
                  onDeleteImage={handleDeleteExistingImage}
                  onSetCover={handleSetCoverExistingImage}
                  error={errors.images?.message}
                />
              )}
            />
          </div>

          {/* SECTION 3 : ÉQUIPEMENTS DU SITE */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E4DF]">
              <div className="flex items-center gap-2">
                <EquipementsIcon size={16} className="text-[#C0392B]" />
                <h2 className="fl-admin-micro text-[#777777]">
                  3. Équipements & Commodités du Site
                </h2>
              </div>
              <span className="text-xs text-[#777777]">
                Liaison relationnelle Many-to-Many
              </span>
            </div>

            <p className="text-xs text-[#666666]">
              Cochez les commodités disponibles sur cette base-vie (chargées dynamiquement depuis le référentiel) :
            </p>

            <Controller
              name="equipement_ids"
              control={control}
              render={({ field }) => {
                const currentArray = Array.isArray(field.value) ? field.value : []
                const selectedStrSet = new Set(currentArray.map(String))

                const toggleEquipement = (id) => {
                  const idStr = String(id)
                  const nextStrSet = new Set(selectedStrSet)
                  if (nextStrSet.has(idStr)) {
                    nextStrSet.delete(idStr)
                  } else {
                    nextStrSet.add(idStr)
                  }
                  const nextValues = Array.from(nextStrSet).map((v) => {
                    const num = Number(v)
                    return !isNaN(num) && v.trim() !== '' ? num : v
                  })
                  field.onChange(nextValues)
                  setValue('equipement_ids', nextValues, { shouldValidate: true })
                }

                return (
                  <div className="space-y-2">
                    {errors.equipement_ids && (
                      <p className="text-xs text-[#C0392B] font-medium">
                        {errors.equipement_ids.message}
                      </p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto p-1 scrollbar-thin">
                      {equipements.map((eq) => {
                        const isChecked = selectedStrSet.has(String(eq.id))

                      return (
                        <button
                          key={eq.id}
                          type="button"
                          onClick={() => toggleEquipement(eq.id)}
                          className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                            isChecked
                              ? 'bg-[#FDF2F2] border-[#C0392B] text-[#111111]'
                              : 'bg-white border-[#E8E4DF] text-[#444444] hover:border-[#CCCCCC]'
                          }`}
                        >
                          {/* Case à cocher personnalisée */}
                          <div
                            className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                              isChecked
                                ? 'bg-[#C0392B] text-white'
                                : 'border border-[#D5D0C9] bg-white'
                            }`}
                          >
                            {isChecked && <CheckIcon size={11} strokeWidth={2.5} />}
                          </div>

                          {/* Icône Lucide dédiée */}
                          <div className="w-8 h-8 rounded-xl bg-[#FAF8F6] text-[#C0392B] flex items-center justify-center shrink-0 border border-[#E8E4DF]">
                            {renderLucideIcon(eq.icon_name, { size: 15 })}
                          </div>

                          {/* Nom de l'équipement */}
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-semibold block truncate text-[#111111]">
                              {eq.nom_fr}
                            </span>
                            <span className="text-[11.5px] text-[#777777] block truncate">
                              {eq.nom_en}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            }}
            />
          </div>
        </form>
      </SlideOverDrawer>

      {/* Boîte de dialogue de confirmation */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.action}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Supprimer définitivement"
        cancelText="Annuler"
        type="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
