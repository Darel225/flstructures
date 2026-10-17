import { forwardRef } from 'react'

/**
 * Champ de saisie texte standardisé pour le Design System Admin (44px, fond blanc, bordure fine).
 * @type {import('react').ForwardRefExoticComponent<any>}
 */
export const FormInput = forwardRef(function FormInput(
  {
    label,
    name,
    type = 'text',
    placeholder,
    error,
    hint,
    required = false,
    disabled = false,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    className = '',
    id,
    ...rest
  },
  ref
) {
  const inputId = id || name || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {/* Libellé & Indicateur requis (12,5 px semi-gras) */}
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[12.5px] font-semibold text-[#111111]"
        >
          {label}
          {required && <span className="ml-1 text-[#C0392B]">*</span>}
        </label>
      )}

      {/* Conteneur de champ (44px de hauteur) */}
      <div className="relative">
        {LeftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#777777]">
            <LeftIcon size={16} />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={`block w-full h-11 text-[14px] rounded-xl bg-white text-[#111111] placeholder-[#999999] transition-all ${
            LeftIcon ? 'pl-10' : 'pl-3.5'
          } ${RightIcon ? 'pr-10' : 'pr-3.5'} border ${
            error
              ? 'border-[#C0392B] focus:border-[#C0392B] focus:ring-2 focus:ring-[#C0392B]/20'
              : 'border-[#E8E4DF] focus:border-[#C0392B] focus:ring-2 focus:ring-[#C0392B]/20'
          } disabled:bg-[#F8F6F4] disabled:text-[#8A8580] disabled:cursor-not-allowed`}
          {...rest}
        />

        {RightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#777777]">
            <RightIcon size={16} />
          </div>
        )}
      </div>

      {/* Message d'aide ou message d'erreur Zod (12 px) */}
      {error ? (
        <p id={`${inputId}-error`} className="text-[12px] text-[#C0392B] font-medium">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-[12px] text-[#777777]">
          {hint}
        </p>
      ) : null}
    </div>
  )
})

export default FormInput
