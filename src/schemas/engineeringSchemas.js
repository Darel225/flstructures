import { z } from 'zod'

/**
 * Schéma de validation pour une Base-Vie ou Résidence Corporate.
 */
export const hebergementSchema = z.object({
  nom_residence: z
    .string()
    .trim()
    .min(3, 'Le nom de la résidence doit comporter au moins 3 caractères.'),
  slug: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
  localisation: z
    .string()
    .trim()
    .min(2, 'La localisation géographique est requise (ex: Site Minier d’Ity).'),
  nombre_pieces: z.coerce
    .number()
    .int('Le nombre de pièces doit être un entier.')
    .min(1, 'Minimum 1 pièce.')
    .max(20, 'Maximum 20 pièces.')
    .optional()
    .or(z.literal(''))
    .or(z.null()),
  capacite_accueil: z.coerce
    .number()
    .int('La capacité d’accueil doit être un entier.')
    .min(1, 'Minimum 1 personne.')
    .max(50, 'Maximum 50 personnes.')
    .optional()
    .or(z.literal(''))
    .or(z.null()),
  description_fr: z
    .string()
    .trim()
    .min(10, 'La description en français doit comporter au moins 10 caractères.'),
  description_en: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
  is_active: z
    .union([z.boolean(), z.number()])
    .transform((val) => Boolean(val))
    .default(true),
  images: z
    .array(
      z
        .object({
          image_url: z.string().trim().min(1, 'L’URL de l’image est requise.'),
          is_cover: z.boolean().default(false),
          file: z.any().optional(),
        })
        .passthrough()
    )
    .default([]),
  equipement_ids: z
    .array(z.union([z.number(), z.string(), z.coerce.number()]))
    .optional()
    .default([]),
})

/**
 * Schéma de validation pour une Réalisation d'ingénierie / Étude de cas.
 */
export const realisationSchema = z.object({
  titre_fr: z
    .string()
    .trim()
    .min(3, 'Le titre du projet en français est requis.'),
  titre_en: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
  date_realisation: z
    .string()
    .trim()
    .min(2, 'La date de livraison ou période de réalisation est requise.'),
  image_principale_url: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
  besoin_client_fr: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
  besoin_client_en: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
  contraintes_fr: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
  contraintes_en: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
  solution_fr: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
  solution_en: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
})
