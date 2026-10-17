import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as Icons from 'lucide-react'
import {
  EquipementsIcon,
  PlusIcon,
  SearchIcon,
  EditIcon,
  TrashIcon,
  CheckIcon,
} from '../../../components/admin/icons/AdminIcons'
import { toast } from 'sonner'

import equipementService from '../../../services/api/equipement.service'
import DataTable from '../../../components/admin/ui/DataTable'
import SlideOverDrawer from '../../../components/admin/ui/SlideOverDrawer'
import ConfirmDialog from '../../../components/admin/ui/ConfirmDialog'
import FormInput from '../../../components/admin/forms/FormInput'
import BilingualTabs from '../../../components/admin/forms/BilingualTabs'
import IconPicker from '../../../components/admin/forms/IconPicker'

/**
 * Composant de rendu sécurisé pour icônes Lucide avec icône de secours.
 */
const DynamicIcon = ({ name, className = '', size = 18, ...props }) => {
  const IconComp = Icons[name] || Icons.CheckCircle2 || Icons.Sparkles
  return <IconComp className={className} size={size} {...props} />
}

export default function EquipementsListPage() {
  const queryClient = useQueryClient()

  // État de recherche et filtrage
  const [searchTerm, setSearchTerm] = useState('')

  // État du Drawer et du formulaire unifié
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingEquipement, setEditingEquipement] = useState(null)
  const [langTab, setLangTab] = useState('fr')
  const [form, setForm] = useState({
    nom_fr: '',
    nom_en: '',
    icon_name: 'Wifi',
  })
  const [formErrors, setFormErrors] = useState({})

  // Modale de confirmation de suppression
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: () => {},
  })

  // Récupération de la liste des équipements
  const { data: rawEquipements = [], isLoading } = useQuery({
    queryKey: ['equipements'],
    queryFn: () => equipementService.getEquipements(),
  })

  const equipements = useMemo(() => {
    if (Array.isArray(rawEquipements)) return rawEquipements
    if (Array.isArray(rawEquipements?.data)) return rawEquipements.data
    return []
  }, [rawEquipements])

  // Invalidation globale des caches associés
  const invalidateAllQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['equipements'] })
    queryClient.invalidateQueries({ queryKey: ['admin-equipements'] })
    queryClient.invalidateQueries({ queryKey: ['hebergements'] })
  }

  // Mutation de Création
  const createMutation = useMutation({
    mutationFn: (data) => equipementService.createEquipement(data),
    onSuccess: (res) => {
      invalidateAllQueries()
      const name = res?.nom_fr || form.nom_fr
      toast.success(`Équipement "${name}" créé avec succès.`)
      setIsDrawerOpen(false)
      setEditingEquipement(null)
      setForm({ nom_fr: '', nom_en: '', icon_name: 'Wifi' })
      setFormErrors({})
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Erreur lors de la création de l’équipement.'
      toast.error(msg)
    },
  })

  // Mutation de Mise à jour
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => equipementService.updateEquipement(id, data),
    onSuccess: (res) => {
      invalidateAllQueries()
      const name = res?.nom_fr || form.nom_fr
      toast.success(`Équipement "${name}" mis à jour avec succès.`)
      setIsDrawerOpen(false)
      setEditingEquipement(null)
      setForm({ nom_fr: '', nom_en: '', icon_name: 'Wifi' })
      setFormErrors({})
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Erreur lors de la mise à jour.'
      toast.error(msg)
    },
  })

  // Mutation de Suppression
  const deleteMutation = useMutation({
    mutationFn: (id) => equipementService.deleteEquipement(id),
    onSuccess: () => {
      invalidateAllQueries()
      toast.success('Équipement supprimé avec succès.')
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Erreur lors de la suppression.'
      toast.error(msg)
    },
  })

  // Ouverture en mode Création
  const handleCreateNew = () => {
    setEditingEquipement(null)
    setForm({
      nom_fr: '',
      nom_en: '',
      icon_name: 'Wifi',
    })
    setFormErrors({})
    setLangTab('fr')
    setIsDrawerOpen(true)
  }

  // Ouverture en mode Édition
  const handleEdit = (item) => {
    setEditingEquipement(item)
    setForm({
      nom_fr: item.nom_fr || '',
      nom_en: item.nom_en || '',
      icon_name: item.icon_name || 'Wifi',
    })
    setFormErrors({})
    setLangTab('fr')
    setIsDrawerOpen(true)
  }

  // Soumission du formulaire
  const handleSubmitForm = (e) => {
    if (e) e.preventDefault()

    const errors = {}
    if (!form.nom_fr || !form.nom_fr.trim()) {
      errors.nom_fr = "Le nom français de l'équipement est requis."
      setLangTab('fr')
    }
    if (!form.icon_name || !form.icon_name.trim()) {
      errors.icon_name = 'Veuillez sélectionner une icône.'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      toast.error("Veuillez renseigner le nom de l'équipement.")
      return
    }

    const payload = {
      nom_fr: form.nom_fr.trim(),
      nom_en: (form.nom_en || '').trim(),
      icon_name: form.icon_name.trim(),
    }

    if (editingEquipement) {
      updateMutation.mutate({ id: editingEquipement.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  // Filtrage textuel instantané (sur nom_fr, nom_en et icon_name)
  const filteredList = useMemo(() => {
    if (!Array.isArray(equipements)) return []
    if (!searchTerm.trim()) return equipements
    const q = searchTerm.toLowerCase().trim()
    return equipements.filter((eq) => {
      const fr = (eq.nom_fr || '').toLowerCase()
      const en = (eq.nom_en || '').toLowerCase()
      const icon = (eq.icon_name || '').toLowerCase()
      return fr.includes(q) || en.includes(q) || icon.includes(q)
    })
  }, [equipements, searchTerm])

  // Colonnes du tableau de gestion
  const columns = [
    {
      header: 'Icône',
      accessor: 'icon_name',
      className: 'w-16',
      cell: (item) => (
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#FAF8F6] text-[#C0392B] border border-[#E8E4DF]">
          <DynamicIcon name={item.icon_name} size={18} className="text-[#C0392B]" />
        </div>
      ),
    },
    {
      header: 'Désignation de l’Équipement',
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
      header: 'Identifiant Technique',
      accessor: 'icon_name',
      cell: (item) => (
        <span className="font-mono text-xs text-[#777777] bg-[#FAF8F6] px-2.5 py-1 rounded-lg border border-[#E8E4DF]">
          {item.icon_name}
        </span>
      ),
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
                title: `Supprimer l'équipement "${item.nom_fr}" ?`,
                message:
                  'Cet équipement ne sera plus disponible dans les fiches résidences et bases-vie.',
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
      {/* 1. En-tête avec compteur dynamique */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E8E4DF]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-[#C0392B] text-xs font-medium tracking-wide mb-2 border border-red-100">
            <EquipementsIcon size={13} />
            <span>Référentiel Hébergements</span>
          </div>
          <h1 className="fl-admin-title-page text-[#111111]">
            Équipements & Commodités
          </h1>
          <p className="fl-admin-body text-[#666666] mt-1">
            Gérez les équipements hôteliers, sanitaires et énergétiques associés aux résidences et bases-vie.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Compteur dynamique */}
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#E8E4DF] text-xs font-medium text-[#111111] shadow-xs">
            <EquipementsIcon size={13} className="text-[#C0392B]" />
            <span className="tabular-nums font-semibold">{filteredList.length}</span> équipements actifs
          </span>

          <button
            type="button"
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-xl text-xs font-semibold text-white bg-[#C0392B] hover:bg-[#A93226] shadow-xs hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-[#C0392B]/30 cursor-pointer"
          >
            <PlusIcon size={15} />
            <span>Ajouter un Équipement</span>
          </button>
        </div>
      </div>

      {/* 2. Recherche textuelle instantanée */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999999] pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher par nom ou icône..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 pl-10 pr-3 text-sm bg-white border border-[#E8E4DF] rounded-xl text-[#111111] placeholder-[#999999] focus:outline-none focus:border-[#C0392B] focus:ring-2 focus:ring-[#C0392B]/15 transition-all shadow-xs"
          />
        </div>
      </div>

      {/* 3. Tableau de données */}
      <DataTable
        columns={columns}
        data={filteredList}
        isLoading={isLoading}
        onRowClick={handleEdit}
        emptyTitle="Aucun équipement trouvé"
        emptyMessage={
          searchTerm
            ? `Aucun équipement ne correspond à "${searchTerm}".`
            : 'Ajoutez les équipements disponibles dans vos hébergements.'
        }
        emptyActionLabel="Ajouter un équipement"
        onEmptyAction={handleCreateNew}
      />

      {/* 4. SlideOverDrawer : Création / Édition */}
      <SlideOverDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false)
          setEditingEquipement(null)
        }}
        title={
          editingEquipement
            ? `Modifier : ${editingEquipement.nom_fr || ''}`
            : 'Ajouter un Équipement'
        }
        subtitle="Sélectionnez l'icône Lucide et saisissez les intitulés bilingues."
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              onClick={() => {
                setIsDrawerOpen(false)
                setEditingEquipement(null)
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
                  : editingEquipement
                  ? 'Mettre à jour'
                  : 'Enregistrer'}
              </span>
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmitForm} className="space-y-6">
          {/* Commutateur d'onglets de langue */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DF]">
            <span className="fl-admin-micro text-[#777777]">
              Langue de saisie
            </span>
            <BilingualTabs activeTab={langTab} onChange={setLangTab} />
          </div>

          {/* Saisie bilingue conditionnée par langTab (sans jamais réinitialiser l'état) */}
          {langTab === 'fr' ? (
            <FormInput
              label="Nom de l'Équipement (Français) *"
              placeholder="ex: Climatisation Tropicalisée Inverter"
              required
              value={form.nom_fr}
              onChange={(e) => {
                const val = e.target.value
                setForm((prev) => ({ ...prev, nom_fr: val }))
                if (formErrors.nom_fr) {
                  setFormErrors((prev) => ({ ...prev, nom_fr: null }))
                }
              }}
              error={formErrors.nom_fr}
            />
          ) : (
            <FormInput
              label="Nom de l'Équipement (Anglais)"
              placeholder="ex: Tropicalized Inverter AC"
              value={form.nom_en}
              onChange={(e) => {
                const val = e.target.value
                setForm((prev) => ({ ...prev, nom_en: val }))
                if (formErrors.nom_en) {
                  setFormErrors((prev) => ({ ...prev, nom_en: null }))
                }
              }}
              error={formErrors.nom_en}
            />
          )}

          {/* Sélecteur d'icônes Lucide interactif */}
          <IconPicker
            value={form.icon_name}
            onChange={(newIconName) => {
              setForm((prev) => ({ ...prev, icon_name: newIconName }))
              if (formErrors.icon_name) {
                setFormErrors((prev) => ({ ...prev, icon_name: null }))
              }
            }}
            label="Icône représentative"
            error={formErrors.icon_name}
            hint="Sélectionnez l'icône affichée dans la barre d'équipements de l'hébergement."
          />
        </form>
      </SlideOverDrawer>

      {/* 5. Modale de confirmation de suppression */}
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
