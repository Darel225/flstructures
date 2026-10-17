/**
 * Interrupteur à bascule (Toggle Switch) pour le Design System Admin.
 */
export default function FormSwitch({
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  name,
  id,
  error,
  className = '',
}) {
  const switchId = id || name || label?.toLowerCase().replace(/\s+/g, '-')

  const handleToggle = () => {
    if (!disabled && onChange) {
      onChange(!checked)
    }
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        {/* Libellé et description textuelle */}
        {(label || description) && (
          <div
            className={`flex flex-col select-none ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
            onClick={disabled ? undefined : handleToggle}
          >
            {label && (
              <span
                id={`${switchId}-label`}
                className="text-[12.5px] font-semibold text-[#111111]"
              >
                {label}
              </span>
            )}
            {description && (
              <span className="text-[12px] text-[#555555] mt-0.5">
                {description}
              </span>
            )}
          </div>
        )}

        {/* Bouton interrupteur */}
        <button
          type="button"
          role="switch"
          id={switchId}
          aria-checked={checked}
          aria-labelledby={label ? `${switchId}-label` : undefined}
          disabled={disabled}
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#C0392B]/30 focus:ring-offset-1 ${
            checked
              ? 'bg-[#C0392B]'
              : 'bg-[#E8E4DF]'
          } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-2xs ring-0 transition duration-200 ease-in-out ${
              checked ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {error && (
        <p className="text-[12px] text-[#C0392B] font-medium">
          {error}
        </p>
      )}
    </div>
  )
}
