const MonthFilter = ({ selectedMonth, handleMonthChange }) => {
  return (
    <div className="w-full flex items-center justify-between gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs mb-3 text-xs sm:text-sm">
      <label htmlFor="month" className="font-bold text-slate-700 flex items-center gap-1.5 shrink-0">
        <span>📅</span> Filtrar por mes:
      </label>
      <select
        id="month"
        value={selectedMonth}
        onChange={handleMonthChange}
        className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
      >
        <option value="">Todos los meses</option>
        <option value="1">Enero</option>
        <option value="2">Febrero</option>
        <option value="3">Marzo</option>
        <option value="4">Abril</option>
        <option value="5">Mayo</option>
        <option value="6">Junio</option>
        <option value="7">Julio</option>
        <option value="8">Agosto</option>
        <option value="9">Septiembre</option>
        <option value="10">Octubre</option>
        <option value="11">Noviembre</option>
        <option value="12">Diciembre</option>
      </select>
    </div>
  )
}

export default MonthFilter
