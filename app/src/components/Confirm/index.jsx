import { useEffect } from "react"
import {
  FaTrashCan,
  FaXmark,
  FaTriangleExclamation,
  FaCircleInfo,
  FaCircleCheck,
} from "react-icons/fa6"
import "./index.css"

export default function Confirm({
  title = "¿Seguro que quieres eliminar?",
  message = "Esta acción no se puede deshacer. El elemento seleccionado se eliminará de forma permanente.",
  description,
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  type = "danger",
  icon,
  onConfirm,
  onClose,
  setShowConfirmDelete,
  handleDeleteDeliveryNote,
  handleDeleteCustomer,
  handleDeleteInvoice,
}) {
  const handleConfirm = () => {
    if (typeof onConfirm === "function") {
      onConfirm()
    }
    if (typeof handleDeleteDeliveryNote === "function") {
      handleDeleteDeliveryNote()
    }
    if (typeof handleDeleteCustomer === "function") {
      handleDeleteCustomer()
    }
    if (typeof handleDeleteInvoice === "function") {
      handleDeleteInvoice()
    }
  }

  const handleClose = () => {
    if (typeof onClose === "function") {
      onClose()
    }
    if (typeof setShowConfirmDelete === "function") {
      setShowConfirmDelete(false)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const finalMessage = description || message

  const renderIcon = () => {
    if (icon) return icon
    switch (type) {
      case "warning":
        return <FaTriangleExclamation className="w-7 h-7" />
      case "info":
        return <FaCircleInfo className="w-7 h-7" />
      case "success":
        return <FaCircleCheck className="w-7 h-7" />
      case "danger":
      default:
        return <FaTrashCan className="w-7 h-7" />
    }
  }

  const getIconContainerClass = () => {
    switch (type) {
      case "warning":
        return "bg-amber-50 text-amber-600 border border-amber-200/80"
      case "info":
        return "bg-blue-50 text-blue-600 border border-blue-200/80"
      case "success":
        return "bg-emerald-50 text-emerald-600 border border-emerald-200/80"
      case "danger":
      default:
        return "bg-rose-50 text-rose-600 border border-rose-200/80"
    }
  }

  const getConfirmButtonClass = () => {
    switch (type) {
      case "warning":
        return "bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/25 hover:from-amber-600 hover:to-orange-600"
      case "info":
        return "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700"
      case "success":
        return "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-500/25 hover:from-emerald-700 hover:to-teal-700"
      case "danger":
      default:
        return "bg-gradient-to-r from-rose-600 to-red-600 shadow-rose-500/25 hover:from-rose-700 hover:to-red-700"
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all duration-200"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100 flex flex-col items-center text-center transition-all transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar X */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-full p-2 hover:bg-slate-100 transition-all active:scale-90"
          aria-label="Cerrar"
        >
          <FaXmark className="w-4 h-4" />
        </button>

        {/* Icono temático */}
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-inner mb-1 ${getIconContainerClass()}`}
        >
          {renderIcon()}
        </div>

        {/* Título de Confirmación */}
        <h3 className="text-lg font-black text-slate-900 mt-1">
          {title}
        </h3>

        {/* Texto explicativo */}
        {finalMessage && (
          <p className="text-sm font-medium text-slate-500 leading-relaxed px-2 mt-1">
            {finalMessage}
          </p>
        )}

        {/* Botones de acción */}
        <div className="flex w-full items-center gap-3 mt-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 bg-slate-100 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold text-white shadow-md active:scale-95 transition-all ${getConfirmButtonClass()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
