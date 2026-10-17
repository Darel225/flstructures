import { z } from 'zod'

/**
 * Schéma de validation pour les Réglages Globaux de la plateforme.
 */
export const settingsSchema = z.object({
  telephone_principal: z
    .string()
    .trim()
    .min(5, 'Le numéro de téléphone principal est obligatoire.')
    .regex(
      /^[+\d\s./()-]+$/,
      'Format de téléphone invalide (chiffres, espaces, +, -, / autorisés).'
    ),
  email_reception_leads: z
    .string()
    .trim()
    .email('Adresse email de réception invalide.'),
  fichier_mercuriale_globale: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
  nom_fichier_mercuriale: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
})
