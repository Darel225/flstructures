import { forwardRef } from 'react'
import { ChevronDownIcon } from '../icons/AdminIcons'

/**
 * Menu déroulant standardisé pour le Design System Admin (44px, fond blanc, chevron AdminIcons).
 * @type {import('react').ForwardRefExoticComponent<any>}
 */
export const FormSelect = forwardRef(function FormSelect(
  {
    label,
    name,
    options = [],
    placeholder = 'Sélectionnez une option',
    error,
    hint,
    required = false,
    disabled = false,
    className = '',
    id,
    ...rest
  },
  ref
) {
  const selectId = id || name || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {/* Libellé & Indicateur requis (12,5 px semi-gras) */}
      {label && (
        <label
          htmlFor={selectId}
          className="block text-[12.5px] font-semibold text-[#111111]"
        >
          {label}
          {required && <span className="ml-1 text-[#C0392B]">*</span>}
        </label>
      )}

      {/* Conteneur avec flèche personnalisée (44px de hauteur) */}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          name={name}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined
          }
          className={`block w-full h-11 appearance-none text-[14px] rounded-xl bg-white text-[#111111] pl-3.5 pr-10 transition-all border ${
            error
              ? 'border-[#C0392B] focus:border-[#C0392B] focus:ring-2 focus:ring-[#C0392B]/20'
              : 'border-[#E8E4DF] focus:border-[#C0392B] focus:ring-2 focus:ring-[#C0392B]/20'
          } disabled:bg-[#F8F6F4] disabled:text-[#8A8580] disabled:cursor-not-allowed`}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => {
            const isObject = typeof opt === 'object' && opt !== null
            const val = isObject ? opt.value : opt
            const lbl = isObject ? opt.label : opt
            return (
              <option key={val} value={val}>
                {lbl}
              </option>
            )
          })}
        </select>

        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#777777]">
          <ChevronDownIcon size={16} />
        </div>
      </div>

      {/* Erreur ou Indication (12 px) */}
      {error ? (
        <p
          id={`${selectId}-error`}
          className="text-[12px] text-[#C0392B] font-medium"
        >
          {error}
        </p>
      ) : hint ? (
        <p
          id={`${selectId}-hint`}
          className="text-[12px] text-[#777777]"
        >
          {hint}
        </p>
      ) : null}
    </div>
  )
})

export default FormSelect
