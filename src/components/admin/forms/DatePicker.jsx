import { useState, useRef, useEffect, useId } from 'react'
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, CloseIcon, AlertCircleIcon } from '../icons/AdminIcons'

const FRENCH_MONTHS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
]

const FRENCH_WEEKDAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']

/**
 * Normalise une valeur de date entrante vers un objet Date valide.
 * Supporte les formats ISO 'YYYY-MM-DD', 'YYYY-MM' ou Date standard.
 */
function parseInitialDate(val) {
  if (!val) return null
  if (typeof val === 'string') {
    // Si format court 'YYYY-MM'
    if (/^\d{4}-\d{2}$/.test(val)) {
      const [year, month] = val.split('-').map(Number)
      return new Date(year, month - 1, 1)
    }
    // Si format ISO 'YYYY-MM-DD'
    if (/^\d{4}-\d{2}-\d{2}/.test(val)) {
      const [year, month, day] = val.slice(0, 10).split('-').map(Number)
      return new Date(year, month - 1, day)
    }
  }
  const d = new Date(val)
  return isNaN(d.getTime()) ? null : d
}

/**
 * Formate une Date en ISO 'YYYY-MM-DD'.
 */
function toISODate(d) {
  if (!d) return ''
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Formate pour l'affichage 'JJ/MM/AAAA'.
 */
function toDisplayDate(d) {
  if (!d) return ''
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * DatePicker sécurisé et accessible (sans saisie libre, popover en français, navigation clavier).
 *
 * @param {{
 *   value?: string,
 *   onChange: (isoDate: string) => void,
 *   label?: string,
 *   error?: string,
 *   required?: boolean,
 *   hint?: string,
 *   placeholder?: string,
 * }} props
 */
export default function DatePicker({
  value = '',
  onChange,
  label,
  error,
  required = false,
  hint,
  placeholder = 'Sélectionner une date (jj/mm/aaaa)',
}) {
  const containerRef = useRef(null)
  const popoverRef = useRef(null)
  const inputId = useId()

  const selectedDate = parseInitialDate(value)

  const [isOpen, setIsOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => selectedDate || new Date())
  const [focusedDate, setFocusedDate] = useState(() => selectedDate || new Date())

  const currentYear = new Date().getFullYear()
  const MIN_YEAR = 2015
  const MAX_YEAR = currentYear + 5

  // Années disponibles pour le sélecteur
  const availableYears = []
  for (let y = MIN_YEAR; y <= MAX_YEAR; y += 1) {
    availableYears.push(y)
  }

  const openPopover = () => {
    const initial = selectedDate || new Date()
    setViewDate(new Date(initial))
    setFocusedDate(new Date(initial))
    setIsOpen(true)
  }

  const togglePopover = () => {
    if (!isOpen) {
      openPopover()
    } else {
      setIsOpen(false)
    }
  }

  // Fermeture au clic extérieur ou touche Échap
  useEffect(() => {
    if (!isOpen) return

    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Mois / Année en cours de vue
  const viewYear = viewDate.getFullYear()
  const viewMonth = viewDate.getMonth()

  // Calcul du premier jour du mois (semaine commençant le lundi)
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1)
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  // getDay() renvoie 0 pour Dimanche, on convertit : Lundi = 0, ..., Dimanche = 6
  let startDayOfWeek = firstDayOfMonth.getDay() - 1
  if (startDayOfWeek === -1) startDayOfWeek = 6

  // Jours du mois précédent pour combler
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate()

  // Navigation mois
  const handlePrevMonth = () => {
    setViewDate(new Date(viewYear, viewMonth - 1, 1))
  }

  const handleNextMonth = () => {
    setViewDate(new Date(viewYear, viewMonth + 1, 1))
  }

  const handleYearChange = (e) => {
    const newY = Number(e.target.value)
    setViewDate(new Date(newY, viewMonth, 1))
  }

  const handleMonthChange = (e) => {
    const newM = Number(e.target.value)
    setViewDate(new Date(viewYear, newM, 1))
  }

  // Sélection d'un jour
  const handleSelectDay = (day) => {
    const target = new Date(viewYear, viewMonth, day)
    onChange(toISODate(target))
    setIsOpen(false)
  }

  // Effacer la date
  const handleClear = (e) => {
    e.stopPropagation()
    onChange('')
  }

  // Navigation au clavier dans le calendrier
  const handleCalendarKeyDown = (e) => {
    const current = new Date(focusedDate)
    let moved = false

    if (e.key === 'ArrowLeft') {
      current.setDate(current.getDate() - 1)
      moved = true
    } else if (e.key === 'ArrowRight') {
      current.setDate(current.getDate() + 1)
      moved = true
    } else if (e.key === 'ArrowUp') {
      current.setDate(current.getDate() - 7)
      moved = true
    } else if (e.key === 'ArrowDown') {
      current.setDate(current.getDate() + 7)
      moved = true
    } else if (e.key === 'Enter') {
      e.preventDefault()
      onChange(toISODate(focusedDate))
      setIsOpen(false)
      return
    }

    if (moved) {
      e.preventDefault()
      setFocusedDate(current)
      if (current.getMonth() !== viewMonth || current.getFullYear() !== viewYear) {
        setViewDate(new Date(current.getFullYear(), current.getMonth(), 1))
      }
    }
  }

  return (
    <div ref={containerRef} className="relative space-y-1.5 w-full">
      {/* Libellé */}
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[12.5px] font-semibold text-[#111111]"
        >
          {label} {required && <span className="text-[#C0392B]">*</span>}
        </label>
      )}

      {/* Déclencheur (Champ 44px, fond blanc, bordure fine) */}
      <div
        id={inputId}
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={togglePopover}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            openPopover()
          }
        }}
        className={`relative flex items-center justify-between w-full h-11 px-3.5 text-[14px] rounded-xl border bg-white cursor-pointer select-none transition-all ${
          isOpen
            ? 'border-[#C0392B] ring-2 ring-[#C0392B]/20'
            : error
              ? 'border-[#C0392B]'
              : 'border-[#E8E4DF] hover:border-[#C0392B]/50'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <CalendarIcon size={16} className="text-[#C0392B] shrink-0" />
          <span
            className={`truncate font-medium ${
              selectedDate
                ? 'text-[#111111] tabular-nums'
                : 'text-[#999999]'
            }`}
          >
            {selectedDate ? toDisplayDate(selectedDate) : placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {selectedDate && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Effacer la date"
              className="p-1 rounded-md text-[#777777] hover:text-[#111111] hover:bg-[#F8F6F4] transition-colors cursor-pointer"
            >
              <CloseIcon size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Message d'aide ou erreur */}
      {error ? (
        <div className="flex items-center gap-1.5 text-[12px] text-[#C0392B] font-medium">
          <AlertCircleIcon size={13} className="shrink-0" />
          <span>{error}</span>
        </div>
      ) : hint ? (
        <p className="text-[12px] text-[#777777]">{hint}</p>
      ) : null}

      {/* POPOVER CALENDRIER */}
      {isOpen && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="Choisir une date de livraison"
          aria-modal="true"
          tabIndex={0}
          onKeyDown={handleCalendarKeyDown}
          className="absolute z-50 top-full left-0 mt-2 w-72 sm:w-80 p-4 rounded-2xl bg-white border border-[#E8E4DF] shadow-xl space-y-3 animate-in fade-in zoom-in-95 duration-150 focus:outline-none"
        >
          {/* Navigation Mois / Année */}
          <div className="flex items-center justify-between gap-1 pb-3 border-b border-[#E8E4DF]">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Mois précédent"
              className="p-1.5 rounded-lg text-[#555555] hover:text-[#111111] hover:bg-[#F8F6F4] transition-colors cursor-pointer"
            >
              <ChevronLeftIcon size={16} />
            </button>

            <div className="flex items-center gap-1.5">
              <select
                value={viewMonth}
                onChange={handleMonthChange}
                aria-label="Sélectionner le mois"
                className="text-[12.5px] font-semibold text-[#111111] bg-white border border-[#E8E4DF] rounded-lg px-2.5 py-1 cursor-pointer focus:outline-none focus:border-[#C0392B] focus:ring-1 focus:ring-[#C0392B]"
              >
                {FRENCH_MONTHS.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={handleYearChange}
                aria-label="Sélectionner l'année"
                className="text-[12.5px] font-semibold text-[#111111] bg-white border border-[#E8E4DF] rounded-lg px-2 py-1 tabular-nums cursor-pointer focus:outline-none focus:border-[#C0392B] focus:ring-1 focus:ring-[#C0392B]"
              >
                {availableYears.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Mois suivant"
              className="p-1.5 rounded-lg text-[#555555] hover:text-[#111111] hover:bg-[#F8F6F4] transition-colors cursor-pointer"
            >
              <ChevronRightIcon size={16} />
            </button>
          </div>

          {/* En-tête des jours de la semaine (Lundi d'abord) */}
          <div className="grid grid-cols-7 text-center">
            {FRENCH_WEEKDAYS.map((day) => (
              <span
                key={day}
                className="text-[11.5px] font-semibold text-[#8A8580] py-1 uppercase tracking-wider"
              >
                {day}
              </span>
            ))}
          </div>

          {/* Grille des jours */}
          <div className="grid grid-cols-7 gap-1 text-[13px] tabular-nums">
            {/* Jours du mois précédent */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => {
              const dayNum = daysInPrevMonth - startDayOfWeek + i + 1
              return (
                <div
                  key={`prev-${i}`}
                  className="h-8 flex items-center justify-center text-[#D0CBC5] text-[12px] select-none"
                >
                  {dayNum}
                </div>
              )
            })}

            {/* Jours du mois en cours */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const isSelected =
                selectedDate &&
                selectedDate.getFullYear() === viewYear &&
                selectedDate.getMonth() === viewMonth &&
                selectedDate.getDate() === day

              const isFocused =
                focusedDate &&
                focusedDate.getFullYear() === viewYear &&
                focusedDate.getMonth() === viewMonth &&
                focusedDate.getDate() === day

              const isToday =
                new Date().getFullYear() === viewYear &&
                new Date().getMonth() === viewMonth &&
                new Date().getDate() === day

              return (
                <button
                  key={`curr-${day}`}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`h-8 w-full rounded-lg font-medium text-[13px] flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#C0392B] text-white font-semibold shadow-2xs'
                      : isToday
                        ? 'border border-[#C0392B] text-[#C0392B] font-semibold hover:bg-[#FDF2F0]'
                        : isFocused
                          ? 'bg-[#F8F6F4] text-[#111111]'
                          : 'text-[#111111] hover:bg-[#F8F6F4]'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Raccourci Aujourd'hui */}
          <div className="pt-2.5 border-t border-[#E8E4DF] flex items-center justify-between text-[12px]">
            <button
              type="button"
              onClick={() => {
                const today = new Date()
                onChange(toISODate(today))
                setIsOpen(false)
              }}
              className="text-[#C0392B] font-semibold hover:underline cursor-pointer"
            >
              Aujourd’hui
            </button>
            <span className="text-[#8A8580] tabular-nums">Format ISO aaaa-mm-jj</span>
          </div>
        </div>
      )}
    </div>
  )
}
