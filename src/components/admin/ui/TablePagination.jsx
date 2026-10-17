import { ChevronLeftIcon, ChevronRightIcon } from '../icons/AdminIcons'

/**
 * Calcule la liste des numéros de pages avec ellipses si nécessaire.
 */
function getPageNumbers(current, total) {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  if (current <= 3) {
    return [1, 2, 3, 4, '...', total]
  }

  if (current >= total - 2) {
    return [1, '...', total - 3, total - 2, total - 1, total]
  }

  return [1, '...', current - 1, current, current + 1, '...', total]
}

/**
 * Barre de pagination standardisée pour les tableaux d'administration.
 */
export default function TablePagination({
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
}) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)
  const pageNumbers = getPageNumbers(currentPage, totalPages)

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 py-3 bg-white border-t border-[#E8E4DF] text-[13px] text-[#555555] select-none">
      {/* 1. Compteur et sélecteur de taille */}
      <div className="flex items-center gap-4 flex-wrap tabular-nums">
        <span>
          Affichage de{' '}
          <strong className="font-semibold text-[#111111]">
            {startItem}
          </strong>{' '}
          à{' '}
          <strong className="font-semibold text-[#111111]">
            {endItem}
          </strong>{' '}
          sur{' '}
          <strong className="font-semibold text-[#111111]">
            {totalItems}
          </strong>{' '}
          résultats
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-[#8A8580]">Lignes :</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label="Nombre de lignes par page"
              className="bg-white border border-[#E8E4DF] rounded-lg px-2 py-1 text-[12.5px] text-[#111111] focus:outline-none focus:border-[#C0392B] focus:ring-1 focus:ring-[#C0392B]"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 2. Boutons de navigation et numéros */}
      <div className="flex items-center gap-1 self-center sm:self-auto tabular-nums">
        {/* Précédent */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Page précédente"
          className="p-1.5 rounded-lg border border-[#E8E4DF] bg-white text-[#555555] hover:text-[#111111] hover:bg-[#F8F6F4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeftIcon size={16} />
        </button>

        {/* Numéros de page */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 py-1 text-[#8A8580] font-medium"
                >
                  ...
                </span>
              )
            }

            const pageNum = Number(page)
            const isActive = pageNum === currentPage

            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                aria-current={isActive ? 'page' : undefined}
                className={`min-w-[32px] h-[32px] px-2 rounded-lg font-semibold text-[13px] transition-colors ${
                  isActive
                    ? 'bg-[#C0392B] text-white shadow-2xs'
                    : 'border border-[#E8E4DF] bg-white text-[#111111] hover:bg-[#F8F6F4]'
                }`}
              >
                {pageNum}
              </button>
            )
          })}
        </div>

        {/* Suivant */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Page suivante"
          className="p-1.5 rounded-lg border border-[#E8E4DF] bg-white text-[#555555] hover:text-[#111111] hover:bg-[#F8F6F4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRightIcon size={16} />
        </button>
      </div>
    </div>
  )
}
