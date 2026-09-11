import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  FaHouse,
  FaFileShield,
  FaTruckFast,
  FaFlagCheckered,
  FaChevronRight,
  FaMagnifyingGlass,
  FaArrowRight,
  FaFilePdf,
} from "react-icons/fa6"
import { FaSpinner } from "react-icons/fa"

import useContext from "../../useContext"
import Header from "../../components/Header"
import Main from "../../components/core/Main"
import YearFilter from "../../components/YearFilter"
import MonthFilter from "../../components/MonthFilter"
import logic from "../../logic/index"
import getDocYear from "../../utils/getDocYear"
import getDocMonth from "../../utils/getDocMonth"

export default function DecaList() {
  const { alert: showAlert } = useContext()
  const navigate = useNavigate()

  const [decas, setDecas] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedMonth, setSelectedMonth] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all") // "all" | "active" | "completed"

  useEffect(() => {
    logic.getAllDecas()
      .then((items) => {
        setDecas(items || [])
        setLoading(false)
      })
      .catch((err) => {
        setLoading(false)
        showAlert(err.message)
      })
  }, [])

  const availableYears = Array.from(
    new Set(decas.map((d) => getDocYear(d)).filter(Boolean))
  )

  const decasInYear = decas.filter((d) => {
    if (selectedYear === "all") return true
    return getDocYear(d) === Number(selectedYear)
  })

  const availableMonths = Array.from(
    new Set(decasInYear.map((d) => getDocMonth(d)).filter((m) => m !== null))
  )

  const decasInMonth = decasInYear.filter((d) => {
    if (selectedMonth === "all") return true
    return getDocMonth(d) === Number(selectedMonth)
  })

  const filteredDecas = decasInMonth.filter((d) => {
    const term = searchTerm.toLowerCase()
    const matchSearch =
      (d.number || "").toLowerCase().includes(term) ||
      (d.customer?.companyName || "").toLowerCase().includes(term) ||
      (d.carrier?.name || "").toLowerCase().includes(term) ||
      (d.destination || "").toLowerCase().includes(term) ||
      (d.origin || "").toLowerCase().includes(term) ||
      (d.vehiclePlate || "").toLowerCase().includes(term)

    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && d.status !== "completed") ||
      (statusFilter === "completed" && d.status === "completed")

    return matchSearch && matchStatus
  })

  return (
    <>
      <Header
        iconLeftHeader={<FaHouse />}
        iconUser={<FaFileShield />}
        onDeleteDeliveryNote={() => navigate("/")}
      >
        Documentos DeCA
      </Header>

      <Main>
        <div className="w-full max-w-2xl flex flex-col gap-3 px-2 sm:px-4 py-2 pb-16 text-left">
          {/* Selector de Ejercicio Fiscal */}
          <YearFilter
            selectedYear={selectedYear}
            onSelectYear={(year) => {
              setSelectedYear(year)
              setSelectedMonth("all")
            }}
            availableYears={availableYears}
            currentYear={currentYear}
          />

          <MonthFilter
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
            availableMonths={availableMonths}
          />

          {/* Barra de búsqueda y filtros */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-xs flex flex-col gap-3">
            <div className="relative">
              <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por Nº DeCA, cliente, destino, matrícula..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                  statusFilter === "all"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Todos ({decasInMonth.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("active")}
                className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                  statusFilter === "active"
                    ? "bg-white text-emerald-800 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                En Ruta ({decasInMonth.filter((d) => d.status !== "completed").length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("completed")}
                className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                  statusFilter === "completed"
                    ? "bg-white text-slate-700 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Finalizados ({decasInMonth.filter((d) => d.status === "completed").length})
              </button>
            </div>
          </div>

          {/* Listado de Documentos */}
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-2">
              <FaSpinner className="animate-spin text-2xl text-amber-500" />
              <span className="text-xs font-semibold">Cargando registros de DeCA...</span>
            </div>
          ) : filteredDecas.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center flex flex-col items-center gap-2">
              <FaFileShield className="text-3xl text-slate-300" />
              <span className="text-sm font-bold text-slate-700">No hay documentos DeCA que mostrar</span>
              <p className="text-xs text-slate-400 max-w-xs">
                Para emitir un DeCA oficial, abre un albarán existente y pulsa el botón &quot;Emitir DeCA Oficial&quot;.
              </p>
              <Link
                to="/delivery-notes"
                className="mt-2 rounded-xl bg-amber-600 hover:bg-amber-700 px-4 py-2 text-xs font-bold text-white shadow-xs"
              >
                Ver Lista de Albaranes
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {filteredDecas.map((item) => {
                const isItemCompleted = item.status === "completed"
                const dateStr = item.generatedAt
                  ? new Date(item.generatedAt).toLocaleDateString("es-ES")
                  : ""

                return (
                  <Link
                    key={item.id}
                    to={`/deca/${item.id}`}
                    className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-amber-400 hover:shadow-md transition-all flex flex-col gap-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="rounded-lg bg-amber-100 text-amber-950 font-black text-xs px-2.5 py-1 border border-amber-200">
                          {item.number}
                        </span>

                        {isItemCompleted ? (
                          <span className="rounded-full bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-1">
                            <FaFlagCheckered /> Finalizado
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-1">
                            <FaTruckFast /> En Ruta
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] font-semibold text-slate-400">
                        {dateStr}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-amber-700 transition-colors">
                        {item.customer?.companyName || item.customer?.fullName || "Cliente"}
                      </span>

                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                        <span className="truncate max-w-[40%]">{item.origin}</span>
                        <FaArrowRight className="text-[10px] text-amber-600 shrink-0" />
                        <span className="truncate max-w-[40%]">{item.destination}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                      <span>
                        Matrícula: <strong className="text-slate-700">{item.vehiclePlate || "N/D"}</strong>
                        {item.cargoWeight ? ` · ${item.cargoWeight}` : ""}
                      </span>

                      <span className="flex items-center gap-1 text-amber-700 font-bold group-hover:translate-x-0.5 transition-transform">
                        Ver DeCA <FaChevronRight className="text-[9px]" />
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </Main>
    </>
  )
}
