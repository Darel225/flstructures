import { z } from 'zod'

/**
 * Schéma de validation pour une Catégorie de structures modulaires.
 */
export const categorySchema = z.object({
  nom_fr: z
    .string()
    .trim()
    .min(2, 'Le nom français doit contenir au moins 2 caractères.'),
  nom_en: z
    .string()
    .trim()
    .min(2, 'Le nom anglais doit contenir au moins 2 caractères.'),
  ordre_affichage: z.coerce
    .number()
    .int('L’ordre d’affichage doit être un entier.')
    .min(1, 'L’ordre doit être supérieur ou égal à 1.')
    .default(1),
  image_url: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
  actif: z.boolean().default(true),
})

/**
 * Schéma de validation pour un Produit modulaire.
 */
export const produitSchema = z.object({
  categorie_id: z
    .string()
    .trim()
    .min(1, 'Veuillez sélectionner une catégorie de rattachement.'),
  nom_fr: z
    .string()
    .trim()
    .min(2, 'Le nom français du produit est requis.'),
  nom_en: z
    .string()
    .trim()
    .min(2, 'Le nom anglais du produit est requis.'),
  description_courte_fr: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
  description_courte_en: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
  image_url: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
  actif: z.boolean().default(true),
})

/**
 * Schéma de validation pour un Équipement / Commodité d'hébergement.
 */
export const equipementSchema = z.object({
  nom_fr: z
    .string()
    .trim()
    .min(2, 'Le nom français de l’équipement est requis.'),
  nom_en: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
  icon_name: z
    .string()
    .trim()
    .min(1, 'Veuillez sélectionner une icône représentative.'),
})
