import imgSecsFallback from '../../../assets/images/expertise-gamme1.jpg'
import imgFruitsFallback from '../../../assets/images/expertise-gamme.jpg'
import imgViandesFallback from '../../../assets/images/expertise-gamme.png'
import imgBoissonsFallback from '../../../assets/images/expertise-logistique.png'
import imgEntretienFallback from '../../../assets/images/expertise-logistique.jpg'
import imgSurMesureImage from '../../../assets/images/about-security.jpg'

export const getCategoryFallbackImage = (cat) => {
  if (!cat) return imgSecsFallback
  const lower = (cat.nom_fr || cat.title || '').toLowerCase()
  if (lower.includes('sec') || lower.includes('épicerie') || lower.includes('epicerie')) return imgSecsFallback
  if (lower.includes('fruit') || lower.includes('légume') || lower.includes('legume') || lower.includes('frais')) return imgFruitsFallback
  if (lower.includes('viande') || lower.includes('volaille') || lower.includes('surgel')) return imgViandesFallback
  if (lower.includes('boisson') || lower.includes('consommable')) return imgBoissonsFallback
  if (lower.includes('entretien') || lower.includes('hygiène') || lower.includes('hygiene')) return imgEntretienFallback
  if (lower.includes('mercuriale') || lower.includes('mesure')) return imgSurMesureImage
  return imgSecsFallback
}
