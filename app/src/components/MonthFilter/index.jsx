const MonthFilter = ({ selectedMonth, handleMonthChange }) => {
  return (
    <div className="mb-5">
      <label htmlFor="month">Filtrar por mes:</label>
      <select id="month" value={selectedMonth} onChange={handleMonthChange}>
        <option value="">Todos</option>
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
