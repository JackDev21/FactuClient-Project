import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import Header from "../Header"
import Main from "../core/Main"
import Footer from "../core/Footer"
import SearchFilter from "../SearchFilter"

import useContext from "../../useContext"
import { SystemError } from "com/errors"

import { GoNote } from "react-icons/go"
import { FaChevronDown } from "react-icons/fa6"

import logic from "../../logic"

import "./DeliveryNotesList.css"

const PAGE_SIZE = 8

export default function DeliveryNoteList() {
  const { alert } = useContext()

  const [deliveryNotes, setDeliveryNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all") // 'all', 'pending', 'invoiced'
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useEffect(() => {
    setLoading(true)
    try {
      logic
        .getAllDeliveryNotes()
        .then((deliveryNotes) => {
          setDeliveryNotes(deliveryNotes || [])
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

  // Filtrado por búsqueda y por estado
  const filteredDeliveryNotes = deliveryNotes.filter((deliveryNote) => {
    const matchesSearch =
      deliveryNote.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (deliveryNote.customer?.companyName || deliveryNote.customerName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())

    if (!matchesSearch) return false

    if (statusFilter === "pending") return !deliveryNote.isInvoiced
    if (statusFilter === "invoiced") return !!deliveryNote.isInvoiced
    return true
  })

  // Reiniciar contador al buscar o cambiar filtro
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [searchTerm, statusFilter])

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

  const pendingCount = deliveryNotes.filter((d) => !d.isInvoiced).length
  const invoicedCount = deliveryNotes.filter((d) => d.isInvoiced).length

  return (
    <>
      <Header iconUser={<GoNote />}>Albaranes</Header>
      <Main>
        <div className="w-full max-w-xl flex flex-col items-center gap-3.5 px-3">
          <SearchFilter
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            placeholder="Buscar por nº o cliente..."
          />

          {/* Barra de Filtros Integrada */}
          <div className="flex w-full items-center justify-between rounded-2xl border border-slate-200/80 bg-white/90 p-1 shadow-sm backdrop-blur">
            <button
              onClick={() => setStatusFilter("all")}
              className={`flex-1 rounded-xl py-2.5 text-center text-xs sm:text-sm font-bold transition-all ${
                statusFilter === "all"
                  ? "bg-slate-900 text-white shadow"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Todos ({loading ? "..." : deliveryNotes.length})
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`flex-1 rounded-xl py-2.5 text-center text-xs sm:text-sm font-bold transition-all ${
                statusFilter === "pending"
                  ? "bg-amber-500 text-white shadow"
                  : "text-amber-700 hover:bg-amber-50/50"
              }`}
            >
              ⏳ Pendientes ({loading ? "..." : pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter("invoiced")}
              className={`flex-1 rounded-xl py-2.5 text-center text-xs sm:text-sm font-bold transition-all ${
                statusFilter === "invoiced"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-emerald-700 hover:bg-emerald-50/50"
              }`}
            >
              ✅ Facturados ({loading ? "..." : invoicedCount})
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
                      <div className="h-4 bg-slate-200 rounded-md w-1/3"></div>
                      <div className="h-3 bg-slate-100 rounded-md w-3/5"></div>
                    </div>
                    <div className="h-6 w-20 bg-slate-200 rounded-full"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {visibleDeliveryNotes.map((deliveryNote) => (
                  <Link className="DeliveryLink" to={`/delivery-notes/${deliveryNote.id}`} key={deliveryNote.id}>
                    <li
                      className={`DeliveryNoteCard ${
                        deliveryNote.isInvoiced
                          ? "border-l-4 border-l-emerald-500"
                          : "border-l-4 border-l-amber-500"
                      }`}
                    >
                      <div className="flex flex-col items-start gap-1 flex-1 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-slate-900">
                            A/Nº: {deliveryNote.number}
                          </span>
                          {deliveryNote.date && (
                            <span className="text-xs font-medium text-slate-400">
                              · {formatDate(deliveryNote.date)}
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-slate-600 text-left leading-snug">
                          {deliveryNote.customer?.companyName || deliveryNote.customerName || "Cliente"}
                        </span>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold tracking-wider ${
                          deliveryNote.isInvoiced
                            ? "bg-emerald-100/90 text-emerald-800 border border-emerald-200"
                            : "bg-amber-100/90 text-amber-800 border border-amber-200 uppercase"
                        }`}
                      >
                        {deliveryNote.isInvoiced
                          ? deliveryNote.invoiceNumber
                            ? `Fra. ${deliveryNote.invoiceNumber}`
                            : "Facturado"
                          : "Pendiente"}
                      </span>
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
