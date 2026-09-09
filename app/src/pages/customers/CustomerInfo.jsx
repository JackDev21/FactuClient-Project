import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"

import { RiFileUserLine } from "react-icons/ri"
import { GiExitDoor } from "react-icons/gi"
import { FaChevronRight, FaFileInvoiceDollar, FaReceipt, FaBuilding, FaIdCard, FaLocationDot, FaPhone, FaEnvelope, FaUser } from "react-icons/fa6"

import useContext from "../../useContext"
import { SystemError } from "com/errors"

import Header from "../../components/Header"
import Main from "../../components/core/Main"
import Footer from "../../components/core/Footer"

import logic from "../../logic/index"

export default function CustomerInfo() {
  const { alert } = useContext()
  const navigate = useNavigate()

  const { customerId } = useParams()
  const [customer, setCustomer] = useState(null)
  const [deliveryNotes, setDeliveryNotes] = useState([])
  const [invoices, setInvoices] = useState([])
  const [activeTab, setActiveTab] = useState("Data")
  const [loadingDocs, setLoadingDocs] = useState(false)

  const handleLogout = () => {
    logic.logoutUser()
    navigate("/login")
  }

  useEffect(() => {
    try {
      //prettier-ignore
      logic.getProfileUser(customerId)
        .then((customer) => { 
          setCustomer(customer) 
        })
        .catch((error) => {
          alert(error.message)
        })
    } catch (error) {
      alert(error.message)
    }
  }, [customerId])

  const loadInvoices = () => {
    setActiveTab("Invoices")
    setLoadingDocs(true)
    try {
      //prettier-ignore
      logic.getAllInvoicesCustomer(customerId)
        .then((invoices) => {
          setInvoices(invoices || [])
          setLoadingDocs(false)
        })
        .catch((error) => {
          setLoadingDocs(false)
          if (error instanceof SystemError) {
            alert(error.message)
          } else {
            setInvoices([])
          }
        })
    } catch (error) {
      setLoadingDocs(false)
      alert(error.message)
    }
  }

  const loadDeliveryNotes = () => {
    setActiveTab("DeliveryNotes")
    setLoadingDocs(true)
    try {
      //prettier-ignore
      logic.getAllDeliveryNotesCustomer(customerId)
        .then((deliveryNotes) => {
          setDeliveryNotes(deliveryNotes || [])
          setLoadingDocs(false)
        })
        .catch((error) => {
          setLoadingDocs(false)
          if (error instanceof SystemError) {
            alert(error.message)
          } else {
            setDeliveryNotes([])
          }
        })
    } catch (error) {
      setLoadingDocs(false)
      alert(error.message)
    }
  }

  return (
    <>
      <Header
        iconLeftHeader={<GiExitDoor />}
        showBackButton={false}
        onLogout={handleLogout}
        iconUser={<RiFileUserLine />}
      >
        {customer?.companyName || "Portal Cliente"}
      </Header>

      <Main className="CustomerProfile Info">
        <div className="w-full max-w-xl sm:max-w-2xl mx-auto flex flex-col gap-3.5 sm:gap-4 px-3 sm:px-4">
          {/* Navegación por Pestañas Segmentadas */}
          <div className="w-full inline-flex rounded-2xl bg-slate-200/70 p-1 border border-slate-200 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab("Data")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                activeTab === "Data"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>👤</span>
              <span>Mis Datos</span>
            </button>
            <button
              type="button"
              onClick={loadInvoices}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                activeTab === "Invoices"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>📑</span>
              <span>Mis Facturas</span>
            </button>
            <button
              type="button"
              onClick={loadDeliveryNotes}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                activeTab === "DeliveryNotes"
                  ? "bg-white text-amber-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>📋</span>
              <span>Mis Albaranes</span>
            </button>
          </div>

          {/* Pestaña: DATOS DEL CLIENTE */}
          {activeTab === "Data" && (
            <>
              {/* Tarjeta de Identidad */}
              <div className="w-full flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs text-left">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-black text-2xl flex items-center justify-center shadow-sm shrink-0">
                  {customer?.companyName ? customer.companyName.charAt(0).toUpperCase() : "C"}
                </div>
                <div className="flex flex-col min-w-0">
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-tight truncate">
                    {customer?.companyName || "Mi Empresa"}
                  </h1>
                  <span className="text-xs font-semibold text-slate-500 mt-0.5">
                    {customer?.fullName || `@${customer?.username}`}
                  </span>
                </div>
              </div>

              {/* Tarjeta de Datos Fiscales */}
              <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 text-left">
                  Datos Fiscales
                </span>

                <div className="flex flex-col gap-2.5 text-xs sm:text-sm text-left">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="font-semibold text-slate-500">🏢 Empresa:</span>
                    <span className="font-bold text-slate-900 text-right">{customer?.companyName || "No especificado"}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="font-semibold text-slate-500">🆔 CIF / NIF:</span>
                    <span className="font-bold text-slate-900 text-right">{customer?.taxId || "No especificado"}</span>
                  </div>
                  <div className="flex justify-between items-start pt-0.5">
                    <span className="font-semibold text-slate-500 shrink-0">📍 Dirección Fiscal:</span>
                    <span className="font-bold text-slate-900 text-right ml-2">{customer?.address || "No especificada"}</span>
                  </div>
                </div>
              </div>

              {/* Tarjeta de Contacto */}
              <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 text-left">
                  Contacto y Cuenta
                </span>

                <div className="flex flex-col gap-2.5 text-xs sm:text-sm text-left">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="font-semibold text-slate-500">👤 Contacto:</span>
                    <span className="font-bold text-slate-900 text-right">{customer?.fullName || "No especificado"}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="font-semibold text-slate-500">📞 Teléfono:</span>
                    <span className="font-bold text-slate-900 text-right">{customer?.phone || "No especificado"}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="font-semibold text-slate-500">✉️ Email:</span>
                    <span className="font-bold text-slate-900 text-right truncate max-w-[180px] sm:max-w-xs">{customer?.email || "No especificado"}</span>
                  </div>
                  <div className="flex justify-between items-center pt-0.5">
                    <span className="font-semibold text-slate-500">🔑 Usuario:</span>
                    <span className="font-bold font-mono text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                      @{customer?.username || "cliente"}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Pestaña: FACTURAS */}
          {activeTab === "Invoices" && (
            <div className="w-full flex flex-col gap-2.5">
              {loadingDocs ? (
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
                      <div className="h-4 w-4 bg-slate-200 rounded-full"></div>
                    </div>
                  ))}
                </div>
              ) : invoices.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-medium text-sm bg-white rounded-2xl border border-slate-200 p-6">
                  No tienes facturas disponibles.
                </div>
              ) : (
                invoices.map((invoice) => (
                  <Link
                    to={`/invoices/${invoice.id || invoice._id}`}
                    key={invoice.id || invoice._id}
                    className="w-full flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition-all hover:shadow-md hover:border-blue-300 active:scale-98 text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                        <FaFileInvoiceDollar className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-extrabold text-sm text-slate-900">
                          Fra. Nº {invoice.number}
                        </span>
                        <span className="text-xs text-slate-400 mt-0.5">
                          {invoice.date ? new Date(invoice.date).toLocaleDateString("es-ES") : "Sin fecha"}
                        </span>
                      </div>
                    </div>
                    <FaChevronRight className="text-slate-300 text-sm shrink-0 ml-2" />
                  </Link>
                ))
              )}
            </div>
          )}

          {/* Pestaña: ALBARANES */}
          {activeTab === "DeliveryNotes" && (
            <div className="w-full flex flex-col gap-2.5">
              {loadingDocs ? (
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
                      <div className="h-4 w-4 bg-slate-200 rounded-full"></div>
                    </div>
                  ))}
                </div>
              ) : deliveryNotes.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-medium text-sm bg-white rounded-2xl border border-slate-200 p-6">
                  No tienes albaranes disponibles.
                </div>
              ) : (
                deliveryNotes.map((deliveryNote) => (
                  <Link
                    to={`/delivery-notes/${deliveryNote.id || deliveryNote._id}`}
                    key={deliveryNote.id || deliveryNote._id}
                    className="w-full flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition-all hover:shadow-md hover:border-amber-300 active:scale-98 text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                        <FaReceipt className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-extrabold text-sm text-slate-900">
                          A/Nº {deliveryNote.number}
                        </span>
                        <span className="text-xs text-slate-400 mt-0.5">
                          {deliveryNote.date ? new Date(deliveryNote.date).toLocaleDateString("es-ES") : "Sin fecha"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        deliveryNote.isInvoiced ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-orange-50 text-orange-700 border border-orange-200"
                      }`}>
                        {deliveryNote.isInvoiced ? (deliveryNote.invoiceNumber ? `Fra. ${deliveryNote.invoiceNumber}` : "Facturado") : "Pendiente"}
                      </span>
                      <FaChevronRight className="text-slate-300 text-sm" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      </Main>

      <Footer>FactuClient</Footer>
    </>
  )
}
