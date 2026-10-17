import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const VARIANT_MAP = {
  primary:
    'bg-brand-red text-white hover:bg-brand-red-dark hover:shadow-md hover:shadow-brand-red/25',
  outline:
    'border border-brand-black text-brand-black hover:bg-brand-black hover:text-white',
  'outline-light':
    'border border-white/70 text-white hover:bg-white hover:text-brand-black',
}

export default function ButtonLink({
  to,
  variant = 'primary',
  size = 'md',
  showArrow = true,
  icon: Icon = null,
  className = '',
  children,
  onClick,
  type = 'button',
  ...rest
}) {
  const sizeClasses = size === 'sm' ? 'h-10 px-5' : 'h-11 px-6'
  const variantClasses = VARIANT_MAP[variant] || VARIANT_MAP.primary
  const RenderIcon = Icon || (showArrow ? ArrowRight : null)
  const commonClasses = `group inline-flex items-center justify-center gap-2 uppercase font-heading font-bold text-[0.78rem] tracking-[0.08em] rounded-sm transition-[color,background-color,border-color,box-shadow,transform] duration-200 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red cursor-pointer ${sizeClasses} ${variantClasses} ${className}`

  if (!to || onClick) {
    return (
      <button
        type={type}
        onClick={onClick}
        className={commonClasses}
        {...rest}
      >
        <span>{children}</span>
        {RenderIcon && (
          <RenderIcon
            size={15}
            className="transition-transform duration-200 motion-safe:group-hover:translate-x-0.5 shrink-0"
          />
        )}
      </button>
    )
  }

  return (
    <Link
      to={to}
      className={commonClasses}
      {...rest}
    >
      <span>{children}</span>
      {RenderIcon && (
        <RenderIcon
          size={15}
          className="transition-transform duration-200 motion-safe:group-hover:translate-x-0.5 shrink-0"
        />
      )}
    </Link>
  )
}
