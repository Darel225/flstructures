/**
 * Squelette animé simulant le chargement des lignes d'un tableau.
 */
export default function TableSkeleton({ columnsCount = 5, rowsCount = 5 }) {
  const rows = Array.from({ length: rowsCount }, (_, i) => i)
  const columns = Array.from({ length: columnsCount }, (_, j) => j)

  return (
    <tbody className="divide-y divide-[#E8E4DF] bg-white">
      {rows.map((rowIdx) => (
        <tr key={rowIdx} className="animate-pulse">
          {columns.map((colIdx) => (
            <td key={colIdx} className="px-4 py-3.5 whitespace-nowrap">
              <div
                className="h-4 bg-[#EBE7E2]/70 rounded-md"
                style={{
                  width: `${60 + ((rowIdx + colIdx) % 4) * 10}%`,
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )
}
