import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"

import Header from "../../components/Header"
import Main from "../../components/core/Main"
import Footer from "../../components/core/Footer"
import SearchFilter from "../../components/SearchFilter"
import YearFilter from "../../components/YearFilter"
import MonthFilter from "../../components/MonthFilter"

import useContext from "../../useContext"
import { SystemError } from "com/errors"

import { GoNote } from "react-icons/go"
import { FaChevronDown, FaTruckFast } from "react-icons/fa6"

import logic from "../../logic"
import getDocYear from "../../utils/getDocYear"
import getDocMonth from "../../utils/getDocMonth"

import "./DeliveryNotesList.css"

const PAGE_SIZE = 8

const parseDeliveryNoteNumber = (numStr) => {
  if (!numStr) return { year: 0, seq: 0 }
  if (numStr.startsWith("ALB-")) {
    const parts = numStr.split("-")
    return { year: parseInt(parts[1]) || 0, seq: parseInt(parts[2]) || 0 }
  }
  if (numStr.includes("/")) {
    const parts = numStr.split("/")
    return { year: parseInt(parts[0]) || 0, seq: parseInt(parts[1]) || 0 }
  }
  return { year: 0, seq: parseInt(numStr) || 0 }
}

export default function DeliveryNoteList() {
  const { alert } = useContext()

  const [deliveryNotes, setDeliveryNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedMonth, setSelectedMonth] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [searchParams] = useSearchParams()
  const initialStatus = searchParams.get("status") === "pending" ? "pending" : (searchParams.get("status") === "invoiced" ? "invoiced" : "all")
  const [statusFilter, setStatusFilter] = useState(initialStatus)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useEffect(() => {
    const paramStatus = searchParams.get("status")
    if (paramStatus === "pending" || paramStatus === "invoiced" || paramStatus === "all") {
      setStatusFilter(paramStatus)
    }
  }, [searchParams])

  useEffect(() => {
    setLoading(true)
    try {
      logic
        .getAllDeliveryNotes()
        .then((deliveryNotes) => {
          const sorted = (deliveryNotes || []).slice().sort((a, b) => {
            const numA = parseDeliveryNoteNumber(a.number)
            const numB = parseDeliveryNoteNumber(b.number)
            if (numB.year !== numA.year) {
              return numB.year - numA.year
            }
            return numB.seq - numA.seq
          })
          setDeliveryNotes(sorted)
        })
        .catch((error) => {
          if (error instanceof SystemError) {
            alert(error.message)
          }
          setDeliveryNotes([])
        })
        .finally(() => {
          setLoading(false)
        })
    } catch (error) {
      setLoading(false)
      alert(error.message)
    }
  }, [])

  const userRole = logic.getInfo()?.role
  const isDriver = userRole === "driver"

  // Años disponibles en el conjunto de datos
  const availableYears = Array.from(
    new Set(deliveryNotes.map((d) => getDocYear(d)).filter(Boolean))
  )

  // 1. Filtrado por año seleccionado
  const deliveryNotesInYear = deliveryNotes.filter((deliveryNote) => {
    if (selectedYear === "all") return true
    return getDocYear(deliveryNote) === Number(selectedYear)
  })

  // Meses disponibles en el año seleccionado
  const availableMonths = Array.from(
    new Set(deliveryNotesInYear.map((dn) => getDocMonth(dn)).filter((m) => m !== null))
  )

  // 2. Filtrado por mes seleccionado
  const deliveryNotesInMonth = deliveryNotesInYear.filter((deliveryNote) => {
    if (selectedMonth === "all") return true
    return getDocMonth(deliveryNote) === Number(selectedMonth)
  })

  // 3. Filtrado por búsqueda y por estado dentro del año y mes seleccionado
  const filteredDeliveryNotes = deliveryNotesInMonth.filter((deliveryNote) => {
    const matchesSearch =
      deliveryNote.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (deliveryNote.customer?.companyName || deliveryNote.customerName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())

    if (!matchesSearch) return false

    if (isDriver) {
      if (statusFilter === "pending") return deliveryNote.isValued === false
      if (statusFilter === "invoiced") return deliveryNote.isValued !== false
    } else {
      if (statusFilter === "pending") return !deliveryNote.isInvoiced
      if (statusFilter === "invoiced") return !!deliveryNote.isInvoiced
    }
    return true
  })

  // Reiniciar paginación al cambiar filtros, mes o año
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [searchTerm, statusFilter, selectedYear, selectedMonth])

  const visibleDeliveryNotes = filteredDeliveryNotes.slice(0, visibleCount)

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE)
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    })
  }

  const pendingCount = isDriver
    ? deliveryNotesInMonth.filter((d) => d.isValued === false).length
    : deliveryNotesInMonth.filter((d) => !d.isInvoiced).length

  const completedCount = isDriver
    ? deliveryNotesInMonth.filter((d) => d.isValued !== false).length
    : deliveryNotesInMonth.filter((d) => d.isInvoiced).length

  return (
    <>
      <Header iconUser={<GoNote />}>Albaranes</Header>
      <Main>
        <div className="w-full max-w-xl flex flex-col items-center gap-3.5 px-3">
          {/* Selector de Ejercicio Fiscal Híbrido */}
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

          <SearchFilter
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            placeholder="Buscar por nº o cliente..."
          />

          {/* Barra de Filtros Integrada */}
          <div className="flex w-full items-center justify-between rounded-2xl border border-slate-200/80 bg-white/90 p-1 shadow-sm backdrop-blur relative z-0">
            <button
              onClick={() => setStatusFilter("all")}
              className={`flex-1 rounded-xl py-2.5 text-center text-xs sm:text-sm font-bold transition-all ${
                statusFilter === "all"
                  ? "bg-slate-900 text-white shadow"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Todos ({loading ? "..." : deliveryNotesInMonth.length})
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`flex-1 rounded-xl py-2.5 text-center text-xs sm:text-sm font-bold transition-all ${
                statusFilter === "pending"
                  ? "bg-amber-500 text-white shadow"
                  : "text-amber-700 hover:bg-amber-50/50"
              }`}
            >
              ⏳ {isDriver ? "Pendientes Precio" : "Pendientes"} ({loading ? "..." : pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter("invoiced")}
              className={`flex-1 rounded-xl py-2.5 text-center text-xs sm:text-sm font-bold transition-all ${
                statusFilter === "invoiced"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-emerald-700 hover:bg-emerald-50/50"
              }`}
            >
              ✅ {isDriver ? "Valorados" : "Facturados"} ({loading ? "..." : completedCount})
            </button>
          </div>

          {/* Lista de Tarjetas */}
          <ul className="DeliveryList">
            {loading ? (
              <div className="flex flex-col gap-2.5 w-full">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-full rounded-2xl bg-white/80 p-4 border border-slate-200/70 shadow-xs animate-pulse flex items-center justify-between"
                  >
                    <div className="flex flex-col gap-2 flex-1 pr-4">
                      <div className="h-4 bg-slate-200 rounded-md w-2/5"></div>
                      <div className="h-3 bg-slate-100 rounded-md w-3/5"></div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <div className="h-5 w-20 bg-slate-200 rounded-full"></div>
                      <div className="h-4 w-16 bg-slate-100 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {visibleDeliveryNotes.map((deliveryNote) => (
                  <Link className="DeliveryLink" to={`/delivery-notes/${deliveryNote.id}`} key={deliveryNote.id}>
                    <li
                      className={`DeliveryNoteCard ${
                        isDriver
                          ? deliveryNote.isValued !== false
                            ? "border-l-4 border-l-emerald-500"
                            : "border-l-4 border-l-amber-500"
                          : deliveryNote.isInvoiced
                            ? "border-l-4 border-l-emerald-500"
                            : "border-l-4 border-l-amber-500"
                      }`}
                    >
                      <div className="flex flex-col items-start gap-1 flex-1 pr-2 min-w-0">
                        <span className="text-base font-bold text-slate-900 whitespace-nowrap">
                          A/Nº: {deliveryNote.number}
                        </span>
                        <span className="text-sm font-semibold text-slate-600 text-left leading-snug truncate max-w-full">
                          {deliveryNote.customer?.companyName || deliveryNote.customerName || "Cliente"}
                        </span>

                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                          {deliveryNote.createdByName && (
                            <span className="text-[10px] font-bold text-violet-700 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                              <FaTruckFast className="text-[9px]" />
                              {deliveryNote.createdByName}
                            </span>
                          )}
                          {!isDriver && deliveryNote.isValued === false && (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-1.5 py-0.5 rounded-md">
                              Sin valorar
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold tracking-wide whitespace-nowrap ${
                            isDriver
                              ? deliveryNote.isValued !== false
                                ? "bg-emerald-100/90 text-emerald-800 border border-emerald-200"
                                : "bg-amber-100/90 text-amber-800 border border-amber-200 uppercase"
                              : deliveryNote.isInvoiced
                                ? "bg-emerald-100/90 text-emerald-800 border border-emerald-200"
                                : "bg-amber-100/90 text-amber-800 border border-amber-200 uppercase"
                          }`}
                        >
                          {isDriver
                            ? deliveryNote.isValued !== false
                              ? "Valorado"
                              : "Pendiente precio"
                            : deliveryNote.isInvoiced
                              ? deliveryNote.invoiceNumber
                                ? `Fra. ${deliveryNote.invoiceNumber}`
                                : "Facturado"
                              : "Pendiente"}
                        </span>
                        {deliveryNote.date && (
                          <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-600 whitespace-nowrap">
                            {formatDate(deliveryNote.date)}
                          </span>
                        )}
                      </div>
                    </li>
                  </Link>
                ))}

                {filteredDeliveryNotes.length === 0 && (
                  <div className="w-full rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center backdrop-blur">
                    <p className="text-base font-medium text-slate-500">
                      No se encontraron albaranes con el criterio seleccionado.
                    </p>
                  </div>
                )}
              </>
            )}
          </ul>

          {/* Botón Cargar Más con Contador de Alto Contraste */}
          {visibleCount < filteredDeliveryNotes.length && (
            <div className="flex w-full flex-col items-center gap-2.5 py-3">
              <button
                onClick={handleLoadMore}
                className="flex items-center gap-2 rounded-2xl bg-orange-500 px-7 py-3 text-base font-bold text-white shadow-md transition-all active:scale-95 hover:bg-orange-600 hover:shadow-lg"
              >
                <span>Cargar más albaranes</span>
                <FaChevronDown className="text-xs" />
              </button>
              <span className="rounded-full bg-slate-900/80 px-4 py-1.5 text-xs sm:text-sm font-semibold text-slate-100 backdrop-blur shadow-sm">
                Mostrando {visibleDeliveryNotes.length} de {filteredDeliveryNotes.length} albaranes
              </span>
            </div>
          )}
        </div>
      </Main>
      <Footer>FactuClient</Footer>
    </>
  )
}
