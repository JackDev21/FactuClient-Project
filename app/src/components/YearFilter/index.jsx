import { useState, useRef, useEffect } from "react"
import { FaChevronDown, FaCalendarDays, FaCheck, FaMagnifyingGlass, FaClockRotateLeft } from "react-icons/fa6"

/**
 * Selector de Ejercicio Fiscal con Patrón Híbrido Inteligente.
 *
 * Muestra acceso directo a 1 toque para el Año Actual y el Año Anterior,
 * y agrupa los años más antiguos y la opción de búsqueda global en "Histórico ▼".
 *
 * @param {Object} props
 * @param {number|string} props.selectedYear - Año seleccionado (ej. 2026 o "all")
 * @param {function} props.onSelectYear - Callback al cambiar de año
 * @param {number[]} props.availableYears - Array de años presentes en los datos
 * @param {number} [props.currentYear] - Año actual (por defecto año actual de sistema)
 */
export default function YearFilter({
  selectedYear,
  onSelectYear,
  availableYears = [],
  currentYear = new Date().getFullYear(),
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const prevYear = currentYear - 1

  // Años históricos estrictamente anteriores al año anterior (< currentYear - 1)
  const olderYears = Array.from(
    new Set(
      availableYears
        .map(Number)
        .filter((y) => !isNaN(y) && y < prevYear)
    )
  ).sort((a, b) => b - a)

  // Cerrar desplegable al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("touchstart", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [dropdownOpen])

  const isCurrentYearActive = Number(selectedYear) === currentYear
  const isPrevYearActive = Number(selectedYear) === prevYear
  const isHistoricalActive = !isCurrentYearActive && !isPrevYearActive

  const getHistoricalLabel = () => {
    if (selectedYear === "all") return "Todos ▼"
    if (isHistoricalActive) return `${selectedYear} ▼`
    return "Histórico ▼"
  }

  return (
    <div className={`flex w-full flex-col gap-2 relative ${dropdownOpen ? "z-50" : "z-20"}`}>
      {/* Barra de Pestañas Híbrida */}
      <div className="flex w-full items-center justify-between rounded-2xl border border-slate-200/80 bg-white/95 p-1 shadow-sm backdrop-blur relative">
        {/* Botón 1: Año en Curso */}
        <button
          type="button"
          onClick={() => {
            setDropdownOpen(false)
            onSelectYear(currentYear)
          }}
          className={`flex-1 rounded-xl py-2 px-2 text-center text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-1.5 ${
            isCurrentYearActive
              ? "bg-slate-900 text-white shadow"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
          }`}
        >
          <FaCalendarDays className={`text-xs ${isCurrentYearActive ? "text-amber-400" : "text-slate-400"}`} />
          <span>{currentYear}</span>
          <span className="hidden sm:inline text-[10px] font-semibold opacity-75">(Actual)</span>
        </button>

        {/* Botón 2: Año Anterior */}
        <button
          type="button"
          onClick={() => {
            setDropdownOpen(false)
            onSelectYear(prevYear)
          }}
          className={`flex-1 rounded-xl py-2 px-2 text-center text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-1.5 ${
            isPrevYearActive
              ? "bg-slate-900 text-white shadow"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
          }`}
        >
          <span>{prevYear}</span>
        </button>

        {/* Botón 3: Histórico y Global con Desplegable */}
        <div className="relative flex-1" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className={`w-full rounded-xl py-2 px-2 text-center text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-1 ${
              isHistoricalActive
                ? "bg-amber-500 text-white shadow"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
            }`}
          >
            <span>{getHistoricalLabel()}</span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 z-50 w-60 sm:w-64 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-100">
              {olderYears.length > 0 && (
                <>
                  <div className="px-3 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Ejercicios Anteriores
                  </div>

                  <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto">
                    {olderYears.map((yr) => {
                      const isSelected = Number(selectedYear) === yr
                      return (
                        <button
                          key={yr}
                          type="button"
                          onClick={() => {
                            onSelectYear(yr)
                            setDropdownOpen(false)
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs sm:text-sm font-bold transition-all ${
                            isSelected
                              ? "bg-amber-50 text-amber-900 font-black"
                              : "text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <span>Ejercicio {yr}</span>
                          {isSelected && <FaCheck className="text-amber-600 text-xs" />}
                        </button>
                      )
                    })}
                  </div>

                  <div className="my-1.5 border-t border-slate-100" />
                </>
              )}

              {/* Opción Global: Ver todos los años */}
              <button
                type="button"
                onClick={() => {
                  onSelectYear("all")
                  setDropdownOpen(false)
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs sm:text-sm font-bold transition-all ${
                  selectedYear === "all"
                    ? "bg-slate-900 text-white font-black"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FaMagnifyingGlass
                    className={`text-xs shrink-0 ${
                      selectedYear === "all" ? "text-amber-400" : "text-slate-500"
                    }`}
                  />
                  <div className="flex flex-col text-left">
                    <span className="leading-tight whitespace-nowrap">Ver todos los años</span>
                    <span
                      className={`text-[10px] font-normal ${
                        selectedYear === "all" ? "text-slate-300" : "text-slate-400"
                      }`}
                    >
                      Búsqueda en todo el histórico
                    </span>
                  </div>
                </div>
                {selectedYear === "all" && <FaCheck className="text-amber-400 text-xs shrink-0 ml-2" />}
              </button>

              {olderYears.length === 0 && (
                <div className="px-3 pt-2 pb-1 text-[11px] text-slate-400 leading-snug border-t border-slate-100 mt-1.5">
                  No constan ejercicios anteriores a {prevYear}.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Banner Informativo (Solo cuando se consulta un ejercicio histórico o global) */}
      {!isCurrentYearActive && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-300 bg-amber-50/90 px-3 py-2 text-xs font-semibold text-amber-900 shadow-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2 flex-1 leading-snug">
            <FaClockRotateLeft className="text-amber-600 shrink-0 text-sm" />
            <span>
              Visualizando{" "}
              <strong>
                {selectedYear === "all" ? "Histórico Completo (Todos los años)" : `Ejercicio ${selectedYear}`}
              </strong>
              . Los nuevos documentos se emitirán en {currentYear}.
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSelectYear(currentYear)}
            className="shrink-0 rounded-lg bg-amber-200/80 px-2 py-1 text-[11px] font-black text-amber-950 hover:bg-amber-300 transition-colors"
          >
            Ir a {currentYear}
          </button>
        </div>
      )}
    </div>
  )
}
