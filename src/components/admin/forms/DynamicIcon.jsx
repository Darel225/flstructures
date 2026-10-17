import * as Icons from 'lucide-react'

/**
 * Composant de rendu sécurisé et dynamique d'icônes Lucide.
 * Résout l'icône dynamiquement par son nom et bascule sur CheckCircle2 ou Sparkles si l'icône est introuvable.
 */
export const DynamicIcon = ({ name, className = '', size, ...props }) => {
  const IconComp = Icons[name] || Icons.CheckCircle2 || Icons.Sparkles
  return <IconComp className={className} {...(size ? { size } : {})} {...props} />
}

export default DynamicIcon
