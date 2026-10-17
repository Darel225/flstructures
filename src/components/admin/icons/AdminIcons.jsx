import {
  LayoutDashboard,
  FileText,
  BedDouble,
  Handshake,
  Mail,
  Boxes,
  FolderTree,
  Building2,
  Sliders,
  HardHat,
  Settings,
  UploadCloud,
  Image as LucideImage,
  Calendar,
  Pencil,
  Trash2,
  Star,
  Search,
  Filter,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Download,
  Plus,
  Eye,
  LogOut,
  ExternalLink,
  Menu,
  AlertCircle,
  AlertTriangle,
  Info,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Phone,
  Building,
  Lock,
  User,
  Clock,
  Loader2,
  RefreshCw,
  Minus,
  Wrench,
  CheckCircle2,
  MapPin,
  Sparkles as LucideSparkles,
} from 'lucide-react'

/**
 * Créateur de composant d'icône unifié pour le Design System de l'Espace Admin.
 * Garantit un poids de trait uniforme (1.5px), des jointures et terminaisons arrondies,
 * une taille cohérente et l'accessibilité aria-hidden par défaut.
 */
function createAdminIcon(LucideComponent, defaultSize = 20) {
  return function AdminIcon({
    size = defaultSize,
    strokeWidth = 1.5,
    className = '',
    'aria-hidden': ariaHidden = true,
    ...props
  }) {
    return (
      <LucideComponent
        size={size}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={ariaHidden}
        className={`shrink-0 ${className}`}
        {...props}
      />
    )
  }
}

// Navigation & Sections
export const DashboardIcon = createAdminIcon(LayoutDashboard)
export const DevisIcon = createAdminIcon(FileText)
export const ReservationsIcon = createAdminIcon(BedDouble)
export const PartenairesIcon = createAdminIcon(Handshake)
export const ContactsIcon = createAdminIcon(Mail)
export const ProduitsIcon = createAdminIcon(Boxes)
export const CategoriesIcon = createAdminIcon(FolderTree)
export const ResidencesIcon = createAdminIcon(Building2)
export const EquipementsIcon = createAdminIcon(Sliders) // Remplacement calme et professionnel de Sparkles
export const ProjetsIcon = createAdminIcon(HardHat)
export const SettingsIcon = createAdminIcon(Settings)

// Actions & Formulaires
export const UploadIcon = createAdminIcon(UploadCloud)
export const ImageIcon = createAdminIcon(LucideImage)
export const PdfIcon = createAdminIcon(FileText)
export const CalendarIcon = createAdminIcon(Calendar)
export const EditIcon = createAdminIcon(Pencil)
export const TrashIcon = createAdminIcon(Trash2)
export const StarIcon = createAdminIcon(Star)
export const SearchIcon = createAdminIcon(Search)
export const FilterIcon = createAdminIcon(Filter)
export const CheckIcon = createAdminIcon(Check)
export const CloseIcon = createAdminIcon(X)
export const PlusIcon = createAdminIcon(Plus)
export const MinusIcon = createAdminIcon(Minus)
export const EyeIcon = createAdminIcon(Eye)
export const DownloadIcon = createAdminIcon(Download)
export const RefreshIcon = createAdminIcon(RefreshCw)
export const WrenchIcon = createAdminIcon(Wrench)
export const CheckCircleIcon = createAdminIcon(CheckCircle2)

// Flèches & Chevrons
export const ChevronLeftIcon = createAdminIcon(ChevronLeft)
export const ChevronRightIcon = createAdminIcon(ChevronRight)
export const ChevronDownIcon = createAdminIcon(ChevronDown)
export const ChevronUpIcon = createAdminIcon(ChevronUp)
export const ArrowUpDownIcon = createAdminIcon(ArrowUpDown)
export const ArrowUpIcon = createAdminIcon(ArrowUp)
export const ArrowDownIcon = createAdminIcon(ArrowDown)

// Système & Layout
export const MenuIcon = createAdminIcon(Menu)
export const ExternalLinkIcon = createAdminIcon(ExternalLink)
export const LogoutIcon = createAdminIcon(LogOut)
export const LockIcon = createAdminIcon(Lock)
export const UserIcon = createAdminIcon(User)
export const PhoneIcon = createAdminIcon(Phone)
export const BuildingIcon = createAdminIcon(Building)
export const MapPinIcon = createAdminIcon(MapPin)
export const MailIcon = createAdminIcon(Mail)
export const ClockIcon = createAdminIcon(Clock)
export const LoaderIcon = createAdminIcon(Loader2)

// Alertes & Statuts
export const AlertCircleIcon = createAdminIcon(AlertCircle)
export const AlertTriangleIcon = createAdminIcon(AlertTriangle)
export const InfoIcon = createAdminIcon(Info)

// Rétrocompatibilité isolée
export const SparklesIcon = createAdminIcon(LucideSparkles)
