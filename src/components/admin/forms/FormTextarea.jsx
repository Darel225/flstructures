import { forwardRef } from 'react'

/**
 * Zone de texte multiligne standardisée pour le Design System Admin.
 * @type {import('react').ForwardRefExoticComponent<any>}
 */
export const FormTextarea = forwardRef(function FormTextarea(
  {
    label,
    name,
    rows = 4,
    placeholder,
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
  const textareaId = id || name || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {/* Libellé & Indicateur requis (12,5 px semi-gras) */}
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-[12.5px] font-semibold text-[#111111]"
        >
          {label}
          {required && <span className="ml-1 text-[#C0392B]">*</span>}
        </label>
      )}

      {/* Zone de texte */}
      <textarea
        ref={ref}
        id={textareaId}
        name={name}
        rows={rows}
        disabled={disabled}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined
        }
        className={`block w-full text-[14px] rounded-xl bg-white text-[#111111] placeholder-[#999999] px-3.5 py-2.5 transition-all border ${
          error
            ? 'border-[#C0392B] focus:border-[#C0392B] focus:ring-2 focus:ring-[#C0392B]/20'
            : 'border-[#E8E4DF] focus:border-[#C0392B] focus:ring-2 focus:ring-[#C0392B]/20'
        } disabled:bg-[#F8F6F4] disabled:text-[#8A8580] disabled:cursor-not-allowed resize-y`}
        {...rest}
      />

      {/* Erreur ou Indication (12 px) */}
      {error ? (
        <p
          id={`${textareaId}-error`}
          className="text-[12px] text-[#C0392B] font-medium"
        >
          {error}
        </p>
      ) : hint ? (
        <p
          id={`${textareaId}-hint`}
          className="text-[12px] text-[#777777]"
        >
          {hint}
        </p>
      ) : null}
    </div>
  )
})

export default FormTextarea
