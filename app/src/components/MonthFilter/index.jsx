import { useRef, useEffect } from "react"
import { FaCalendarDays, FaXmark } from "react-icons/fa6"

const MONTH_NAMES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
]

const FULL_MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

/**
 * Componente horizontal ergonómico para filtrado por meses.
 *
 * @param {Object} props
 * @param {string|number} props.selectedMonth - "all" o número del 0 al 11
 * @param {function} props.onSelectMonth - Callback que recibe el nuevo mes ("all" o número 0-11)
 * @param {number[]} [props.availableMonths] - Array opcional de meses con documentos existentes
 * @param {string} [props.className] - Clases adicionales de Tailwind
 */
export default function MonthFilter({
  selectedMonth,
  onSelectMonth,
  availableMonths = null,
  className = "",
}) {
  const containerRef = useRef(null)
  const activeBtnRef = useRef(null)

  // Desplazar automáticamente hacia el botón activo si está fuera de vista
  useEffect(() => {
    if (activeBtnRef.current && containerRef.current) {
      activeBtnRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      })
    }
  }, [selectedMonth])

  const isAllSelected = selectedMonth === "all"

  return (
    <div className={`flex w-full flex-col gap-1.5 ${className}`}>
      {/* Barra horizontal desplazable con soporte táctil */}
      <div
        ref={containerRef}
        className="flex w-full items-center gap-1.5 overflow-x-auto py-1 px-0.5 no-scrollbar scroll-smooth"
      >
        {/* Botón: Todos los meses */}
        <button
          type="button"
          ref={isAllSelected ? activeBtnRef : null}
          onClick={() => onSelectMonth("all")}
          className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 ${
            isAllSelected
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white/90 text-slate-600 border border-slate-200/80 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <span>Todos los meses</span>
        </button>

        {/* Botones de los 12 meses */}
        {MONTH_NAMES.map((name, idx) => {
          const isSelected = selectedMonth !== "all" && Number(selectedMonth) === idx
          const hasDocs = availableMonths === null || availableMonths.includes(idx)

          return (
            <button
              key={name}
              type="button"
              ref={isSelected ? activeBtnRef : null}
              onClick={() => onSelectMonth(isSelected ? "all" : idx)}
              className={`shrink-0 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center justify-center relative ${
                isSelected
                  ? "bg-amber-500 text-white shadow-xs"
                  : hasDocs
                  ? "bg-white text-slate-800 border border-slate-200/90 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-300"
                  : "bg-slate-50/80 text-slate-400 border border-slate-100 hover:bg-slate-100 hover:text-slate-600"
              }`}
              title={`Filtrar por ${FULL_MONTH_NAMES[idx]}`}
            >
              <span>{name}</span>
              {/* Punto indicador discreto si el mes tiene documentos y no está seleccionado */}
              {!isSelected && hasDocs && availableMonths !== null && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              )}
            </button>
          )
        })}
      </div>

      {/* Indicador de mes filtrado con botón rápido de reset */}
      {!isAllSelected && (
        <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-amber-900 bg-amber-50/80 border border-amber-200/80 rounded-xl py-1 px-2.5 animate-fadeIn">
          <div className="flex items-center gap-1.5">
            <FaCalendarDays className="text-amber-600 text-xs" />
            <span>
              Filtrado por: <strong>{FULL_MONTH_NAMES[Number(selectedMonth)]}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSelectMonth("all")}
            className="flex items-center gap-1 text-[11px] text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer"
          >
            <FaXmark className="text-[10px]" />
            <span>Ver todo el año</span>
          </button>
        </div>
      )}
    </div>
  )
}
