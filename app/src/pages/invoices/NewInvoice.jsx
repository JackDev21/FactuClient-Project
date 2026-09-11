import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { FaChevronRight, FaFileInvoiceDollar, FaReceipt, FaCheck, FaRotateLeft, FaEye, FaEyeSlash } from "react-icons/fa6"

import useContext from "../../useContext"
import { NotFoundError, SystemError } from "com/errors"

import Header from "../../components/Header"
import Main from "../../components/core/Main"
import Footer from "../../components/core/Footer"
import Time from "../../components/core/Time"
import MonthFilter from "../../components/MonthFilter"
import SearchFilter from "../../components/SearchFilter"

import logic from "../../logic/index"

export default function NewInvoice() {
  const { alert } = useContext()
  const navigate = useNavigate()

  const [customers, setCustomers] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showCustomerList, setShowCustomerList] = useState(true)
  const [deliveryNotes, setDeliveryNotes] = useState([])
  const [selectedDeliveryNotes, setSelectedDeliveryNotes] = useState([])
  const [expandedNotes, setExpandedNotes] = useState({})
  const [statusFilter, setStatusFilter] = useState("pending")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")
  const today = new Date().toISOString().split("T")[0]
  const [invoiceDate, setInvoiceDate] = useState(today)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const isCreatingRef = useRef(false)

  const filterCustomers = () =>
    customers.filter((customer) => customer.companyName.toLowerCase().includes(searchTerm.toLowerCase()))

  useEffect(() => {
    try {
      //prettier-ignore
      logic
        .getAllCustomers()
        .then((customers) => {
          setCustomers(customers || [])
          setLoading(false)
        })
        .catch((error) => {
          setLoading(false)
          if (error instanceof SystemError) {
            alert(error.message)
          }
        })
    } catch (error) {
      setLoading(false)
      alert(error.message)
    }
  }, [])

  const handleCustomerSelect = (customer) => {
    setLoading(true)
    try {
      //prettier-ignore
      logic
        .getAllDeliveryNotesCustomer(customer.id || customer._id)
        .then((customerDeliveryNotes) => {
          setLoading(false)
          const notes = customerDeliveryNotes || []

          if (notes.length === 0) {
            alert("Este cliente no tiene ningún albarán registrado. Debes crear al menos un albarán antes de poder facturarle.")
            return
          }

          const hasPending = notes.some((d) => !d.isInvoiced)
          if (!hasPending) {
            alert("Este cliente no tiene albaranes pendientes. Todos sus albaranes ya han sido facturados anteriormente.")
            return
          }

          setSelectedCustomer(customer)
          setExpandedNotes({})
          setStatusFilter("pending")
          setDeliveryNotes(notes)
          setShowCustomerList(false)
        })
        .catch((error) => {
          setLoading(false)
          if (error instanceof NotFoundError || error.message === "DeliveryNotes not found") {
            alert("Este cliente no tiene ningún albarán registrado. Debes crear al menos un albarán antes de poder facturarle.")
          } else {
            alert(error.message)
          }
        })
    } catch (error) {
      setLoading(false)
      alert(error.message)
    }
  }

  const toggleExpandNote = (deliveryNoteId, event) => {
    if (event) event.stopPropagation()
    setExpandedNotes((prev) => ({
      ...prev,
      [deliveryNoteId]: !prev[deliveryNoteId],
    }))
  }

  const handleCheckboxChange = (deliveryNoteId) => {
    const dn = deliveryNotes.find((d) => (d.id || d._id) === deliveryNoteId)
    if (dn && dn.isInvoiced) {
      alert("Este albarán ya ha sido facturado anteriormente.")
      return
    }

    setSelectedDeliveryNotes((prevSelected) => {
      if (prevSelected.includes(deliveryNoteId)) {
        return prevSelected.filter((id) => id !== deliveryNoteId)
      } else {
        return [...prevSelected, deliveryNoteId]
      }
    })
  }

  const handleSelectAll = () => {
    const pendingInCurrentView = filteredDeliveryNotes
      .filter((d) => !d.isInvoiced)
      .map((d) => d.id || d._id)

    if (pendingInCurrentView.length === 0) return

    const allAreSelected = pendingInCurrentView.every((id) =>
      selectedDeliveryNotes.includes(id)
    )

    if (allAreSelected) {
      setSelectedDeliveryNotes((prev) =>
        prev.filter((id) => !pendingInCurrentView.includes(id))
      )
    } else {
      setSelectedDeliveryNotes((prev) =>
        Array.from(new Set([...prev, ...pendingInCurrentView]))
      )
    }
  }

  const handleBackToCustomerSelect = () => {
    setSelectedCustomer(null)
    setShowCustomerList(true)
    setDeliveryNotes([])
    setSelectedDeliveryNotes([])
    setExpandedNotes({})
    setStatusFilter("pending")
    setSearchTerm("")
    setSelectedMonth("")
  }

  const handleCreateInvoice = () => {
    if (isCreatingRef.current || creating) return

    if (selectedDeliveryNotes.length === 0) {
      alert("Por favor, selecciona al menos un albarán para facturar.")
      return
    }

    isCreatingRef.current = true
    setCreating(true)
    try {
      //prettier-ignore
      logic
        .createInvoice(selectedCustomer.id || selectedCustomer._id, selectedDeliveryNotes, invoiceDate)
        .then(() => {
          isCreatingRef.current = false
          setCreating(false)
          alert("Factura creada correctamente")
          navigate("/invoices")
        })
        .catch((error) => {
          isCreatingRef.current = false
          setCreating(false)
          alert(error.message)
        })
    } catch (error) {
      isCreatingRef.current = false
      setCreating(false)
      alert(error.message)
    }
  }

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value)
  }

  const pendingCount = deliveryNotes.filter((d) => !d.isInvoiced).length
  const invoicedCount = deliveryNotes.filter((d) => d.isInvoiced).length

  const filteredDeliveryNotes = deliveryNotes.filter((deliveryNote) => {
    if (selectedMonth) {
      const noteMonth = new Date(deliveryNote.date).getMonth() + 1
      if (noteMonth !== parseInt(selectedMonth, 10)) return false
    }

    if (statusFilter === "pending" && deliveryNote.isInvoiced) return false
    if (statusFilter === "invoiced" && !deliveryNote.isInvoiced) return false

    return true
  })

  return (
    <>
      <Header iconUser={<FaFileInvoiceDollar />}>
        Crear Factura
      </Header>

      <Main className="MainCreateInvoice">
        <div className="w-full max-w-lg mx-auto flex flex-col gap-3.5 sm:gap-4 px-3 sm:px-4">
          {showCustomerList ? (
            /* PASO 1: SELECCIONAR CLIENTE */
            <>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Paso 1: Selecciona un Cliente
                </span>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Elige el cliente cuyos albaranes pendientes deseas facturar
                </p>
              </div>

              <SearchFilter
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                placeholder="Buscar por nombre o CIF..."
              />

              <div className="flex flex-col gap-2.5 w-full">
                {loading ? (
                  <div className="flex flex-col gap-2.5 w-full">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-full rounded-2xl bg-white/80 p-4 border border-slate-200/70 shadow-xs animate-pulse flex items-center justify-between"
                      >
                        <div className="flex flex-col gap-2 flex-1 pr-4">
                          <div className="h-4 bg-slate-200 rounded-md w-1/2"></div>
                          <div className="h-3 bg-slate-100 rounded-md w-1/3"></div>
                        </div>
                        <div className="h-4 w-4 bg-slate-200 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                ) : filterCustomers().length === 0 ? (
                  <div className="py-12 text-center text-slate-400 font-medium text-sm bg-white rounded-2xl border border-slate-200 p-6">
                    No se encontraron clientes.
                  </div>
                ) : (
                  filterCustomers().map((customer) => (
                    <div
                      key={customer.id || customer._id}
                      onClick={() => handleCustomerSelect(customer)}
                      className="w-full flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition-all hover:shadow-md hover:border-blue-300 active:scale-98 cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-black text-lg flex items-center justify-center shadow-xs shrink-0">
                          {customer?.companyName ? customer.companyName.charAt(0).toUpperCase() : "C"}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug break-words">
                            {customer.companyName}
                          </span>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400 mt-0.5 font-medium">
                            {customer.taxId && <span>{customer.taxId}</span>}
                            {customer.phone && <span>• 📞 {customer.phone}</span>}
                          </div>
                        </div>
                      </div>
                      <FaChevronRight className="text-slate-300 text-sm shrink-0 ml-2" />
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            /* PASO 2: SELECCIONAR ALBARANES A FACTURAR */
            <>
              {/* PASO 2: Selección de Albaranes para Facturar */}
              <div className="flex items-center justify-between rounded-2xl border border-blue-200 bg-blue-50/70 p-3.5 shadow-xs">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                    ✓
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                      Cliente Seleccionado
                    </span>
                    <span className="text-sm font-extrabold text-slate-900 truncate">
                      {selectedCustomer.companyName}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleBackToCustomerSelect}
                  className="flex items-center gap-1.5 rounded-xl bg-white border border-blue-200 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100/60 active:scale-95 transition-all shrink-0 ml-2"
                >
                  <FaRotateLeft className="text-[10px]" />
                  <span>Cambiar</span>
                </button>
              </div>

              {/* Fecha de Factura */}
              <div className="w-full flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs text-xs sm:text-sm">
                <label htmlFor="invoiceDate" className="font-bold text-slate-700 flex items-center gap-1.5 shrink-0">
                  <span>📅</span> Fecha de Emisión:
                </label>
                <input
                  id="invoiceDate"
                  type="date"
                  onClick={(e) => {
                    try {
                      e.target.showPicker()
                    } catch (err) {}
                  }}
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner cursor-pointer"
                />
              </div>

              {/* Filtro por Mes */}
              <MonthFilter selectedMonth={selectedMonth} handleMonthChange={handleMonthChange} />

              {/* Barra de Filtros por Estado */}
              <div className="flex w-full items-center justify-between rounded-2xl border border-slate-200/80 bg-white/90 p-1 shadow-xs backdrop-blur">
                <button
                  type="button"
                  onClick={() => setStatusFilter("pending")}
                  className={`flex-1 rounded-xl py-2 text-center text-xs sm:text-sm font-bold transition-all ${
                    statusFilter === "pending"
                      ? "bg-amber-500 text-white shadow-xs"
                      : "text-amber-700 hover:bg-amber-50/50"
                  }`}
                >
                  ⏳ Pendientes ({loading ? "..." : pendingCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("invoiced")}
                  className={`flex-1 rounded-xl py-2 text-center text-xs sm:text-sm font-bold transition-all ${
                    statusFilter === "invoiced"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-emerald-700 hover:bg-emerald-50/50"
                  }`}
                >
                  ✅ Facturados ({loading ? "..." : invoicedCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className={`flex-1 rounded-xl py-2 text-center text-xs sm:text-sm font-bold transition-all ${
                    statusFilter === "all"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Todos ({loading ? "..." : deliveryNotes.length})
                </button>
              </div>

              {/* Cabecera de Albaranes y Selección Rápida */}
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {statusFilter === "pending"
                    ? `Albaranes Pendientes (${loading ? "..." : filteredDeliveryNotes.length})`
                    : statusFilter === "invoiced"
                    ? `Albaranes Facturados (${loading ? "..." : filteredDeliveryNotes.length})`
                    : `Todos los Albaranes (${loading ? "..." : filteredDeliveryNotes.length})`}
                </span>
                {filteredDeliveryNotes.some((d) => !d.isInvoiced) && !loading && (
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    {filteredDeliveryNotes
                      .filter((d) => !d.isInvoiced)
                      .every((d) => selectedDeliveryNotes.includes(d.id || d._id))
                      ? "Deseleccionar todos"
                      : "Seleccionar pendientes"}
                  </button>
                )}
              </div>

              {/* Lista de Albaranes para Marcar */}
              <div className="flex flex-col gap-2.5 w-full">
                {loading ? (
                  <div className="flex flex-col gap-2.5 w-full">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-full rounded-2xl bg-white/80 p-4 border border-slate-200/70 shadow-xs animate-pulse flex items-center justify-between"
                      >
                        <div className="flex flex-col gap-2 flex-1 pr-4">
                          <div className="h-4 bg-slate-200 rounded-md w-1/3"></div>
                          <div className="h-3 bg-slate-100 rounded-md w-1/4"></div>
                        </div>
                        <div className="h-5 w-16 bg-slate-200 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredDeliveryNotes.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 font-medium text-sm bg-white rounded-2xl border border-slate-200 p-6">
                    {statusFilter === "pending"
                      ? "No hay albaranes pendientes para este cliente en el periodo seleccionado."
                      : statusFilter === "invoiced"
                      ? "No hay albaranes facturados para este cliente en el periodo seleccionado."
                      : "No hay albaranes disponibles para este cliente en el periodo seleccionado."}
                  </div>
                ) : (
                  filteredDeliveryNotes.map((deliveryNote) => {
                    const dnId = deliveryNote.id || deliveryNote._id
                    const isSelected = selectedDeliveryNotes.includes(dnId)
                    const isExpanded = !!expandedNotes[dnId]
                    const isInvoiced = !!deliveryNote.isInvoiced
                    const works = deliveryNote.works || []
                    const totalAmount = works.reduce(
                      (sum, w) => sum + (Number(w.quantity) || 0) * (Number(w.price) || 0),
                      0
                    )

                    return (
                      <div
                        key={dnId}
                        onClick={() => {
                          if (isInvoiced) return
                          handleCheckboxChange(dnId)
                        }}
                        className={`w-full flex flex-col rounded-2xl border p-3.5 sm:p-4 shadow-xs transition-all text-left ${
                          isInvoiced
                            ? "border-slate-200 bg-slate-50/75 opacity-90 cursor-default"
                            : isSelected
                            ? "border-blue-500 bg-blue-50/70 shadow-sm cursor-pointer"
                            : "border-slate-200 bg-white hover:border-slate-300 cursor-pointer"
                        }`}
                      >
                        <div className="w-full flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isInvoiced}
                              onChange={() => {}} // Controlled via parent div click
                              className={`w-5 h-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0 ${
                                isInvoiced ? "cursor-not-allowed opacity-40" : "cursor-pointer"
                              }`}
                            />
                            <div className="flex flex-col min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-extrabold text-sm sm:text-base text-slate-900">
                                  A/Nº: {deliveryNote.number}
                                </span>
                                {totalAmount !== 0 && (
                                  <span className={`font-bold text-xs sm:text-sm px-2 py-0.5 rounded-md border ${totalAmount < 0 ? "text-red-700 bg-red-50 border-red-200/80" : "text-slate-700 bg-slate-100 border-slate-200/80"}`}>
                                    {totalAmount.toFixed(2)} €
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 font-medium">
                                <span>📅 <Time>{deliveryNote.date}</Time></span>
                                {works.length > 0 && (
                                  <span className="text-slate-400">
                                    · {works.length} {works.length === 1 ? "concepto" : "conceptos"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => toggleExpandNote(dnId, e)}
                              className={`flex items-center gap-1 text-[11px] sm:text-xs font-bold px-2 sm:px-2.5 py-1 rounded-xl border transition-all active:scale-95 ${
                                isExpanded
                                  ? "bg-blue-100 text-blue-800 border-blue-300"
                                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                              }`}
                              title={isExpanded ? "Ocultar conceptos" : "Ver conceptos"}
                            >
                              {isExpanded ? (
                                <>
                                  <FaEyeSlash className="text-xs text-blue-600" />
                                  <span className="hidden xs:inline sm:inline">Ocultar</span>
                                </>
                              ) : (
                                <>
                                  <FaEye className="text-xs text-blue-600" />
                                  <span>Ver</span>
                                </>
                              )}
                            </button>

                            <span
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shrink-0 ${
                                isInvoiced
                                  ? "bg-emerald-100/90 text-emerald-800 border border-emerald-200"
                                  : "bg-amber-100/90 text-amber-800 border border-amber-200"
                              }`}
                            >
                              {isInvoiced
                                ? deliveryNote.invoiceNumber
                                  ? `Fra. ${deliveryNote.invoiceNumber}`
                                  : "Facturado"
                                : "Pendiente"}
                            </span>
                          </div>
                        </div>

                        {/* Desplegable de Trabajos / Conceptos */}
                        {isExpanded && (
                          <div
                            className="mt-3 pt-3 border-t border-slate-200/80 flex flex-col gap-2 cursor-default"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                              <span>Conceptos</span>
                              <span>Importe</span>
                            </div>

                            {works.length > 0 ? (
                              <div className="flex flex-col gap-1.5 rounded-xl bg-slate-50/90 p-2.5 border border-slate-200/70">
                                {works.map((work, idx) => {
                                  const lineTotal = (Number(work.quantity) || 0) * (Number(work.price) || 0)
                                  return (
                                    <div
                                      key={work._id || work.id || idx}
                                      className="flex items-start justify-between gap-3 border-b border-slate-200/40 pb-1.5 last:border-b-0 last:pb-0"
                                    >
                                      <div className="flex flex-col text-left flex-1 min-w-0 pr-2">
                                        <span className="font-semibold text-slate-800 text-xs leading-snug">
                                          {work.concept}
                                        </span>
                                        <span className="text-[11px] text-slate-400 font-medium">
                                          {Number(work.quantity).toFixed(2)} ud. × {Number(work.price || 0).toFixed(2)} €
                                        </span>
                                      </div>
                                      <span className="font-bold text-slate-700 text-xs shrink-0 whitespace-nowrap">
                                        {lineTotal.toFixed(2)} €
                                      </span>
                                    </div>
                                  )
                                })}
                              </div>
                            ) : (
                              <div className="rounded-xl bg-slate-50 p-2.5 text-center text-xs text-slate-400 italic border border-slate-200/50">
                                Este albarán no contiene líneas de trabajo.
                              </div>
                            )}

                            {/* Subtotal del albarán */}
                            <div className="flex items-center justify-between px-1 pt-0.5">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                                Total albarán:
                              </span>
                              <span className="text-xs sm:text-sm font-black text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg">
                                {totalAmount.toFixed(2)} €
                              </span>
                            </div>

                            {deliveryNote.observations && (
                              <div className="text-[11px] text-slate-600 bg-amber-50/70 p-2 rounded-xl border border-amber-200/70 text-left mt-0.5">
                                <span className="font-bold text-amber-800">Nota: </span>
                                {deliveryNote.observations}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>

              {/* Botón de Generar Factura */}
              <button
                type="button"
                onClick={handleCreateInvoice}
                disabled={creating || selectedDeliveryNotes.length === 0}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 px-6 text-sm sm:text-base font-bold text-white shadow-md transition-all active:scale-95 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FaFileInvoiceDollar className="w-5 h-5" />
                <span>
                  {creating
                    ? "Generando Factura..."
                    : `Generar Factura (${selectedDeliveryNotes.length} albarán${selectedDeliveryNotes.length === 1 ? "" : "es"})`}
                </span>
              </button>
            </>
          )}
        </div>
      </Main>
      <Footer>FactuClient</Footer>
    </>
  )
}
