import { useState, useMemo } from 'react'
import { toast } from 'sonner'

import {
  CategoriesIcon,
  SearchIcon,
  EyeIcon,
  TrashIcon,
  BuildingIcon,
  MailIcon,
  PhoneIcon,
  CheckIcon,
  RefreshIcon,
} from '../../../components/admin/icons/AdminIcons'

// Composants UI Tableaux & Modales
import DataTable from '../../../components/admin/ui/DataTable'
import TablePagination from '../../../components/admin/ui/TablePagination'
import SlideOverDrawer from '../../../components/admin/ui/SlideOverDrawer'
import ConfirmDialog from '../../../components/admin/ui/ConfirmDialog'
import StatusBadge from '../../../components/admin/ui/StatusBadge'

// Primitives de formulaires
import FormInput from '../../../components/admin/forms/FormInput'
import FormTextarea from '../../../components/admin/forms/FormTextarea'
import FormSelect from '../../../components/admin/forms/FormSelect'
import FormSwitch from '../../../components/admin/forms/FormSwitch'
import BilingualTabs from '../../../components/admin/forms/BilingualTabs'

/**
 * Jeu de données de démonstration pour tester la DataTable et la pagination.
 */
const INITIAL_DEMO_DATA = [
  {
    id: 'DEV-2026-001',
    client: 'Société Minière d’Ity (SMI)',
    contact: 'Marc Diallo',
    type: 'Base-vie 120 lits + Cuisine',
    status: 'nouveau',
    date: '14 Oct 2026',
    budget: '45 000 000 FCFA',
  },
  {
    id: 'DEV-2026-002',
    client: 'Endeavour Mining',
    contact: 'Sophie Koné',
    type: 'Bureaux modulaires de chantier',
    status: 'en_cours',
    date: '12 Oct 2026',
    budget: '18 500 000 FCFA',
  },
  {
    id: 'DEV-2026-003',
    client: 'Perseus Mining Yaouré',
    contact: 'Kouassi Yao',
    type: 'Résidence VIP Cadres (Cocody)',
    status: 'valide',
    date: '10 Oct 2026',
    budget: '8 200 000 FCFA',
  },
  {
    id: 'DEV-2026-004',
    client: 'Roxgold Sango',
    contact: 'Christian Bamba',
    type: 'Magasin sécurisé pièces détachées',
    status: 'rejete',
    date: '09 Oct 2026',
    budget: '12 000 000 FCFA',
  },
  {
    id: 'DEV-2026-005',
    client: 'Tongon Gold Mine (Barrick)',
    contact: 'Fatou Traoré',
    type: 'Extension réfectoire minier 250 places',
    status: 'contacte',
    date: '06 Oct 2026',
    budget: '29 800 000 FCFA',
  },
]

export default function UiKitShowroom() {
  // États de simulation de données
  const [data, setData] = useState(INITIAL_DEMO_DATA)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [sortColumn, setSortColumn] = useState('date')
  const [sortDirection, setSortDirection] = useState('desc')

  // États pour les modales et tiroirs
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [dialogConfig, setDialogConfig] = useState({
    isOpen: false,
    variant: 'danger',
    title: '',
    message: '',
    action: () => {},
  })

  // États pour la section formulaires
  const [activeLang, setActiveLang] = useState('fr')
  const [formData, setFormData] = useState({
    titre_fr: 'Module Shelter Technique 20ft',
    titre_en: '20ft Industrial Technical Shelter',
    categorie: 'bureaux',
    description_fr:
      'Shelter autonome isolé thermiquement pour équipements de télécom ou groupes électrogènes de mine.',
    description_en:
      'Thermally insulated standalone shelter for telecoms equipment or mine generators.',
  })
  const [switchChecked, setSwitchChecked] = useState(true)

  // Tri des données simulées
  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  // Filtrage par recherche
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data
    const query = searchTerm.toLowerCase()
    return data.filter(
      (item) =>
        item.client.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query)
    )
  }, [data, searchTerm])

  // Définition des colonnes du tableau
  const columns = [
    {
      header: 'Réf.',
      accessor: 'id',
      sortable: true,
      className: 'font-mono font-semibold text-[#111111]',
    },
    {
      header: 'Client & Dossier',
      accessor: 'client',
      sortable: true,
      cell: (row) => (
        <div>
          <span className="font-semibold text-[#111111] block">
            {row.client}
          </span>
          <span className="text-xs text-[#777777] block">
            {row.type}
          </span>
        </div>
      ),
    },
    {
      header: 'Contact',
      accessor: 'contact',
      className: 'hidden md:table-cell text-[#777777]',
    },
    {
      header: 'Date',
      accessor: 'date',
      sortable: true,
      className: 'text-[#777777]',
    },
    {
      header: 'Budget Est.',
      accessor: 'budget',
      className: 'font-semibold text-[#111111] tabular-nums',
    },
    {
      header: 'Statut',
      accessor: 'status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            title="Consulter le détail"
            onClick={() => {
              setSelectedItem(row)
              setIsDrawerOpen(true)
            }}
            className="p-1.5 rounded-lg hover:bg-[#F8F6F4] text-[#777777] hover:text-[#111111] transition-colors"
          >
            <EyeIcon size={16} />
          </button>
          <button
            type="button"
            title="Supprimer la demande"
            onClick={() => {
              setDialogConfig({
                isOpen: true,
                variant: 'danger',
                title: `Supprimer la demande ${row.id}`,
                message: `Êtes-vous certain de vouloir supprimer définitivement le dossier de ${row.client} ?`,
                action: () => {
                  setData((prev) => prev.filter((d) => d.id !== row.id))
                  toast.success(`Dossier ${row.id} supprimé avec succès.`)
                },
              })
            }}
            className="p-1.5 rounded-lg hover:bg-red-50 text-[#777777] hover:text-[#C0392B] transition-colors"
          >
            <TrashIcon size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-10 pb-12">
      {/* 1. Titre et description de la boîte à outils */}
      <div className="border-b border-[#E8E4DF] pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#C0392B]/10 text-[#C0392B] text-xs font-bold uppercase tracking-wider mb-2 border border-[#C0392B]/20">
            <CategoriesIcon size={14} />
            <span>Design System Back-Office</span>
          </div>
          <h1 className="fl-admin-title-page text-[#111111]">
            Boîte à Outils UI & Composants Fondamentaux
          </h1>
          <p className="text-xs text-[#777777] mt-1">
            Showroom interactif démontrant les composants unifiés réutilisables (DataTable, Tiroirs, Modales, Formulaires).
          </p>
        </div>

        {/* Contrôles de simulation */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsLoading(!isLoading)}
            className="inline-flex items-center gap-1.5 px-3 h-10 rounded-xl text-xs font-semibold bg-white border border-[#E8E4DF] text-[#111111] hover:bg-[#F8F6F4] shadow-2xs transition-colors"
          >
            <RefreshIcon size={13} className={isLoading ? 'animate-spin' : ''} />
            <span>{isLoading ? 'Mode Normal' : 'Simuler Loading'}</span>
          </button>

          <button
            type="button"
            onClick={() => setData(data.length === 0 ? INITIAL_DEMO_DATA : [])}
            className="inline-flex items-center gap-1.5 px-3 h-10 rounded-xl text-xs font-semibold bg-white border border-[#E8E4DF] text-[#111111] hover:bg-[#F8F6F4] shadow-2xs transition-colors"
          >
            <span>{data.length === 0 ? 'Restaurer Données' : 'Simuler Liste Vide'}</span>
          </button>
        </div>
      </div>

      {/* 2. SECTION TABLEAU DE DONNÉES UNIFIÉ */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="fl-admin-title-section text-[#111111]">
              1. Moteur DataTable & Pagination
            </h2>
            <p className="text-xs text-[#777777]">
              Cliquez sur une ligne pour ouvrir le panneau latéral de détails.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <SearchIcon size={16} className="absolute left-3.5 top-3.5 text-[#777777]" />
            <input
              type="text"
              placeholder="Rechercher par client ou réf..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 h-11 text-xs bg-white border border-[#E8E4DF] rounded-xl text-[#111111] placeholder-[#777777] focus:outline-none focus:ring-2 focus:ring-[#C0392B]/20 focus:border-[#C0392B]"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredData}
          isLoading={isLoading}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          onRowClick={(item) => {
            setSelectedItem(item)
            setIsDrawerOpen(true)
          }}
          emptyTitle="Aucune demande de devis"
          emptyMessage="Aucun enregistrement ne correspond à vos filtres actuels."
          emptyActionLabel="Réinitialiser les filtres"
          onEmptyAction={() => {
            setSearchTerm('')
            setData(INITIAL_DEMO_DATA)
          }}
        />

        <TablePagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredData.length / pageSize) || 1}
          pageSize={pageSize}
          totalItems={filteredData.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </section>

      {/* 3. SECTION MODALES ET DIALOGUES DE CONFIRMATION */}
      <section className="space-y-4 pt-6 border-t border-[#E8E4DF]">
        <div>
          <h2 className="fl-admin-title-section text-[#111111]">
            2. Tiroir Coulissant & Modales de Confirmation
          </h2>
          <p className="text-xs text-[#777777]">
            Composants de validation d&apos;actions critiques et d&apos;édition contextuelle.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setSelectedItem(data[0] || null)
              setIsDrawerOpen(true)
            }}
            className="px-4 h-11 rounded-xl text-xs font-semibold bg-white border border-[#E8E4DF] text-[#111111] hover:bg-[#F8F6F4] transition-colors shadow-2xs"
          >
            Tester SlideOverDrawer (Détail)
          </button>

          <button
            type="button"
            onClick={() => {
              setDialogConfig({
                isOpen: true,
                variant: 'danger',
                title: 'Confirmer la suppression',
                message: 'Cette action effacera immédiatement la ressource sélectionnée. Confirmez-vous ?',
                action: () => toast.error('Action Danger confirmée.'),
              })
            }}
            className="px-4 h-11 rounded-xl text-xs font-semibold bg-[#C0392B] hover:bg-[#A93226] text-white transition-colors shadow-2xs"
          >
            Modale Danger (Rouge)
          </button>

          <button
            type="button"
            onClick={() => {
              setDialogConfig({
                isOpen: true,
                variant: 'warning',
                title: 'Refuser cette demande de devis ?',
                message: 'Le client sera notifié du refus par email automatique avec le motif renseigné.',
                action: () => toast.warning('Action Warning confirmée.'),
              })
            }}
            className="px-4 h-11 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors shadow-2xs"
          >
            Modale Warning (Ambre)
          </button>

          <button
            type="button"
            onClick={() => {
              setDialogConfig({
                isOpen: true,
                variant: 'info',
                title: 'Valider et transmettre au bureau d’études',
                message: 'Le dossier passera au statut En cours et sera assigné à l’équipe logistique.',
                action: () => toast.success('Action Info confirmée.'),
              })
            }}
            className="px-4 h-11 rounded-xl text-xs font-semibold bg-[#1E824C] hover:bg-[#196F3D] text-white transition-colors shadow-2xs"
          >
            Modale Info (Vert)
          </button>
        </div>
      </section>

      {/* 4. SECTION STATUS BADGES SHOWCASE */}
      <section className="space-y-4 pt-6 border-t border-[#E8E4DF]">
        <div>
          <h2 className="fl-admin-title-section text-[#111111]">
            3. Pastilles de Statuts Métier (StatusBadge)
          </h2>
          <p className="text-xs text-[#777777]">
            Indicateurs harmonisés pour Devis, Réservations, Partenaires et Produits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-white border border-[#E8E4DF]">
          <StatusBadge status="nouveau" />
          <StatusBadge status="en_attente" />
          <StatusBadge status="en_cours" />
          <StatusBadge status="contacte" />
          <StatusBadge status="valide" />
          <StatusBadge status="actif" />
          <StatusBadge status="rejete" />
          <StatusBadge status="annule" />
          <StatusBadge status="inactif" />
        </div>
      </section>

      {/* 5. SECTION PRIMITIVES DE FORMULAIRE & BILINGUISME */}
      <section className="space-y-6 pt-6 border-t border-[#E8E4DF]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="fl-admin-title-section text-[#111111]">
              4. Primitives de Formulaire & Champs Bilingues
            </h2>
            <p className="text-xs text-[#777777]">
              Champs stylisés avec gestion d&apos;erreurs, indications et bascule de langue instantanée.
            </p>
          </div>

          <BilingualTabs activeTab={activeLang} onChange={setActiveLang} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-[#E8E4DF] shadow-2xs">
          {/* Titre bilingue */}
          {activeLang === 'fr' ? (
            <FormInput
              label="Désignation du produit (Français)"
              value={formData.titre_fr}
              onChange={(e) =>
                setFormData({ ...formData, titre_fr: e.target.value })
              }
              required
              leftIcon={BuildingIcon}
              hint="Visible sur le catalogue public en version francophone."
            />
          ) : (
            <FormInput
              label="Product Title (English)"
              value={formData.titre_en}
              onChange={(e) =>
                setFormData({ ...formData, titre_en: e.target.value })
              }
              required
              leftIcon={BuildingIcon}
              hint="Shown on the international English website catalog."
            />
          )}

          {/* Sélecteur de catégorie */}
          <FormSelect
            label="Catégorie Principale"
            value={formData.categorie}
            onChange={(e) =>
              setFormData({ ...formData, categorie: e.target.value })
            }
            options={[
              { value: 'bureaux', label: 'Bureaux de Chantier & Sièges Minier' },
              { value: 'dortoirs', label: 'Dortoirs & Hébergement Ouvriers' },
              { value: 'sanitaires', label: 'Modules Sanitaires & Vestiaires' },
              { value: 'refectoires', label: 'Cuisines & Réfectoires Collectifs' },
            ]}
            required
            hint="Définit le groupe de classification modulaire."
          />

          {/* Description bilingue */}
          <div className="md:col-span-2">
            {activeLang === 'fr' ? (
              <FormTextarea
                label="Fiche Technique & Description (Français)"
                value={formData.description_fr}
                onChange={(e) =>
                  setFormData({ ...formData, description_fr: e.target.value })
                }
                rows={3}
                hint="Détails techniques : ossature acier, isolation laine de roche, menuiseries PVC."
              />
            ) : (
              <FormTextarea
                label="Specifications & Description (English)"
                value={formData.description_en}
                onChange={(e) =>
                  setFormData({ ...formData, description_en: e.target.value })
                }
                rows={3}
                hint="Technical specs: steel frame, rockwool insulation, PVC joinery."
              />
            )}
          </div>

          {/* Switch Actif / Inactif */}
          <div className="md:col-span-2 pt-2">
            <FormSwitch
              checked={switchChecked}
              onChange={setSwitchChecked}
              label="Publier ce module sur le site vitrine"
              description="Si désactivé, le module reste enregistré en brouillon mais n'apparaît pas dans le catalogue public."
            />
          </div>
        </div>
      </section>

      {/* 6. SLIDEOVER DRAWER (INSTANCIÉ) */}
      <SlideOverDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedItem ? `Dossier ${selectedItem.id}` : 'Fiche de Détail'}
        subtitle={
          selectedItem
            ? `Client : ${selectedItem.client}`
            : 'Consulter et éditer les informations du dossier'
        }
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="px-4 h-11 rounded-xl text-xs font-semibold text-[#777777] hover:text-[#111111] hover:bg-[#F8F6F4] transition-colors"
            >
              Fermer
            </button>
            <button
              type="button"
              onClick={() => {
                toast.success('Modifications enregistrées avec succès.')
                setIsDrawerOpen(false)
              }}
              className="inline-flex items-center gap-1.5 px-4 h-11 rounded-xl text-xs font-semibold text-white bg-[#C0392B] hover:bg-[#A93226] shadow-xs transition-all cursor-pointer"
            >
              <CheckIcon size={14} />
              <span>Enregistrer</span>
            </button>
          </>
        }
      >
        {selectedItem && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-[#F8F6F4] border border-[#E8E4DF] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#777777] block font-medium">Statut actuel</span>
                <StatusBadge status={selectedItem.status} className="mt-1" />
              </div>
              <div className="text-right">
                <span className="text-xs text-[#777777] block font-medium">Budget estimé</span>
                <span className="fl-admin-title-card text-[#111111] tabular-nums">
                  {selectedItem.budget}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="fl-admin-micro text-[#777777]">
                Coordonnées du Contact
              </h3>
              <div className="space-y-3">
                <FormInput
                  label="Entreprise Minier"
                  value={selectedItem.client}
                  readOnly
                  leftIcon={BuildingIcon}
                />
                <FormInput
                  label="Responsable Dossier"
                  value={selectedItem.contact}
                  readOnly
                  leftIcon={MailIcon}
                />
                <FormInput
                  label="Téléphone Professionnel"
                  value="+225 07 00 00 00 00"
                  readOnly
                  leftIcon={PhoneIcon}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="fl-admin-micro text-[#777777]">
                Spécifications Demandées
              </h3>
              <FormTextarea
                label="Descriptif du Besoin"
                value={selectedItem.type}
                readOnly
                rows={3}
              />
            </div>
          </div>
        )}
      </SlideOverDrawer>

      {/* 7. CONFIRM DIALOG (INSTANCIÉ) */}
      <ConfirmDialog
        isOpen={dialogConfig.isOpen}
        onClose={() => setDialogConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
          dialogConfig.action()
          setDialogConfig((prev) => ({ ...prev, isOpen: false }))
        }}
        title={dialogConfig.title}
        message={dialogConfig.message}
        variant={dialogConfig.variant}
        confirmText="Confirmer l'opération"
      />
    </div>
  )
}
