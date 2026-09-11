import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
  FaArrowLeft,
  FaFilePdf,
  FaShareNodes,
  FaWhatsapp,
  FaCopy,
  FaCheck,
  FaTruckFast,
  FaFlagCheckered,
  FaClock,
  FaShieldHalved,
  FaFileShield,
  FaTriangleExclamation,
  FaPencil,
  FaXmark,
} from "react-icons/fa6"
import { FaSpinner } from "react-icons/fa"

import useContext from "../../useContext"
import Header from "../../components/Header"
import Main from "../../components/core/Main"
import Confirm from "../../components/Confirm"
import logic from "../../logic/index"

export default function DecaInfo() {
  const { alert: showAlert } = useContext()
  const { decaId } = useParams()
  const navigate = useNavigate()

  const [deca, setDeca] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [endingTransport, setEndingTransport] = useState(false)
  const [showConfirmEnd, setShowConfirmEnd] = useState(false)

  // Estados para modificar datos si hay incidencias en ruta
  const [showEditModal, setShowEditModal] = useState(false)
  const [editPlate, setEditPlate] = useState("")
  const [editDestination, setEditDestination] = useState("")
  const [editLoadingTime, setEditLoadingTime] = useState("")
  const [editUnloadingTime, setEditUnloadingTime] = useState("")
  const [editReason, setEditReason] = useState("")
  const [savingEdit, setSavingEdit] = useState(false)

  const loadDeca = () => {
    logic.getDeca(decaId)
      .then((d) => {
        setDeca(d)
        setEditPlate(d.vehiclePlate || "")
        setEditDestination(d.destination || "")
        setEditLoadingTime(d.loadingTime || "")
        setEditUnloadingTime(d.unloadingTime || "")
        setLoading(false)
      })
      .catch((err) => {
        setLoading(false)
        showAlert(err.message)
      })
  }

  useEffect(() => {
    loadDeca()
  }, [decaId])

  // Resuelve la URL pública de descarga asegurando que en producción apunte a la API real (no a localhost)
  const publicDownloadUrl = (() => {
    if (!deca) return ""
    const apiUrl = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "")
    if (
      deca.publicToken &&
      (!deca.publicDownloadUrl ||
        (deca.publicDownloadUrl.includes("localhost") && !apiUrl.includes("localhost")))
    ) {
      return `${apiUrl}/deca/public/${deca.publicToken}/download`
    }
    return deca.publicDownloadUrl || (deca.publicToken ? `${apiUrl}/deca/public/${deca.publicToken}/download` : "")
  })()

  const handleCopyLink = () => {
    if (!publicDownloadUrl) return
    navigator.clipboard.writeText(publicDownloadUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleShareWhatsApp = () => {
    if (!deca) return
    const text = encodeURIComponent(
      `🚚 Documento DeCA oficial para transporte (Nº ${deca.number})\n` +
      `Albarán: ${deca.deliveryNote?.number || ""}\n` +
      `Origen: ${deca.origin}\n` +
      `Destino: ${deca.destination}\n\n` +
      `Enlace de inspección en carretera para Guardia Civil / Transportes:\n${publicDownloadUrl}`
    )
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank")
  }

  const handleConfirmEndTransport = async () => {
    setShowConfirmEnd(false)
    setEndingTransport(true)
    try {
      const updated = await logic.updateDecaTransportEnd(decaId)
      setDeca(updated)
      setEndingTransport(false)
      showAlert("Transporte marcado como finalizado. La descarga pública estará activa durante los próximos 7 días naturales.")
    } catch (err) {
      setEndingTransport(false)
      showAlert(err.message)
    }
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!editReason.trim()) {
      showAlert("Debes indicar el motivo de la modificación por imperativo legal de trazabilidad.")
      return
    }

    setSavingEdit(true)
    try {
      const updated = await logic.updateDeca(
        decaId,
        {
          vehiclePlate: editPlate.trim(),
          destination: editDestination.trim(),
          loadingTime: editLoadingTime.trim(),
          unloadingTime: editUnloadingTime.trim(),
        },
        editReason.trim()
      )
      setDeca(updated)
      setSavingEdit(false)
      setShowEditModal(false)
      setEditReason("")
      showAlert("DeCA actualizado y nuevo PDF regenerado con registro de trazabilidad.")
    } catch (err) {
      setSavingEdit(false)
      showAlert(err.message)
    }
  }

  if (loading) {
    return (
      <>
        <Header>
          <span className="text-sm font-bold text-white drop-shadow-sm">Detalle de DeCA</span>
        </Header>
        <Main>
          <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-3">
            <FaSpinner className="animate-spin text-3xl text-amber-500" />
            <span className="text-xs font-semibold">Cargando datos del documento...</span>
          </div>
        </Main>
      </>
    )
  }

  if (!deca) return null

  const isCompleted = deca.status === "completed"

  return (
    <>
      <Header
        iconLeftHeader={<FaArrowLeft />}
        onDeleteDeliveryNote={() => navigate(-1)}
      >
        <div className="flex flex-col items-center justify-center max-w-full">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[10px] sm:text-xs font-black uppercase tracking-wider mb-0.5">
            <FaFileShield className="text-xs shrink-0 text-amber-600" /> Documento DeCA
          </span>
          <h1 className="text-sm sm:text-base font-black text-slate-950 tracking-tight leading-tight truncate max-w-full">
            {deca.number}
          </h1>
        </div>
      </Header>

      <Main>
        <div className="w-full max-w-2xl flex flex-col gap-4 px-2 sm:px-4 py-2 pb-16 text-left">
          {/* Tarjeta Superior: Estado y Código QR */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded-xl bg-amber-100 text-amber-950 font-black text-xs sm:text-sm px-3 py-1 border border-amber-200">
                  {deca.number}
                </span>

                {isCompleted ? (
                  <span className="rounded-full bg-slate-100 text-slate-700 border border-slate-300 px-3 py-0.5 text-xs font-bold flex items-center gap-1">
                    <FaFlagCheckered /> Porte Finalizado
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-0.5 text-xs font-bold flex items-center gap-1">
                    <FaTruckFast className="animate-pulse" /> Activo en Ruta
                  </span>
                )}
              </div>

              <span className="text-xs text-slate-500 font-medium mt-1">
                Albarán vinculado:{" "}
                <Link
                  to={`/delivery-notes/${deca.deliveryNote?._id || deca.deliveryNote?.id || deca.deliveryNote}`}
                  className="font-bold text-amber-700 underline"
                >
                  Nº {deca.deliveryNote?.number || "Ver albarán"}
                </Link>
              </span>

              <span className="text-[11px] text-slate-400">
                Emisión técnica: {new Date(deca.generatedAt).toLocaleString("es-ES")}
              </span>

              {deca.publicAccessExpiry && (
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200 mt-1">
                  <FaClock className="shrink-0" />
                  <span>
                    Acceso público por QR activo hasta: {new Date(deca.publicAccessExpiry).toLocaleDateString("es-ES")}
                  </span>
                </div>
              )}
            </div>

            {/* Código QR con previsualización para el transportista */}
            <div className="flex flex-col items-center gap-2 shrink-0 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(
                  publicDownloadUrl
                )}`}
                alt="Código QR DeCA"
                className="w-24 h-24 rounded-lg bg-white p-1 border border-slate-200"
              />
              <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-tight">
                QR Inspección
              </span>
            </div>
          </div>

          {/* Botonera de Acciones Principales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <a
              href={publicDownloadUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl bg-orange-500 hover:bg-orange-600 py-3 px-4 text-xs sm:text-sm font-bold text-white shadow-xs active:scale-95 transition-all"
            >
              <FaFilePdf className="text-base" />
              <span>Descargar PDF Oficial</span>
            </a>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3 px-4 text-xs sm:text-sm font-bold text-white shadow-xs active:scale-95 transition-all"
            >
              <FaWhatsapp className="text-base" />
              <span>Enviar al Conductor (WhatsApp)</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 rounded-2xl bg-slate-100 hover:bg-slate-200 py-2.5 px-4 text-xs font-bold text-slate-700 border border-slate-300 active:scale-95 transition-all"
            >
              {copied ? (
                <>
                  <FaCheck className="text-emerald-600" />
                  <span className="text-emerald-700">¡Enlace de inspección copiado!</span>
                </>
              ) : (
                <>
                  <FaCopy />
                  <span>Copiar enlace de inspección</span>
                </>
              )}
            </button>

            {!isCompleted ? (
              <button
                type="button"
                disabled={endingTransport}
                onClick={() => setShowConfirmEnd(true)}
                className="flex items-center justify-center gap-2 rounded-2xl bg-amber-50 hover:bg-amber-100 py-2.5 px-4 text-xs font-bold text-amber-800 border border-amber-300 active:scale-95 transition-all disabled:opacity-50"
              >
                {endingTransport ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaFlagCheckered />
                )}
                <span>Marcar Fin del Transporte</span>
              </button>
            ) : (
              <div className="flex items-center justify-center text-xs font-semibold text-slate-400 italic py-2">
                Transporte finalizado
              </div>
            )}
          </div>

          {/* Datos Intervinientes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                1. Cargador Contractual
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                {deca.shipper?.name}
              </span>
              <span className="text-xs text-slate-600 font-medium">
                NIF: {deca.shipper?.taxId}
              </span>
              <span className="text-xs text-slate-500">{deca.shipper?.address}</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                2. Transportista Efectivo
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                {deca.carrier?.name}
              </span>
              <span className="text-xs text-slate-600 font-medium">
                NIF: {deca.carrier?.taxId}
              </span>
              <span className="text-xs text-slate-500">
                {deca.carrier?.address || "Base operativa"}
              </span>
            </div>
          </div>

          {/* Datos de Ruta, Carga y Vehículo */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Detalle del Transporte y Mercancía
              </span>

              {!isCompleted && (
                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200 transition-all shadow-2xs"
                >
                  <FaPencil className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-800" />
                  <span>Modificar en Ruta</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="font-bold text-slate-500 block mb-0.5">Lugar de Origen (Carga):</span>
                <span className="font-semibold text-slate-800">{deca.origin}</span>
                {deca.loadingTime && (
                  <span className="text-[11px] text-amber-800 font-bold block mt-0.5">
                    Hora carga: {deca.loadingTime} h
                  </span>
                )}
              </div>
              <div>
                <span className="font-bold text-slate-500 block mb-0.5">Lugar de Destino (Descarga):</span>
                <span className="font-semibold text-slate-800">{deca.destination}</span>
                {deca.unloadingTime && (
                  <span className="text-[11px] text-amber-800 font-bold block mt-0.5">
                    Hora descarga: {deca.unloadingTime} h
                  </span>
                )}
              </div>
              <div>
                <span className="font-bold text-slate-500 block mb-0.5">Mercancía Transportada:</span>
                <span className="font-semibold text-slate-800">{deca.cargoDescription}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500 block mb-0.5">Peso / Cantidad:</span>
                <span className="font-extrabold text-amber-700">{deca.cargoWeight}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500 block mb-0.5">Matrícula(s):</span>
                <span className="font-semibold text-slate-800">
                  {deca.vehiclePlate || "No indicada"}
                  {deca.trailerPlate ? ` / Remolque: ${deca.trailerPlate}` : ""}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-500 block mb-0.5">Conductor:</span>
                <span className="font-semibold text-slate-800">{deca.driverName || "Autorizado"}</span>
              </div>
            </div>

            {deca.observations && (
              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-700 border border-slate-200/60 mt-1">
                <span className="font-bold block mb-1 text-slate-500">Observaciones y reservas:</span>
                <p className="whitespace-pre-line">{deca.observations}</p>
              </div>
            )}
          </div>

          {/* Historial de Trazabilidad (Resolución 5 junio 2026) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FaShieldHalved className="text-amber-600" /> Trazabilidad y Registro de Modificaciones
            </span>

            <div className="flex flex-col gap-2">
              {deca.modificationHistory && deca.modificationHistory.length > 0 ? (
                deca.modificationHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 text-xs border-b border-slate-100 pb-2 last:border-b-0 last:pb-0"
                  >
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-slate-400">
                        {new Date(item.date).toLocaleString("es-ES")}
                      </span>
                      <span className="text-slate-800 font-medium">{item.description}</span>
                    </div>
                  </div>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">Sin modificaciones registradas.</span>
              )}
            </div>
          </div>
        </div>
      </Main>

      {/* Modal para Modificar Datos en Ruta */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 sm:p-6 shadow-xl flex flex-col gap-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm font-extrabold text-slate-900">
                Modificar DeCA en Ruta (Trazabilidad)
              </span>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Matrícula Vehículo
                </label>
                <input
                  type="text"
                  value={editPlate}
                  onChange={(e) => setEditPlate(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold uppercase focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Destino / Punto de Entrega
                </label>
                <input
                  type="text"
                  value={editDestination}
                  onChange={(e) => setEditDestination(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Hora Carga (Opcional)
                  </label>
                  <input
                    type="time"
                    value={editLoadingTime}
                    onChange={(e) => setEditLoadingTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Hora Descarga (Opcional)
                  </label>
                  <input
                    type="time"
                    value={editUnloadingTime}
                    onChange={(e) => setEditUnloadingTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Motivo de la Modificación (Obligatorio por ley) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="Ej. Avería de tractora, cambio de muelle por indicación del cliente..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="rounded-xl bg-amber-600 hover:bg-amber-700 px-4 py-1.5 text-xs font-bold text-white shadow-xs disabled:opacity-50"
                >
                  {savingEdit ? "Guardando..." : "Guardar Modificación"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmación Fin del Transporte */}
      {showConfirmEnd && (
        <Confirm
          type="warning"
          icon={<FaFlagCheckered className="w-7 h-7" />}
          title="¿Confirmar fin del transporte?"
          message="Esto activará la cuenta atrás de 7 días naturales para el acceso público de inspección por QR conforme a la normativa oficial."
          confirmText="Confirmar"
          cancelText="Cancelar"
          onConfirm={handleConfirmEndTransport}
          onClose={() => setShowConfirmEnd(false)}
        />
      )}
    </>
  )
}
