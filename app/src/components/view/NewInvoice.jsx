import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FaChevronRight, FaFileInvoiceDollar, FaReceipt, FaCheck, FaRotateLeft } from "react-icons/fa6"

import useContext from "../../useContext"
import { SystemError } from "com/errors"

import Header from "../Header"
import Main from "../core/Main"
import Footer from "../core/Footer"
import Time from "../core/Time"
import MonthFilter from "../MonthFilter"
import SearchFilter from "../SearchFilter"

import logic from "../../logic/index"

export default function NewInvoice() {
  const { alert } = useContext()
  const navigate = useNavigate()

  const [customers, setCustomers] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showCustomerList, setShowCustomerList] = useState(true)
  const [deliveryNotes, setDeliveryNotes] = useState([])
  const [selectedDeliveryNotes, setSelectedDeliveryNotes] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")
  const today = new Date().toISOString().split("T")[0]
  const [invoiceDate, setInvoiceDate] = useState(today)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

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
    setSelectedCustomer(customer)
    setLoading(true)
    try {
      //prettier-ignore
      logic
        .getAllDeliveryNotesCustomer(customer.id || customer._id)
        .then((customerDeliveryNotes) => {
          setDeliveryNotes(customerDeliveryNotes || [])
          setShowCustomerList(false)
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
  }

  const handleCheckboxChange = (deliveryNoteId) => {
    setSelectedDeliveryNotes((prevSelected) => {
      if (prevSelected.includes(deliveryNoteId)) {
        return prevSelected.filter((id) => id !== deliveryNoteId)
      } else {
        return [...prevSelected, deliveryNoteId]
      }
    })
  }

  const handleSelectAll = () => {
    const pendingNotes = filteredDeliveryNotes.filter((d) => !d.isInvoiced).map((d) => d.id || d._id)
    if (selectedDeliveryNotes.length === pendingNotes.length) {
      setSelectedDeliveryNotes([])
    } else {
      setSelectedDeliveryNotes(pendingNotes)
    }
  }

  const handleCreateInvoice = () => {
    if (selectedDeliveryNotes.length === 0) {
      alert("Por favor, selecciona al menos un albarán para facturar.")
      return
    }

    setCreating(true)
    try {
      //prettier-ignore
      logic
        .createInvoice(selectedCustomer.id || selectedCustomer._id, selectedDeliveryNotes, invoiceDate)
        .then(() => {
          setCreating(false)
          alert("Factura creada correctamente")
          navigate("/invoices")
        })
        .catch((error) => {
          setCreating(false)
          if (error instanceof SystemError) {
            alert(error.message)
          } else {
            alert(error.message)
          }
        })
    } catch (error) {
      setCreating(false)
      alert(error.message)
    }
  }

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value)
  }

  const filteredDeliveryNotes = deliveryNotes.filter((deliveryNote) => {
    if (!selectedMonth) return true
    const noteMonth = new Date(deliveryNote.date).getMonth() + 1
    return noteMonth === parseInt(selectedMonth, 10)
  })

  return (
    <>
      <Header>
        <h1>Crear Factura</h1>
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
                  <div className="py-12 text-center text-slate-400 font-medium text-sm">
                    Cargando clientes...
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
              {/* Tarjeta de Cliente Seleccionado */}
              <div className="w-full flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs text-left">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 font-black text-base flex items-center justify-center shrink-0">
                    {selectedCustomer?.companyName ? selectedCustomer.companyName.charAt(0).toUpperCase() : "C"}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Cliente Seleccionado
                    </span>
                    <span className="text-sm font-black text-slate-900 leading-tight truncate">
                      {selectedCustomer?.companyName}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomerList(true)
                    setSelectedDeliveryNotes([])
                  }}
                  className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold active:scale-95 transition-all shrink-0 ml-2"
                >
                  <FaRotateLeft className="w-3 h-3" />
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

              {/* Cabecera de Albaranes y Selección Rápida */}
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Albaranes Disponibles ({filteredDeliveryNotes.length})
                </span>
                {filteredDeliveryNotes.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    {selectedDeliveryNotes.length > 0 ? "Deseleccionar todos" : "Seleccionar pendientes"}
                  </button>
                )}
              </div>

              {/* Lista de Albaranes para Marcar */}
              <div className="flex flex-col gap-2.5 w-full">
                {filteredDeliveryNotes.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 font-medium text-sm bg-white rounded-2xl border border-slate-200 p-6">
                    No hay albaranes disponibles para este cliente en el periodo seleccionado.
                  </div>
                ) : (
                  filteredDeliveryNotes.map((deliveryNote) => {
                    const isSelected = selectedDeliveryNotes.includes(deliveryNote.id || deliveryNote._id)
                    return (
                      <div
                        key={deliveryNote.id || deliveryNote._id}
                        onClick={() => handleCheckboxChange(deliveryNote.id || deliveryNote._id)}
                        className={`w-full flex items-center justify-between rounded-2xl border p-4 shadow-xs transition-all cursor-pointer text-left ${
                          isSelected
                            ? "border-blue-500 bg-blue-50/70 shadow-sm"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // Controlled via parent div click
                            className="w-5 h-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                          />
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="font-extrabold text-sm text-slate-900">
                              A/Nº {deliveryNote.number}
                            </span>
                            <span className="text-xs text-slate-500 mt-0.5 font-medium">
                              📅 <Time>{deliveryNote.date}</Time>
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                            deliveryNote.isInvoiced
                              ? "bg-slate-100 text-slate-600 border border-slate-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {deliveryNote.isInvoiced ? "Ya Facturado" : "Pendiente"}
                        </span>
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
