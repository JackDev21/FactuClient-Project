import { useParams } from "react-router-dom"
import { useEffect, useState, Fragment } from "react"
import { useNavigate } from "react-router-dom"

import { PDFDownloadLink } from "@react-pdf/renderer"
import { FaRegFilePdf, FaPencil } from "react-icons/fa6"
import { FaSpinner } from "react-icons/fa"

import { MdDeleteForever } from "react-icons/md"

import Header from "../../components/Header"
import Main from "../../components/core/Main"
import Title from "../../components/Title"
import Confirm from "../../components/Confirm"
import InvoicePDF from "../../components/pdf/InvoicePDF"

import logic from "../../logic/index"

import "./InvoiceInfo.css"
import Time from "../../components/core/Time"

export default function InvoiceInfo() {
  const navigate = useNavigate()

  const { invoiceId } = useParams()
  const [invoice, setInvoice] = useState(null)
  const [isEditingPaymentType, setIsEditingPaymentType] = useState(false)
  const [editedPaymentType, setEditedPaymentType] = useState("")
  const [total, setTotal] = useState(0)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [iva, setIva] = useState(0)
  const [isEditingDate, setIsEditingDate] = useState(false)
  const [editedDate, setEditedDate] = useState("")

  useEffect(() => {
    if (invoice?.date) {
      setEditedDate(new Date(invoice.date).toISOString().split("T")[0])
    }
  }, [invoice])

  useEffect(() => {
    try {
      //prettier-ignore
      logic.getInvoice(invoiceId)
        .then((invoice) => {
          setInvoice(invoice)

          const calculateTotal = invoice.deliveryNotes.reduce((accumulator, deliveryNote) => {
            return accumulator + deliveryNote.works.reduce((acc, work) => acc + work.quantity * work.price, 0)
          }, 0)

          setTotal(calculateTotal)
          setIva(calculateTotal * 0.21) 
        })
        .catch((error) => {
          alert(error.message)
        })
    } catch (error) {
      alert(error.message)
    }
  }, [invoiceId])

  const handleDeleteInvoice = () => {
    try {
      //prettier-ignore
      logic.deleteInvoice(invoiceId)
        .then(() => {
          navigate(-1)
        })
        .catch((error) => {
          alert(error.message)
        })
    } catch (error) {
      alert(error.message)
    }
  }

  const handleShowConfirmDelete = () => {
    setShowConfirmDelete(!showConfirmDelete)
  }

  const irpfPercentage = invoice?.company.irpf || 0 // Porcentaje de IRPF del perfil del usuario
  const irpfAmount = total * (irpfPercentage / 100) // Cálculo del IRPF

  return (
    <>
      <Header
        iconLeftHeader={logic.getInfo().role === "user" && <MdDeleteForever className="text-rose-900 shrink-0" />}
        onDeleteInvoice={handleShowConfirmDelete}
      >
        <div className="flex flex-col items-center justify-center max-w-[62vw] sm:max-w-md">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-950/25 border border-slate-950/20 text-slate-950 text-[10px] sm:text-xs font-black uppercase tracking-wider mb-0.5 shadow-2xs">
            Factura Nº {invoice?.number || ""}
          </span>
          <h1 className="text-xs sm:text-base font-black text-slate-950 tracking-tight leading-tight truncate max-w-full">
            {invoice?.customer?.companyName || "Detalle de Factura"}
          </h1>
        </div>
      </Header>

      <Main className="MainInvoiceInfo">
        <div className="w-full max-w-2xl flex flex-col gap-4 px-2 sm:px-4 py-2">
          {/* Tarjeta de Datos Emisor y Cliente */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
            {/* Datos Empresa */}
            <div className="flex flex-col text-left gap-1 border-b sm:border-b-0 sm:border-r border-slate-100 pb-3 sm:pb-0 sm:pr-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Emisor
              </span>
              {invoice?.company ? (
                <>
                  <span className="text-sm font-extrabold text-slate-900">
                    {invoice.company.companyName}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">
                    CIF/NIF: {invoice.company.taxId}
                  </span>
                  <span className="text-xs text-slate-600">{invoice.company.address}</span>
                  <span className="text-xs text-slate-500">{invoice.company.email}</span>
                  {invoice.company.phone && (
                    <span className="text-xs text-slate-500">Tel: {invoice.company.phone}</span>
                  )}
                </>
              ) : (
                <span className="text-xs text-slate-400">Sin datos de emisor</span>
              )}
            </div>

            {/* Datos Cliente */}
            <div className="flex flex-col text-left gap-1 sm:pl-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Cliente
              </span>
              {invoice?.customer ? (
                <>
                  <span className="text-sm font-extrabold text-slate-900">
                    {invoice.customer.companyName}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">
                    CIF/NIF: {invoice.customer.taxId}
                  </span>
                  <span className="text-xs text-slate-600">{invoice.customer.address}</span>
                  <span className="text-xs text-slate-500">{invoice.customer.email}</span>
                  {invoice.customer.phone && (
                    <span className="text-xs text-slate-500">Tel: {invoice.customer.phone}</span>
                  )}
                </>
              ) : (
                <span className="text-xs text-slate-400">Sin datos de cliente</span>
              )}
            </div>
          </div>

          {/* Barra de Metadatos: F/Nº, Fecha y Forma de Pago */}
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-xs">
            {/* Fila 1: Fra Nº y Fecha */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-xl bg-orange-100 text-orange-800 font-extrabold text-xs sm:text-sm px-3 py-1.5 border border-orange-200">
                  Fra. Nº {invoice?.number}
                </span>
                {/* En móvil mostramos la fecha a la derecha si no se está editando */}
                {!isEditingDate && (
                  <div className="flex items-center sm:hidden">
                    {logic.getInfo().role === "user" ? (
                      <button
                        type="button"
                        onClick={() => setIsEditingDate(true)}
                        className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 px-2.5 py-1 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 active:scale-95 transition-all cursor-pointer group shadow-2xs"
                        title="Pulsar para editar fecha"
                        aria-label="Editar fecha"
                      >
                        <span>📅 <Time>{invoice?.date}</Time></span>
                        <span className="flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-100/70 border border-blue-300/80 px-2 py-0.5 rounded-lg group-hover:bg-blue-200 transition-colors">
                          <FaPencil className="w-3.5 h-3.5" />
                          <span>Cambiar</span>
                        </span>
                      </button>
                    ) : (
                      <span className="bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg text-xs sm:text-sm font-semibold text-slate-700">
                        📅 <Time>{invoice?.date}</Time>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Fecha (Editor o Vista Escritorio) */}
              <div>
                {isEditingDate ? (
                  <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2">
                    <input
                      type="date"
                      ref={(el) => {
                        if (el) {
                          try {
                            el.showPicker()
                          } catch (err) {}
                        }
                      }}
                      autoFocus
                      onClick={(e) => {
                        try {
                          e.target.showPicker()
                        } catch (err) {}
                      }}
                      value={editedDate}
                      onChange={(e) => setEditedDate(e.target.value)}
                      className="flex-1 sm:flex-initial rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner cursor-pointer"
                    />
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          logic
                            .updateInvoiceDate(invoiceId, editedDate)
                            .then((updated) => {
                              setInvoice((prev) => ({ ...prev, date: updated.date }))
                              setIsEditingDate(false)
                            })
                            .catch((error) => alert(error.message))
                        }}
                        className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition-all"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setIsEditingDate(false)}
                        className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200 active:scale-95 transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="hidden sm:flex items-center justify-end">
                    {logic.getInfo().role === "user" ? (
                      <button
                        type="button"
                        onClick={() => setIsEditingDate(true)}
                        className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 px-2.5 py-1 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 active:scale-95 transition-all cursor-pointer group shadow-2xs"
                        title="Pulsar para editar fecha"
                        aria-label="Editar fecha"
                      >
                        <span>📅 <Time>{invoice?.date}</Time></span>
                        <span className="flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-100/70 border border-blue-300/80 px-2 py-0.5 rounded-lg group-hover:bg-blue-200 transition-colors">
                          <FaPencil className="w-3.5 h-3.5" />
                          <span>Cambiar</span>
                        </span>
                      </button>
                    ) : (
                      <span className="bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg text-xs sm:text-sm font-semibold text-slate-700">
                        📅 <Time>{invoice?.date}</Time>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Fila 2: Forma de Pago */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-slate-700">
              <span className="font-semibold text-slate-500 text-left">Forma de pago:</span>
              {isEditingPaymentType ? (
                <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2">
                  {/* Selector Segmentado Moderno sin popups */}
                  <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200 shadow-inner">
                    <button
                      type="button"
                      onClick={() => setEditedPaymentType("Transferencia")}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                        editedPaymentType === "Transferencia"
                          ? "bg-white text-blue-600 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Transferencia
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditedPaymentType("Efectivo")}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                        editedPaymentType === "Efectivo"
                          ? "bg-white text-blue-600 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Efectivo
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        logic
                          .updateInvoicePaymentType(invoiceId, editedPaymentType)
                          .then((updated) => {
                            setInvoice((prev) => ({ ...prev, paymentType: updated.paymentType }))
                            setIsEditingPaymentType(false)
                          })
                          .catch((error) => alert(error.message))
                      }}
                      className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition-all"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setIsEditingPaymentType(false)}
                      className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200 active:scale-95 transition-all"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between sm:justify-end">
                  {logic.getInfo().role === "user" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingPaymentType(true)
                        setEditedPaymentType(invoice?.paymentType || "Transferencia")
                      }}
                      className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 px-2.5 py-1 rounded-xl text-xs sm:text-sm font-bold text-slate-800 hover:text-blue-600 active:scale-95 transition-all cursor-pointer group shadow-2xs"
                      title="Pulsar para editar forma de pago"
                      aria-label="Editar forma de pago"
                    >
                      <span>{invoice?.paymentType || "Transferencia"}</span>
                      <span className="flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-100/70 border border-blue-300/80 px-2 py-0.5 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <FaPencil className="w-3.5 h-3.5" />
                        <span>Cambiar</span>
                      </span>
                    </button>
                  ) : (
                    <span className="bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg text-xs sm:text-sm font-bold text-slate-800">
                      {invoice?.paymentType || "Transferencia"}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tabla de Trabajos / Albaranes */}
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 text-left">
              Desglose de Conceptos
            </span>

            {invoice?.deliveryNotes?.map((deliveryNote, idx) => (
              <div key={deliveryNote.id || idx} className="flex flex-col gap-2.5 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                {/* Cabecera del Albarán asociado */}
                <div className="flex items-center justify-between rounded-xl bg-amber-50/90 px-3.5 py-2 border border-amber-200/80">
                  <span className="text-xs sm:text-sm font-black text-amber-950">
                    A/Nº {deliveryNote.number}
                  </span>
                  <span className="rounded-lg bg-white px-2.5 py-1 text-xs sm:text-sm font-bold text-slate-800 border border-amber-200 shadow-xs">
                    📅 <Time>{deliveryNote.date}</Time>
                  </span>
                </div>

                {/* Líneas de trabajo del albarán */}
                <div className="flex flex-col gap-2 pl-1">
                  {deliveryNote.works.map((work) => (
                    <div key={work.id || work._id} className="flex items-start justify-between gap-3 text-xs sm:text-sm">
                      <div className="flex flex-col text-left flex-1">
                        <span className="font-semibold text-slate-800 leading-snug">
                          {work.concept}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {work.quantity.toFixed(2)} ud. × {work.price.toFixed(2)} €
                        </span>
                      </div>
                      <span className="font-bold text-slate-900 whitespace-nowrap pt-0.5">
                        {(work.quantity * work.price).toFixed(2)} €
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Tarjeta de Resumen de Totales */}
          <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs text-sm">
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-medium">Base Imponible:</span>
              <span className="font-bold text-slate-800">{total.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-medium">IVA (21%):</span>
              <span className="font-bold text-slate-800">+{iva.toFixed(2)} €</span>
            </div>
            {irpfAmount > 0 && (
              <div className="flex justify-between items-center text-amber-700">
                <span className="font-medium">IRPF ({irpfPercentage}%):</span>
                <span className="font-bold">-{irpfAmount.toFixed(2)} €</span>
              </div>
            )}
            <div className="flex justify-between items-center border-t border-slate-200 pt-3 mt-1 text-base sm:text-lg font-black text-slate-900">
              <span>TOTAL CON IVA:</span>
              <span className="text-lg sm:text-xl text-orange-600">
                {(total + iva - irpfAmount).toFixed(2)} €
              </span>
            </div>
          </div>

          {/* Botón de Descarga PDF */}
          {invoice && (
            <PDFDownloadLink
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-orange-500 py-3.5 px-6 text-base font-bold text-white shadow-md transition-all active:scale-95 hover:bg-orange-600 hover:shadow-lg"
              document={
                <InvoicePDF
                  invoice={invoice}
                  total={total}
                  iva={iva}
                  irpfAmount={irpfAmount}
                  irpfPercentage={irpfPercentage}
                />
              }
              fileName={`Factura-${invoice.number}.pdf`}
            >
              {({ loading }) =>
                loading ? (
                  <>
                    <FaSpinner className="animate-spin text-lg" />
                    <span>Generando PDF...</span>
                  </>
                ) : (
                  <>
                    <FaRegFilePdf className="text-lg" />
                    <span>Descargar Factura en PDF</span>
                  </>
                )
              }
            </PDFDownloadLink>
          )}

          {showConfirmDelete && (
            <Confirm handleDeleteInvoice={handleDeleteInvoice} setShowConfirmDelete={handleShowConfirmDelete} />
          )}
        </div>
      </Main>
    </>
  )
}
