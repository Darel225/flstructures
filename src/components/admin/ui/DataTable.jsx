import { ArrowUpDownIcon, ArrowUpIcon, ArrowDownIcon } from '../icons/AdminIcons'
import TableSkeleton from './TableSkeleton'
import EmptyState from './EmptyState'

/**
 * @typedef {Object} ColumnDef
 * @property {string|import('react').ReactNode} header - Titre de la colonne
 * @property {string} [accessor] - Clé de la propriété dans l'objet de données
 * @property {(item: any, index: number) => import('react').ReactNode} [cell] - Rendu personnalisé de la cellule
 * @property {string} [className] - Classes CSS personnalisées pour la colonne
 * @property {boolean} [sortable] - Indique si la colonne est triable
 */

/**
 * Tableau de données unifié pour l'espace d'administration de FL Structures.
 */
export default function DataTable({
  columns = [],
  data = [],
  isLoading = false,
  onRowClick,
  emptyMessage,
  emptyTitle = 'Aucun élément trouvé',
  emptyActionLabel,
  onEmptyAction,
  sortColumn,
  sortDirection,
  onSort,
  rowKey = (item, idx) => item?.id ?? idx,
  noOverflow = false,
  tableLayout = 'auto',
  renderMobileCard,
}) {
  return (
    <div className="w-full">
      {/* Mode Cartes Mobile (si renderMobileCard est fourni) */}
      {renderMobileCard && (
        <div className="block md:hidden space-y-3">
          {isLoading ? (
            <TableSkeleton columnsCount={1} rowsCount={3} />
          ) : data.length === 0 ? (
            <div className="rounded-2xl border border-[#E8E4DF] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              <EmptyState
                title={emptyTitle}
                description={emptyMessage}
                actionLabel={emptyActionLabel}
                onAction={onEmptyAction}
              />
            </div>
          ) : (
            data.map((item, index) => (
              <div
                key={rowKey(item, index)}
                className="rounded-2xl border border-[#E8E4DF] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
              >
                {renderMobileCard(item, index)}
              </div>
            ))
          )}
        </div>
      )}

      {/* Mode Tableau (Desktop / Tablette) */}
      <div
        className={`w-full overflow-hidden rounded-2xl border border-[#E8E4DF] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] ${
          renderMobileCard ? 'hidden md:block' : ''
        }`}
      >
        <div className={noOverflow ? 'w-full' : 'overflow-x-auto'}>
          <table
            className={`w-full text-left border-collapse ${
              tableLayout === 'fixed' ? 'table-fixed' : ''
            }`}
          >
            {/* En-tête clair avec micro-libellés gris */}
            <thead className="bg-[#FAF8F6] border-b border-[#E8E4DF] text-[11.5px] font-semibold uppercase tracking-wider text-[#777777] select-none">
              <tr>
                {columns.map((col, idx) => {
                  const key = col.accessor || `col-${idx}`
                  const isSorted = sortColumn && sortColumn === col.accessor
                  const canSort = Boolean(col.sortable && onSort && col.accessor)

                  return (
                    <th
                      key={key}
                      scope="col"
                      onClick={() => canSort && onSort(col.accessor)}
                      className={`px-4 py-3.5 whitespace-nowrap font-semibold ${
                        col.className || ''
                      } ${
                        canSort
                          ? 'cursor-pointer hover:bg-[#F2EFEB] transition-colors'
                          : ''
                      }`}
                    >
                      <div className="inline-flex items-center gap-1.5">
                        <span>{col.header}</span>
                        {canSort && (
                          <span className="text-[#8A8580]">
                            {isSorted ? (
                              sortDirection === 'asc' ? (
                                <ArrowUpIcon size={13} className="text-[#C0392B]" />
                              ) : (
                                <ArrowDownIcon size={13} className="text-[#C0392B]" />
                              )
                            ) : (
                              <ArrowUpDownIcon size={13} />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>

            {/* Corps du tableau */}
            {isLoading ? (
              <TableSkeleton columnsCount={columns.length || 5} rowsCount={5} />
            ) : data.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={columns.length || 1} className="p-0">
                    <EmptyState
                      title={emptyTitle}
                      description={emptyMessage}
                      actionLabel={emptyActionLabel}
                      onAction={onEmptyAction}
                    />
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody className="divide-y divide-[#E8E4DF] bg-white">
                {data.map((item, index) => {
                  const isClickable = Boolean(onRowClick)
                  return (
                    <tr
                      key={rowKey(item, index)}
                      onClick={() => isClickable && onRowClick(item)}
                      className={`transition-colors ${
                        isClickable
                          ? 'cursor-pointer hover:bg-[#F8F6F4] active:bg-[#F0ECE8]'
                          : 'hover:bg-[#F8F6F4]'
                      }`}
                    >
                      {columns.map((col, colIdx) => {
                        const cellKey = `cell-${rowKey(item, index)}-${col.id || col.accessor || colIdx}-${colIdx}`
                        let content = null

                        if (col.cell) {
                          content = col.cell(item, index)
                        } else if (col.accessor) {
                          content = item[col.accessor]
                        }

                        return (
                          <td
                            key={cellKey}
                            className={`px-4 py-3.5 text-[13.5px] text-[#111111] tabular-nums ${
                              col.className || ''
                            }`}
                          >
                            {content}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}
