import { createElement } from 'react'
import * as Icons from 'lucide-react'
import {
  Wifi,
  Tv,
  Wind,
  AirVent,
  Snowflake,
  Zap,
  BatteryCharging,
  Sun,
  Flame,
  Coffee,
  Utensils,
  CookingPot,
  Refrigerator,
  ShowerHead,
  Bath,
  Droplets,
  Bed,
  BedDouble,
  ShieldCheck,
  Lock,
  Key,
  Car,
  Truck,
  Briefcase,
  Waves,
  BriefcaseMedical,
  Radio,
  Satellite,
  Fan,
  Sparkles,
  Maximize2,
  Building,
  Warehouse,
  CheckCircle2,
} from 'lucide-react'

/**
 * Catalogue exhaustif d'icônes pour résidences, bases-vie minières et chantiers.
 * Indexé avec des tags multilingues pour la recherche instantanée (clim, wifi, zap, lit, douche, restaurant...).
 */
export const AVAILABLE_ICONS = [
  { name: 'Wifi', icon: Wifi, label: 'Wi-Fi / Fibre', tags: ['wifi', 'internet', 'connexion', 'fibre', 'starlink', 'reseau'] },
  { name: 'Tv', icon: Tv, label: 'Télévision', tags: ['tv', 'television', 'ecran', 'satellite', 'canal', 'divertissement'] },
  { name: 'Wind', icon: Wind, label: 'Climatisation Split', tags: ['clim', 'climatisation', 'froid', 'air', 'split', 'ventilation', 'ac'] },
  { name: 'AirVent', icon: AirVent, label: 'Système HVAC / Air', tags: ['clim', 'climatisation', 'ventilation', 'aeration', 'hvac', 'air'] },
  { name: 'Snowflake', icon: Snowflake, label: 'Froid Tropicalisé', tags: ['clim', 'climatisation', 'froid', 'grand froid', 'glace', 'congelateur'] },
  { name: 'Zap', icon: Zap, label: 'Groupe Électrogène 24/7', tags: ['zap', 'energie', 'electricite', 'groupe', 'generateur', 'courant', 'puissance'] },
  { name: 'Sun', icon: Sun, label: 'Solaire Hybride', tags: ['zap', 'solaire', 'panneau', 'photovoltaique', 'energie verte', 'energie'] },
  { name: 'BatteryCharging', icon: BatteryCharging, label: 'Secours Onduleur', tags: ['zap', 'batterie', 'onduleur', 'secours', 'energie', 'ups'] },
  { name: 'Bed', icon: Bed, label: 'Literie Hôtelière', tags: ['lit', 'literie', 'sommeil', 'couchage', 'chambre', 'hotel'] },
  { name: 'BedDouble', icon: BedDouble, label: 'Lit Double VIP', tags: ['lit', 'lit double', 'suite', 'king size', 'confort', 'chambre'] },
  { name: 'ShowerHead', icon: ShowerHead, label: 'Douches & Sanitaires', tags: ['douche', 'sanitaire', 'eau', 'bain', 'salle de bain', 'hygiene'] },
  { name: 'Bath', icon: Bath, label: 'Salle de Bain Privative', tags: ['douche', 'bain', 'baignoire', 'sanitaire', 'eau'] },
  { name: 'Droplets', icon: Droplets, label: 'Eau Potable / Forage', tags: ['douche', 'eau', 'potable', 'filtration', 'forage', 'traitement'] },
  { name: 'Utensils', icon: Utensils, label: 'Cuisine & Restauration', tags: ['restaurant', 'cantine', 'repas', 'cuisine', 'nourriture', 'traiteur'] },
  { name: 'Coffee', icon: Coffee, label: 'Cafétéria / Détente', tags: ['restaurant', 'cafe', 'cafeteria', 'pause', 'petit dejeuner', 'boisson'] },
  { name: 'Refrigerator', icon: Refrigerator, label: 'Réfrigérateur Privatif', tags: ['restaurant', 'frigo', 'refrigerateur', 'froid', 'cuisine'] },
  { name: 'CookingPot', icon: CookingPot, label: 'Cuisine Équipée', tags: ['restaurant', 'cuisine', 'fourneau', 'cuisson', 'repas'] },
  { name: 'ShieldCheck', icon: ShieldCheck, label: 'Sécurité & Gardiennage', tags: ['securite', 'gardiennage', 'surveillance', 'protection', 'garde', 'cctv'] },
  { name: 'Lock', icon: Lock, label: 'Coffre-fort / Sécurisé', tags: ['securite', 'coffre', 'cle', 'verrou', 'securise'] },
  { name: 'Key', icon: Key, label: 'Contrôle d’Accès Badge', tags: ['securite', 'badge', 'cle', 'serrure', 'acces', 'carte'] },
  { name: 'Radio', icon: Radio, label: 'Liaison Radio VHF', tags: ['communication', 'radio', 'vhf', 'chantier', 'talkie', 'wifi'] },
  { name: 'Satellite', icon: Satellite, label: 'Liaison Starlink Haut Débit', tags: ['satellite', 'starlink', 'telecom', 'antenne', 'internet', 'wifi'] },
  { name: 'Briefcase', icon: Briefcase, label: 'Espace Bureau & Réunion', tags: ['travail', 'bureau', 'espace de travail', 'desk', 'corporate', 'reunion'] },
  { name: 'Waves', icon: Waves, label: 'Service Blanchisserie', tags: ['laverie', 'blanchisserie', 'linge', 'machine', 'lavage'] },
  { name: 'BriefcaseMedical', icon: BriefcaseMedical, label: 'Infirmerie & Premiers Secours', tags: ['sante', 'soins', 'medical', 'infirmerie', 'urgence', 'premiers secours'] },
  { name: 'Car', icon: Car, label: 'Parking Réservé 4x4', tags: ['parking', 'voiture', '4x4', 'transport', 'stationnement'] },
  { name: 'Truck', icon: Truck, label: 'Accès Convoi & Fret', tags: ['camion', 'fret', 'logistique', 'poids lourds', 'transport'] },
  { name: 'Fan', icon: Fan, label: 'Ventilation Forcée', tags: ['clim', 'ventilateur', 'ventilation', 'aeration', 'extraction'] },
  { name: 'Flame', icon: Flame, label: 'Eau Chaude Instantanée', tags: ['eau chaude', 'chauffe-eau', 'chaud', 'energie', 'gaz'] },
  { name: 'Sparkles', icon: Sparkles, label: 'Ménage & Housekeeping', tags: ['menage', 'nettoyage', 'proprete', 'service', 'quotidien'] },
  { name: 'Building', icon: Building, label: 'Complexe Administratif', tags: ['batiment', 'bureaux', 'siege', 'immeuble'] },
  { name: 'Warehouse', icon: Warehouse, label: 'Magasin & Stockage', tags: ['entrepot', 'hangar', 'stockage', 'depot'] },
  { name: 'Maximize2', icon: Maximize2, label: 'Chambre Grand Volume', tags: ['espace', 'surface', 'volume', 'dimension'] },
  { name: 'CheckCircle2', icon: CheckCircle2, label: 'Standard & Contrôle Qualité', tags: ['standard', 'conforme', 'validation', 'qualite'] },
]

/**
 * Fonction utilitaire de rendu dynamique d'une icône par son nom avec fallback sécurisé.
 * @param {string} iconName 
 * @param {Object} props 
 */
export function renderLucideIcon(iconName, props = {}) {
  const IconComponent = Icons[iconName] || Icons.CheckCircle2 || Icons.Sparkles
  return createElement(IconComponent, props)
}

export default AVAILABLE_ICONS
