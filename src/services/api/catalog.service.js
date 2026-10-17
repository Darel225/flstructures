import { categoryService } from './category.service'
import { produitService } from './produit.service'

/**
 * Service API unifié pour le Catalogue Modulaire (Catégories et Produits).
 * Ré-expose les services spécialisés category.service.js et produit.service.js.
 */
export const catalogService = {
  // Catégories
  getCategories: () => categoryService.getCategories(),
  createCategory: (formData) => categoryService.createCategory(formData),
  updateCategory: (id, formData) => categoryService.updateCategory(id, formData),
  deleteCategory: (id) => categoryService.deleteCategory(id),

  // Produits
  getProduits: (params) => produitService.getProduits(params),
  createProduit: (formData) => produitService.createProduit(formData),
  updateProduit: (id, formData) => produitService.updateProduit(id, formData),
  deleteProduit: (id) => produitService.deleteProduit(id),
}

export { categoryService, produitService }
export default catalogService
