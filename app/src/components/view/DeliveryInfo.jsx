import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { FaRegFilePdf } from "react-icons/fa6"
import { FaSpinner } from "react-icons/fa"

import { GiStabbedNote } from "react-icons/gi"
import { MdDeleteForever } from "react-icons/md"

import useContext from "../../useContext"
import { SystemError } from "com/errors"

import Header from "../Header"
import Main from "../core/Main"
import Time from "../core/Time"
import Footer from "../core/Footer"
import Confirm from "../Confirm"
import DeliveryNotePDF from "./DeliveryNotePDF"

import logic from "../../logic/index"

import "./DeliveryInfo.css"

export default function DeliveryInfo() {
  const { alert } = useContext()

  const navigate = useNavigate()
  const { deliveryNoteId } = useParams()
  const [deliveryNote, setDeliveryNote] = useState(null)
  const [total, setTotal] = useState(0)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  useEffect(() => {
    try {
      //prettier-ignore
      logic
        .getDeliveryNote(deliveryNoteId)
        .then((deliveryNote) => {
          setDeliveryNote(deliveryNote)

          const calculateTotal = deliveryNote.works.reduce(
            (accumulator, work) => accumulator + work.quantity * work.price, 0)
          setTotal(calculateTotal)
        })
        .catch((error) => {
          if (error instanceof SystemError) {
            alert(error.message)
          }
        })
    } catch (error) {
      alert(error.message)
    }
  }, [deliveryNoteId])

  const handleDeleteDeliveryNote = () => {
    try {
      //prettier-ignore
      logic
        .deleteDeliveryNote(deliveryNoteId)
        .then(() => {
          navigate(-1)
        })
        .catch((error) => {
          if (error instanceof SystemError) {
            alert(error.message)
          }
        })
    } catch (error) {
      alert(error.message)
    }
  }

  const handleShowConfirmDelete = () => {
    setShowConfirmDelete(!showConfirmDelete)
  }

  return (
    <>
      <Header
        iconLeftHeader={logic.getInfo().role === "user" && <MdDeleteForever />}
        onDeleteDeliveryNote={handleShowConfirmDelete}
      >
        <div className="flex flex-col items-center justify-center">
          <span className="text-xs font-semibold text-slate-800">
            Albarán Nº {deliveryNote?.number || ""}
          </span>
          <span className="text-sm sm:text-base font-extrabold text-slate-900 truncate max-w-[60vw]">
            {deliveryNote?.customer?.companyName || deliveryNote?.customerName || "Detalle de Albarán"}
          </span>
        </div>
      </Header>

      <Main className="MainDeliveryInfo">
        <div className="w-full max-w-2xl flex flex-col gap-4 px-2 sm:px-4 py-2">
          {/* Tarjeta de Datos Cliente */}
          <div className="flex flex-col text-left gap-1 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Datos del Cliente
            </span>
            {deliveryNote?.customer ? (
              <>
                <span className="text-sm font-extrabold text-slate-900">
                  {deliveryNote.customer.companyName}
                </span>
                <span className="text-xs text-slate-600 font-medium">
                  CIF/NIF: {deliveryNote.customer.taxId}
                </span>
                <span className="text-xs text-slate-600">{deliveryNote.customer.address}</span>
              </>
            ) : (
              <span className="text-xs text-slate-400">Sin datos de cliente</span>
            )}
          </div>

          {/* Barra de Metadatos: A/Nº y Fecha */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-xs">
            <span className="rounded-xl bg-amber-100 text-amber-950 font-black text-xs sm:text-sm px-3.5 py-1.5 border border-amber-200">
              Albarán Nº {deliveryNote?.number}
            </span>
            <span className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-800">
              📅 <Time>{deliveryNote?.date}</Time>
            </span>
          </div>

          {/* Tabla de Trabajos */}
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 text-left">
              Líneas de Trabajo
            </span>

            <div className="flex flex-col gap-2.5">
              {deliveryNote?.works &&
                deliveryNote.works.map((work) => (
                  <div key={work._id || work.id} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2.5 last:border-b-0 last:pb-0 text-xs sm:text-sm">
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

            {deliveryNote?.observations && (
              <div className="mt-2 rounded-xl bg-slate-50 p-3 text-left border border-slate-200/60">
                <span className="text-xs font-bold text-slate-700">Observaciones:</span>
                <p className="text-xs text-slate-600 mt-0.5">{deliveryNote.observations}</p>
              </div>
            )}
          </div>

          {/* Tarjeta de Resumen de Totales */}
          <div className="flex justify-between items-center rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs text-base sm:text-lg font-black text-slate-900">
            <span>TOTAL ALBARÁN:</span>
            <span className="text-lg sm:text-xl text-amber-600">
              {total.toFixed(2)} €
            </span>
          </div>

          {/* Botón de Descarga PDF */}
          {deliveryNote && (
            <PDFDownloadLink
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-orange-500 py-3.5 px-6 text-base font-bold text-white shadow-md transition-all active:scale-95 hover:bg-orange-600 hover:shadow-lg"
              document={<DeliveryNotePDF deliveryNote={deliveryNote} total={total} />}
              fileName={`Albaran-${deliveryNote.number}.pdf`}
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
                    <span>Descargar Albarán en PDF</span>
                  </>
                )
              }
            </PDFDownloadLink>
          )}

          {showConfirmDelete && (
            <Confirm handleDeleteDeliveryNote={handleDeleteDeliveryNote} setShowConfirmDelete={handleShowConfirmDelete} />
          )}
        </div>
      </Main>
    </>
  )
}
