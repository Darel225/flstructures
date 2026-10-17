export default function SectionHeading({
  overline,
  pill = false,
  title,
  subtitle,
  align = 'center',
  withBar = false,
}) {
  const isCenter = align === 'center'

  return (
    <div
      className={`flex flex-col ${
        isCenter ? 'items-center text-center' : 'items-start text-left'
      } mb-8 md:mb-11`}
    >
      {overline && (
        <div className="mb-2.5">
          {pill ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gray-200/80 bg-white font-heading text-[0.65rem] font-bold uppercase tracking-[0.16em] text-brand-black shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-red shrink-0" />
              <span>{overline}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 font-heading text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand-red">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-red shrink-0" />
              <span>{overline}</span>
            </div>
          )}
        </div>
      )}

      <h2 className="font-heading font-extrabold uppercase text-title text-brand-black tracking-[0.03em] leading-tight">
        {title}
      </h2>

      {withBar && (
        <div
          className={`h-0.5 w-12 bg-brand-red rounded-full mt-3.5 ${
            isCenter ? 'mx-auto' : ''
          }`}
        />
      )}

      {subtitle && (
        <p
          className={`text-gray-500 text-[0.875rem] md:text-[0.9375rem] mt-2.5 max-w-2xl leading-[1.65] font-normal ${
            isCenter ? 'mx-auto' : ''
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
