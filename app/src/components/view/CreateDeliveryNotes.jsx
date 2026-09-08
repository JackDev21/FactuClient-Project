import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { FaPlus, FaCheck, FaXmark, FaPencil, FaTrashCan, FaCommentDots, FaArrowRight } from "react-icons/fa6"

import logic from "../../logic/index"
import useContext from "../../useContext"
import Header from "../Header"
import Main from "../core/Main"
import Footer from "../core/Footer"
import Time from "../core/Time"
import Confirm from "../Confirm"

export default function CreateDeliveryNotes() {
  const { customerId } = useParams()
  const navigate = useNavigate()
  const { alert: showAlert } = useContext()
  const [deliveryNote, setDeliveryNote] = useState(null)
  const [total, setTotal] = useState(0)
  const [showFormWork, setShowFormWork] = useState(false)
  const [showObservationInput, setShowObservationInput] = useState(false)
  const [isEditingDate, setIsEditingDate] = useState(false)
  const [editedDate, setEditedDate] = useState("")

  // Form states for creating new line
  const [workConcept, setWorkConcept] = useState("")
  const [workQuantity, setWorkQuantity] = useState("1")
  const [workPrice, setWorkPrice] = useState("")
  const [savingWork, setSavingWork] = useState(false)

  // State for editing existing line
  const [editingWorkId, setEditingWorkId] = useState(null)
  const [editConcept, setEditConcept] = useState("")
  const [editQuantity, setEditQuantity] = useState("")
  const [editPrice, setEditPrice] = useState("")
  const [updatingWork, setUpdatingWork] = useState(false)

  // State for deleting line
  const [deletingWorkId, setDeletingWorkId] = useState(null)
  const [workToDelete, setWorkToDelete] = useState(null)

  const [observationText, setObservationText] = useState("")

  // Refs para controlar la limpieza al desmontar
  const deliveryNoteRef = useRef(null)
  const navigatedToPdfRef = useRef(false)

  const recalculateTotal = (works) => {
    const calc = (works || []).reduce(
      (accumulator, work) => accumulator + (Number(work.quantity) || 0) * (Number(work.price) || 0),
      0
    )
    setTotal(calc)
  }

  // Ref para evitar doble creación por re-render
  const creatingRef = useRef(false)

  useEffect(() => {
    if (creatingRef.current) return
    creatingRef.current = true

    try {
      //prettier-ignore
      logic.createDeliveryNote(customerId)
        .then((createdDeliveryNote) => {
          setDeliveryNote(createdDeliveryNote)
          deliveryNoteRef.current = createdDeliveryNote
          if (createdDeliveryNote?.date) {
            setEditedDate(new Date(createdDeliveryNote.date).toISOString().split("T")[0])
          }
          if (createdDeliveryNote?.observations) {
            setObservationText(createdDeliveryNote.observations)
          }
          recalculateTotal(createdDeliveryNote?.works)
        })
        .catch((error) => alert(error.message))
    } catch (error) {
      alert(error.message)
    }
  }, [customerId])

  // Cleanup: eliminar albarán vacío al desmontar (si el usuario navega atrás)
  useEffect(() => {
    return () => {
      const dn = deliveryNoteRef.current
      if (dn && !navigatedToPdfRef.current) {
        const hasWorks = dn.works && dn.works.length > 0
        if (!hasWorks) {
          const dnId = dn.id || dn._id
          logic.deleteDeliveryNote(dnId).catch(() => {})
        }
      }
    }
  }, [])

  // Sincronizar ref con el estado actual del albarán
  useEffect(() => {
    deliveryNoteRef.current = deliveryNote
  }, [deliveryNote])

  const handleCreateWork = (event) => {
    event.preventDefault()
    const concept = workConcept.trim().replace(/\s+/g, " ")
    if (!concept) {
      showAlert("Por favor, introduce una descripción para el trabajo.")
      return
    }

    const cleanQty = String(workQuantity).replace(",", ".").trim()
    const cleanPrc = String(workPrice).replace(",", ".").trim()
    const quantity = parseFloat(cleanQty)
    const price = parseFloat(cleanPrc)

    if (isNaN(quantity) || quantity === 0) {
      showAlert("La cantidad debe ser un número distinto de 0.")
      return
    }

    if (isNaN(price)) {
      showAlert("El precio unitario debe ser un número válido.")
      return
    }

    setSavingWork(true)

    try {
      //prettier-ignore
      logic.createWork(deliveryNote.id || deliveryNote._id, concept, quantity, price)
        .then((deliveryNoteUpdated) => {
          setDeliveryNote(deliveryNoteUpdated)
          setShowFormWork(false)
          setWorkConcept("")
          setWorkQuantity("1")
          setWorkPrice("")
          setSavingWork(false)
          recalculateTotal(deliveryNoteUpdated.works)
        })
        .catch((error) => {
          setSavingWork(false)
          showAlert(error.message)
        })
    } catch (error) {
      setSavingWork(false)
      showAlert(error.message)
    }
  }

  const handleStartEditWork = (work) => {
    const workId = work.id || work._id
    setEditingWorkId(workId)
    setEditConcept(work.concept || "")
    setEditQuantity(work.quantity?.toString() || "1")
    setEditPrice(work.price?.toString() || "")
  }

  const handleCancelEditWork = () => {
    setEditingWorkId(null)
    setEditConcept("")
    setEditQuantity("")
    setEditPrice("")
  }

  const handleUpdateWork = (event, workId) => {
    event.preventDefault()
    const concept = editConcept.trim().replace(/\s+/g, " ")
    if (!concept) {
      showAlert("Por favor, introduce una descripción para el trabajo.")
      return
    }

    const cleanQty = String(editQuantity).replace(",", ".").trim()
    const cleanPrc = String(editPrice).replace(",", ".").trim()
    const quantity = parseFloat(cleanQty)
    const price = parseFloat(cleanPrc)

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
      //prettier-ignore
      logic.updateWork(deliveryNote.id || deliveryNote._id, workId, concept, quantity, price)
        .then((deliveryNoteUpdated) => {
          setDeliveryNote(deliveryNoteUpdated)
          setEditingWorkId(null)
          setUpdatingWork(false)
          recalculateTotal(deliveryNoteUpdated.works)
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

  const handleDeleteWork = (workId) => {
    setWorkToDelete(workId)
  }

  const handleConfirmDeleteWork = () => {
    if (!workToDelete) return
    const workId = workToDelete
    setWorkToDelete(null)
    setDeletingWorkId(workId)
    try {
      //prettier-ignore
      logic.deleteWork(deliveryNote.id || deliveryNote._id, workId)
        .then((deliveryNoteUpdated) => {
          setDeliveryNote(deliveryNoteUpdated)
          setDeletingWorkId(null)
          recalculateTotal(deliveryNoteUpdated.works)
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

  const handleAddObservation = (event) => {
    event.preventDefault()
    const observation = observationText.trim()

    try {
      //prettier-ignore
      logic.addNewObservation(deliveryNote.id || deliveryNote._id, observation)
        .then((deliveryNoteUpdated) => {
          setDeliveryNote((prev) => ({
            ...prev,
            observations: deliveryNoteUpdated.observations
          }))
          setShowObservationInput(false)
        })
        .catch((error) => {
          showAlert(error.message)
        })
    } catch (error) {
      showAlert(error.message)
    }
  }

  const handleUpdateDeliveryNoteDate = (event) => {
    event.preventDefault()

    const convertToDDMMYYYY = (dateStr) => {
      if (dateStr.includes("-")) {
        const parts = dateStr.split("-")
        if (parts[0].length === 4) {
          // YYYY-MM-DD → DD/MM/YYYY
          return `${parts[2]}/${parts[1]}/${parts[0]}`
        }
      }
      return dateStr
    }

    try {
      //prettier-ignore
      logic.updateDeliveryNoteDate(deliveryNote.id || deliveryNote._id, convertToDDMMYYYY(editedDate))
        .then(() => {
          setDeliveryNote((prev) => ({ ...prev, date: editedDate }))
          setIsEditingDate(false)
        })
        .catch((error) => {
          showAlert(error.message)
        })
    } catch (error) {
      showAlert(error.message)
    }
  }

  return (
    <>
      <Header>
        <h1>Nuevo Albarán</h1>
      </Header>

      <Main className="MainCreateDelivery">
        <div className="w-full max-w-lg mx-auto flex flex-col gap-3.5 sm:gap-4 px-3 sm:px-4">
          {/* Tarjeta de Datos del Albarán y Cliente */}
          <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
              <span className="rounded-xl bg-amber-100 text-amber-900 font-black text-xs sm:text-sm px-3 py-1.5 border border-amber-200">
                A/Nº {deliveryNote?.number || "..."}
              </span>

              {/* Edición de Fecha */}
              <div>
                {isEditingDate ? (
                  <form onSubmit={handleUpdateDeliveryNoteDate} className="flex items-center gap-1.5">
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
                      className="rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                    />
                    <button
                      type="submit"
                      className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 active:scale-95 text-xs"
                      title="Guardar fecha"
                    >
                      <FaCheck className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingDate(false)}
                      className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95 text-xs"
                      title="Cancelar"
                    >
                      <FaXmark className="w-3 h-3" />
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingDate(true)}
                    className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 px-2.5 py-1 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-amber-900 active:scale-95 transition-all cursor-pointer group shadow-2xs"
                    title="Pulsar para editar fecha"
                  >
                    <span>📅 <Time>{deliveryNote?.date}</Time></span>
                    <FaPencil className="w-3 h-3 text-slate-400 group-hover:text-amber-800 transition-colors" />
                  </button>
                )}
              </div>
            </div>

            {/* Datos del Cliente */}
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Cliente
              </span>
              <span className="text-sm font-black text-slate-900 mt-0.5 leading-snug">
                {deliveryNote?.customer?.companyName || "Cargando cliente..."}
              </span>
              {deliveryNote?.customer?.taxId && (
                <span className="text-xs text-slate-500 font-medium mt-0.5">
                  CIF/NIF: {deliveryNote.customer.taxId}
                </span>
              )}
              {deliveryNote?.customer?.address && (
                <span className="text-xs text-slate-400 font-medium">
                  {deliveryNote.customer.address}
                </span>
              )}
            </div>
          </div>

          {/* Tarjeta de Líneas de Trabajo */}
          <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Líneas de Trabajo
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {(deliveryNote?.works || []).length} línea(s)
              </span>
            </div>

            {/* Lista de Trabajos */}
            <div className="flex flex-col gap-2.5">
              {(deliveryNote?.works || []).length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs font-medium bg-slate-50 rounded-xl border border-dashed border-slate-200 p-4">
                  Aún no has añadido conceptos a este albarán.
                </div>
              ) : (
                deliveryNote.works.map((work, idx) => {
                  const workId = work.id || work._id
                  const isEditingThisWork = editingWorkId === workId

                  if (isEditingThisWork) {
                    return (
                      <form
                        key={workId || idx}
                        onSubmit={(e) => handleUpdateWork(e, workId)}
                        className="rounded-xl bg-amber-50/80 p-3 border border-amber-200 flex flex-col gap-2.5 text-left transition-all"
                      >
                        <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                          <FaPencil className="w-3 h-3" /> Editando línea #{idx + 1}
                        </span>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                            Concepto
                          </label>
                          <input
                            type="text"
                            required
                            value={editConcept}
                            onChange={(e) => setEditConcept(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                              Cantidad
                            </label>
                            <input
                              type="number"
                              step="any"
                              inputMode="decimal"
                              required
                              value={editQuantity}
                              onChange={(e) => setEditQuantity(e.target.value)}
                              className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                              Precio (€)
                            </label>
                            <input
                              type="number"
                              step="any"
                              inputMode="decimal"
                              required
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                            className="rounded-lg bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs active:scale-95 transition-all disabled:opacity-50"
                          >
                            {updatingWork ? "Guardando..." : "Actualizar"}
                          </button>
                        </div>
                      </form>
                    )
                  }

                  return (
                    <div
                      key={workId || idx}
                      className="group flex items-start justify-between gap-2.5 border-b border-slate-100 pb-2.5 last:border-b-0 last:pb-0 text-xs sm:text-sm text-left"
                    >
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-semibold text-slate-800 leading-snug">
                          {work.concept}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium mt-0.5">
                          {work.quantity?.toFixed(2)} ud. × {work.price?.toFixed(2)} €
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 pt-0.5">
                        <span className="font-bold text-slate-900 whitespace-nowrap">
                          {(work.quantity * work.price).toFixed(2)} €
                        </span>

                        {/* Botones de Acción (Editar y Eliminar) */}
                        <div className="flex items-center gap-1 ml-1">
                          <button
                            type="button"
                            onClick={() => handleStartEditWork(work)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 active:scale-95 transition-all"
                            title="Editar línea"
                          >
                            <FaPencil className="w-3 h-3" />
                          </button>

                          <button
                            type="button"
                            disabled={deletingWorkId === workId}
                            onClick={() => handleDeleteWork(workId)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 active:scale-95 transition-all disabled:opacity-40"
                            title="Eliminar línea"
                          >
                            <FaTrashCan className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Formulario Inline para Añadir Línea */}
            {showFormWork ? (
              <form onSubmit={handleCreateWork} className="mt-2 rounded-xl bg-slate-50 p-3.5 border border-slate-200 flex flex-col gap-3 text-left">
                <span className="text-xs font-bold text-slate-700">Nueva Línea de Concepto</span>
                
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Descripción / Concepto *
                  </label>
                  <input
                    type="text"
                    required
                    value={workConcept}
                    onChange={(e) => setWorkConcept(e.target.value)}
                    placeholder="Ej. Instalación de cableado estructurado"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Cantidad *
                    </label>
                    <input
                      type="number"
                      step="any"
                      inputMode="decimal"
                      required
                      value={workQuantity}
                      onChange={(e) => setWorkQuantity(e.target.value)}
                      placeholder="1"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Precio Unitario (€) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      inputMode="decimal"
                      required
                      value={workPrice}
                      onChange={(e) => setWorkPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowFormWork(false)}
                    className="rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingWork}
                    className="rounded-lg bg-amber-600 hover:bg-amber-700 px-4 py-1.5 text-xs font-bold text-white shadow-xs active:scale-95 transition-all disabled:opacity-50"
                  >
                    {savingWork ? "Añadiendo..." : "Guardar Línea"}
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowFormWork(true)}
                className="mt-1 flex items-center justify-center gap-2 rounded-xl border border-dashed border-amber-300 bg-amber-50/70 py-2.5 px-4 text-xs font-bold text-amber-900 hover:bg-amber-100 active:scale-95 transition-all"
              >
                <FaPlus className="w-3.5 h-3.5" />
                <span>Añadir Línea de Trabajo</span>
              </button>
            )}
          </div>

          {/* Observaciones */}
          <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col gap-2.5 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FaCommentDots className="w-3.5 h-3.5" /> Observaciones
              </span>
              {!showObservationInput && (
                <button
                  type="button"
                  onClick={() => setShowObservationInput(true)}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  {deliveryNote?.observations ? "Editar" : "+ Añadir"}
                </button>
              )}
            </div>

            {showObservationInput ? (
              <form onSubmit={handleAddObservation} className="flex flex-col gap-2 mt-1">
                <textarea
                  rows="3"
                  value={observationText}
                  onChange={(e) => setObservationText(e.target.value)}
                  placeholder="Introduce observaciones o condiciones adicionales..."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                ></textarea>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowObservationInput(false)}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 active:scale-95 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition-all"
                  >
                    Guardar Observación
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-xs text-slate-600">
                {deliveryNote?.observations || "Sin observaciones adicionales."}
              </p>
            )}
          </div>

          {/* Resumen Total y Botón de Finalización */}
          <div className="w-full flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
            <span className="text-sm sm:text-base font-bold text-slate-700">TOTAL ALBARÁN:</span>
            <span className="text-lg sm:text-xl font-black text-amber-600">
              {total.toFixed(2)} €
            </span>
          </div>

          {/* Botón para Ver Albarán Completo / Finalizar */}
          {deliveryNote && (
            <button
              type="button"
              onClick={() => {
                const worksCount = deliveryNote.works?.length || 0
                if (worksCount === 0) {
                  showAlert("No has guardado ninguna línea de concepto en este albarán. Añade al menos una línea antes de generar el PDF.")
                  return
                }
                navigatedToPdfRef.current = true
                navigate(`/delivery-notes/${deliveryNote.id || deliveryNote._id}`)
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 px-6 text-sm sm:text-base font-bold text-white shadow-md transition-all active:scale-95 hover:from-amber-600 hover:to-orange-600"
            >
              <span>Ver Albarán y Generar PDF</span>
              <FaArrowRight className="w-4 h-4" />
            </button>
          )}
          {workToDelete && (
            <Confirm
              setShowConfirmDelete={() => setWorkToDelete(null)}
              handleDeleteDeliveryNote={handleConfirmDeleteWork}
            />
          )}
        </div>
      </Main>
      <Footer>FactuClient</Footer>
    </>
  )
}
