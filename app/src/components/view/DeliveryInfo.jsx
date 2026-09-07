import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { FaRegFilePdf, FaHouse, FaPlus, FaPencil, FaTrashCan, FaCheck, FaXmark, FaCommentDots } from "react-icons/fa6"
import { FaSpinner } from "react-icons/fa"

import { MdDeleteForever } from "react-icons/md"

import useContext from "../../useContext"
import { SystemError } from "com/errors"

import Header from "../Header"
import Main from "../core/Main"
import Time from "../core/Time"
import Confirm from "../Confirm"
import DeliveryNotePDF from "./DeliveryNotePDF"

import logic from "../../logic/index"

import "./DeliveryInfo.css"

export default function DeliveryInfo() {
  const { alert: showAlert } = useContext()

  const navigate = useNavigate()
  const { deliveryNoteId } = useParams()
  const [deliveryNote, setDeliveryNote] = useState(null)
  const [total, setTotal] = useState(0)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  // Estados para añadir nueva línea de trabajo
  const [showAddWorkForm, setShowAddWorkForm] = useState(false)
  const [newConcept, setNewConcept] = useState("")
  const [newQuantity, setNewQuantity] = useState("1")
  const [newPrice, setNewPrice] = useState("")
  const [savingNewWork, setSavingNewWork] = useState(false)

  // Estados para editar línea existente
  const [editingWorkId, setEditingWorkId] = useState(null)
  const [editConcept, setEditConcept] = useState("")
  const [editQuantity, setEditQuantity] = useState("")
  const [editPrice, setEditPrice] = useState("")
  const [updatingWork, setUpdatingWork] = useState(false)

  // Estados para eliminar línea de trabajo
  const [workToDelete, setWorkToDelete] = useState(null)
  const [deletingWorkId, setDeletingWorkId] = useState(null)

  // Estados para observaciones
  const [isEditingObservation, setIsEditingObservation] = useState(false)
  const [observationText, setObservationText] = useState("")
  const [savingObservation, setSavingObservation] = useState(false)

  // Estados para fecha
  const [isEditingDate, setIsEditingDate] = useState(false)
  const [editedDate, setEditedDate] = useState("")

  const recalculateTotal = (works) => {
    const calc = (works || []).reduce(
      (accumulator, work) => accumulator + (Number(work.quantity) || 0) * (Number(work.price) || 0),
      0
    )
    setTotal(calc)
  }

  useEffect(() => {
    try {
      logic
        .getDeliveryNote(deliveryNoteId)
        .then((dn) => {
          setDeliveryNote(dn)
          recalculateTotal(dn.works)
          if (dn?.date) {
            setEditedDate(new Date(dn.date).toISOString().split("T")[0])
          }
          if (dn?.observations) {
            setObservationText(dn.observations)
          }
        })
        .catch((error) => {
          showAlert(error.message)
        })
    } catch (error) {
      showAlert(error.message)
    }
  }, [deliveryNoteId])

  // --- ELIMINAR ALBARÁN COMPLETO ---
  const handleDeleteDeliveryNote = () => {
    try {
      logic
        .deleteDeliveryNote(deliveryNoteId)
        .then(() => {
          navigate(-1)
        })
        .catch((error) => {
          showAlert(error.message)
        })
    } catch (error) {
      showAlert(error.message)
    }
  }

  const handleShowConfirmDelete = () => {
    setShowConfirmDelete(!showConfirmDelete)
  }

  // --- EDITAR LÍNEA DE TRABAJO (CONCEPTO / PRECIO / CANTIDAD) ---
  const handleStartEditWork = (work) => {
    setEditingWorkId(work._id || work.id)
    setEditConcept(work.concept || "")
    setEditQuantity(String(work.quantity ?? ""))
    setEditPrice(String(work.price ?? ""))
    setShowAddWorkForm(false)
  }

  const handleCancelEditWork = () => {
    setEditingWorkId(null)
  }

  const handleUpdateWork = (event) => {
    event.preventDefault()
    const concept = editConcept.trim().replace(/\s+/g, " ")
    if (!concept) {
      showAlert("Por favor, introduce una descripción para el trabajo.")
      return
    }

    const quantity = Number(editQuantity.replace(",", "."))
    const price = Number(editPrice.replace(",", "."))

    if (isNaN(quantity) || quantity === 0) {
      showAlert("La cantidad debe ser un número distinto de 0.")
      return
    }

    if (isNaN(price)) {
      showAlert("El precio unitario debe ser un número válido.")
      return
    }

    setUpdatingWork(true)
    try {
      logic
        .updateWork(deliveryNoteId, editingWorkId, concept, quantity, price)
        .then((updatedDn) => {
          setDeliveryNote(updatedDn)
          setEditingWorkId(null)
          setUpdatingWork(false)
          recalculateTotal(updatedDn.works)
        })
        .catch((error) => {
          setUpdatingWork(false)
          showAlert(error.message)
        })
    } catch (error) {
      setUpdatingWork(false)
      showAlert(error.message)
    }
  }

  // --- BORRAR LÍNEA DE TRABAJO ---
  const handleDeleteWork = (workId) => {
    setWorkToDelete(workId)
  }

  const handleConfirmDeleteWork = () => {
    if (!workToDelete) return
    const workId = workToDelete
    setWorkToDelete(null)
    setDeletingWorkId(workId)
    try {
      logic
        .deleteWork(deliveryNoteId, workId)
        .then((updatedDn) => {
          setDeliveryNote(updatedDn)
          setDeletingWorkId(null)
          recalculateTotal(updatedDn.works)
        })
        .catch((error) => {
          setDeletingWorkId(null)
          showAlert(error.message)
        })
    } catch (error) {
      setDeletingWorkId(null)
      showAlert(error.message)
    }
  }

  // --- AÑADIR NUEVA LÍNEA DE TRABAJO ---
  const handleCreateWork = (event) => {
    event.preventDefault()
    const concept = newConcept.trim().replace(/\s+/g, " ")
    if (!concept) {
      showAlert("Por favor, introduce una descripción para el trabajo.")
      return
    }

    const quantity = Number(newQuantity.replace(",", "."))
    const price = Number(newPrice.replace(",", "."))

    if (isNaN(quantity) || quantity === 0) {
      showAlert("La cantidad debe ser un número distinto de 0.")
      return
    }

    if (isNaN(price)) {
      showAlert("El precio unitario debe ser un número válido.")
      return
    }

    setSavingNewWork(true)
    try {
      logic
        .createWork(deliveryNoteId, concept, quantity, price)
        .then((updatedDn) => {
          setDeliveryNote(updatedDn)
          recalculateTotal(updatedDn.works)
          setNewConcept("")
          setNewQuantity("1")
          setNewPrice("")
          setShowAddWorkForm(false)
          setSavingNewWork(false)
        })
        .catch((error) => {
          setSavingNewWork(false)
          showAlert(error.message)
        })
    } catch (error) {
      setSavingNewWork(false)
      showAlert(error.message)
    }
  }

  // --- EDITAR OBSERVACIONES ---
  const handleStartEditObservation = () => {
    setObservationText(deliveryNote?.observations || "")
    setIsEditingObservation(true)
  }

  const handleSaveObservation = (event) => {
    event.preventDefault()
    setSavingObservation(true)
    const cleanObservation = observationText.trim()

    try {
      logic
        .addNewObservation(deliveryNoteId, cleanObservation)
        .then((updatedDn) => {
          setDeliveryNote((prev) => ({
            ...prev,
            observations: updatedDn.observations ?? cleanObservation
          }))
          setIsEditingObservation(false)
          setSavingObservation(false)
        })
        .catch((error) => {
          setSavingObservation(false)
          showAlert(error.message)
        })
    } catch (error) {
      setSavingObservation(false)
      showAlert(error.message)
    }
  }

  // --- EDITAR FECHA ---
  const handleUpdateDeliveryNoteDate = (event) => {
    const newDate = event.target.value
    if (!newDate) return
    setEditedDate(newDate)
    setIsEditingDate(false)

    // Convertir de YYYY-MM-DD a DD/MM/YYYY para la API
    const [year, month, day] = newDate.split("-")
    const formattedDate = `${day}/${month}/${year}`

    try {
      logic
        .updateDeliveryNoteDate(deliveryNoteId, formattedDate)
        .then(() => {
          setDeliveryNote((prev) => ({
            ...prev,
            date: new Date(newDate)
          }))
        })
        .catch((error) => {
          showAlert(error.message)
        })
    } catch (error) {
      showAlert(error.message)
    }
  }

  const isEditable = logic.getInfo().role === "user" && !deliveryNote?.isInvoiced

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

          {/* Barra de Metadatos: Nº, Estado y Fecha */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-xl bg-amber-100 text-amber-950 font-black text-xs sm:text-sm px-3.5 py-1.5 border border-amber-200">
                Albarán Nº {deliveryNote?.number}
              </span>

              {/* Badge de Estado Facturado / Pendiente */}
              {deliveryNote?.isInvoiced ? (
                <span className="rounded-full bg-emerald-100/90 text-emerald-800 border border-emerald-200 px-3 py-1 text-xs font-bold tracking-wide">
                  {deliveryNote.invoiceNumber ? `Facturado (Fra. ${deliveryNote.invoiceNumber})` : "Facturado"}
                </span>
              ) : (
                <span className="rounded-full bg-amber-100/90 text-amber-800 border border-amber-200 px-3 py-1 text-xs font-bold tracking-wide uppercase">
                  Pendiente
                </span>
              )}
            </div>

            {/* Fecha con opción de edición */}
            <div className="flex items-center justify-end">
              {isEditingDate ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="date"
                    value={editedDate}
                    onChange={handleUpdateDeliveryNoteDate}
                    className="rounded-xl border border-amber-400 bg-white px-3 py-1 text-xs sm:text-sm font-bold text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsEditingDate(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    title="Cancelar"
                  >
                    <FaXmark className="w-4 h-4" />
                  </button>
                </div>
              ) : isEditable ? (
                <button
                  type="button"
                  onClick={() => setIsEditingDate(true)}
                  className="group flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-800 hover:bg-amber-50 hover:border-amber-300 transition-all active:scale-95"
                  title="Pulsar para cambiar fecha"
                >
                  <span>📅 <Time>{deliveryNote?.date}</Time></span>
                  <FaPencil className="w-3 h-3 text-slate-400 group-hover:text-amber-700 transition-colors" />
                </button>
              ) : (
                <span className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-800">
                  📅 <Time>{deliveryNote?.date}</Time>
                </span>
              )}
            </div>
          </div>

          {/* Aviso informativo si está facturado */}
          {deliveryNote?.isInvoiced && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-left flex items-start gap-2.5">
              <span className="text-base leading-none">🔒</span>
              <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                Este albarán ya ha sido incluido en la factura <strong>{deliveryNote.invoiceNumber || ""}</strong>. Para modificar conceptos, precios u observaciones, elimina primero la factura asociada.
              </p>
            </div>
          )}

          {/* Tabla de Trabajos / Conceptos */}
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 text-left">
                Líneas de Trabajo
              </span>

              {/* Botón "+ Añadir Trabajo" si es editable */}
              {isEditable && !showAddWorkForm && (
                <button
                  type="button"
                  onClick={() => {
                    setShowAddWorkForm(true)
                    setEditingWorkId(null)
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 px-2.5 py-1 rounded-xl transition-all active:scale-95"
                >
                  <FaPlus className="w-3 h-3" />
                  <span>Añadir Concepto</span>
                </button>
              )}
            </div>

            {/* Listado de trabajos */}
            <div className="flex flex-col gap-2.5">
              {deliveryNote?.works && deliveryNote.works.length > 0 ? (
                deliveryNote.works.map((work, idx) => {
                  const workId = work._id || work.id
                  const isEditingThisWork = editingWorkId === workId

                  if (isEditingThisWork) {
                    return (
                      <form
                        key={workId}
                        onSubmit={handleUpdateWork}
                        className="rounded-xl bg-amber-50/50 p-3.5 border border-amber-200 flex flex-col gap-3 text-left animate-fadeIn"
                      >
                        <span className="text-xs font-bold text-amber-900">Editar Línea de Trabajo</span>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Descripción / Concepto *
                          </label>
                          <input
                            type="text"
                            required
                            value={editConcept}
                            onChange={(e) => setEditConcept(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            autoFocus
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Cantidad *
                            </label>
                            <input
                              type="number"
                              step="any"
                              inputMode="decimal"
                              required
                              value={editQuantity}
                              onChange={(e) => setEditQuantity(e.target.value)}
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Precio Unitario (€) *
                            </label>
                            <input
                              type="number"
                              step="any"
                              inputMode="decimal"
                              required
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleCancelEditWork}
                            className="rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            disabled={updatingWork}
                            className="rounded-lg bg-amber-600 hover:bg-amber-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs active:scale-95 transition-all disabled:opacity-50"
                          >
                            {updatingWork ? "Guardando..." : "Guardar Cambios"}
                          </button>
                        </div>
                      </form>
                    )
                  }

                  return (
                    <div
                      key={workId || idx}
                      className="group flex items-start justify-between gap-3 border-b border-slate-100 pb-2.5 last:border-b-0 last:pb-0 text-xs sm:text-sm text-left"
                    >
                      <div className="flex flex-col text-left flex-1 min-w-0 pr-2">
                        <span className="font-semibold text-slate-800 leading-snug">
                          {work.concept}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium mt-0.5">
                          {Number(work.quantity || 0).toFixed(2)} ud. × {Number(work.price || 0).toFixed(2)} €
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 pt-0.5">
                        <span className="font-bold text-slate-900 whitespace-nowrap">
                          {((Number(work.quantity) || 0) * (Number(work.price) || 0)).toFixed(2)} €
                        </span>

                        {/* Botones de Acción: Editar y Eliminar */}
                        {isEditable && (
                          <div className="flex items-center gap-1 ml-1">
                            <button
                              type="button"
                              onClick={() => handleStartEditWork(work)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-700 hover:bg-amber-50 active:scale-95 transition-all"
                              title="Editar concepto o precio"
                            >
                              <FaPencil className="w-3 h-3" />
                            </button>

                            <button
                              type="button"
                              disabled={deletingWorkId === workId}
                              onClick={() => handleDeleteWork(workId)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 transition-all disabled:opacity-40"
                              title="Eliminar línea"
                            >
                              <FaTrashCan className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-400 italic">
                  Este albarán aún no contiene líneas de trabajo.
                </div>
              )}
            </div>

            {/* Formulario Inline para Añadir Línea de Trabajo */}
            {showAddWorkForm && isEditable && (
              <form
                onSubmit={handleCreateWork}
                className="mt-2 rounded-xl bg-amber-50/40 p-4 border border-amber-200 flex flex-col gap-3 text-left animate-fadeIn"
              >
                <span className="text-xs font-bold text-amber-900">Nueva Línea de Concepto</span>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Descripción / Concepto *
                  </label>
                  <input
                    type="text"
                    required
                    value={newConcept}
                    onChange={(e) => setNewConcept(e.target.value)}
                    placeholder="Ej. Mano de obra sustitución de cuadro eléctrico"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Cantidad *
                    </label>
                    <input
                      type="number"
                      step="any"
                      inputMode="decimal"
                      required
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(e.target.value)}
                      placeholder="1"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Precio Unitario (€) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      inputMode="decimal"
                      required
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddWorkForm(false)
                      setNewConcept("")
                      setNewQuantity("1")
                      setNewPrice("")
                    }}
                    className="rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingNewWork}
                    className="rounded-lg bg-amber-600 hover:bg-amber-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs active:scale-95 transition-all disabled:opacity-50"
                  >
                    {savingNewWork ? "Guardando..." : "Añadir Línea"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Sección de Observaciones */}
          <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Observaciones
              </span>

              {isEditable && !isEditingObservation && (
                <button
                  type="button"
                  onClick={handleStartEditObservation}
                  className="flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 px-2 py-0.5 rounded-lg hover:bg-amber-50 transition-all"
                  title="Editar observaciones"
                >
                  <FaPencil className="w-3 h-3" />
                  <span>{deliveryNote?.observations ? "Modificar" : "Añadir Nota"}</span>
                </button>
              )}
            </div>

            {isEditingObservation ? (
              <form onSubmit={handleSaveObservation} className="flex flex-col gap-2.5 mt-1">
                <textarea
                  rows={3}
                  value={observationText}
                  onChange={(e) => setObservationText(e.target.value)}
                  placeholder="Introduce cualquier observación o comentario sobre el albarán..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  autoFocus
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingObservation(false)}
                    className="rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingObservation}
                    className="rounded-lg bg-amber-600 hover:bg-amber-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs active:scale-95 transition-all disabled:opacity-50"
                  >
                    {savingObservation ? "Guardando..." : "Guardar Observación"}
                  </button>
                </div>
              </form>
            ) : deliveryNote?.observations ? (
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/60 mt-1">
                <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                  {deliveryNote.observations}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic mt-1">
                Sin observaciones adicionales.
              </p>
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

          {/* Botones de navegación */}
          {deliveryNote && (
            <div className="flex w-full gap-3">
              <Link
                to="/"
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-slate-300 bg-white py-3 px-4 text-sm font-bold text-slate-700 shadow-xs transition-all active:scale-95 hover:bg-slate-50 hover:border-slate-400"
              >
                <FaHouse className="text-base text-slate-500" />
                <span>Inicio</span>
              </Link>
              <Link
                to={`/create/delivery-notes/${deliveryNote.customer?._id || deliveryNote.customer?.id}`}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-amber-400 bg-amber-50 py-3 px-4 text-sm font-bold text-amber-800 shadow-xs transition-all active:scale-95 hover:bg-amber-100 hover:border-amber-500"
              >
                <FaPlus className="text-base" />
                <span>Crear Otro Albarán</span>
              </Link>
            </div>
          )}

          {/* Modal para Confirmar Eliminación del Albarán Completo */}
          {showConfirmDelete && (
            <Confirm
              handleDeleteDeliveryNote={handleDeleteDeliveryNote}
              setShowConfirmDelete={handleShowConfirmDelete}
            />
          )}

          {/* Modal para Confirmar Eliminación de una Línea de Trabajo */}
          {workToDelete && (
            <Confirm
              handleDeleteDeliveryNote={handleConfirmDeleteWork}
              setShowConfirmDelete={() => setWorkToDelete(null)}
            />
          )}
        </div>
      </Main>
    </>
  )
}
