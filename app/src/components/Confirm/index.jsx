import { useEffect } from "react"
import { FaTrashCan, FaXmark } from "react-icons/fa6"
import "./index.css"

export default function Confirm({
  setShowConfirmDelete,
  handleDeleteDeliveryNote,
  handleDeleteCustomer,
  handleDeleteInvoice,
}) {
  const handleDelete = () => {
    if (handleDeleteDeliveryNote) {
      handleDeleteDeliveryNote()
    }
    if (handleDeleteCustomer) {
      handleDeleteCustomer()
    }
    if (handleDeleteInvoice) {
      handleDeleteInvoice()
    }
  }

  const handleClose = () => {
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

        {/* Icono de borrado */}
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-rose-50 text-rose-600 border border-rose-200/80 shadow-inner mb-1">
          <FaTrashCan className="w-7 h-7" />
        </div>

        {/* Título de Confirmación */}
        <h3 className="text-lg font-black text-slate-900 mt-1">
          ¿Seguro que quieres eliminar?
        </h3>

        {/* Texto explicativo */}
        <p className="text-sm font-medium text-slate-500 leading-relaxed px-2 mt-1">
          Esta acción no se puede deshacer. El elemento seleccionado se eliminará de forma permanente.
        </p>

        {/* Botones de acción */}
        <div className="flex w-full items-center gap-3 mt-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 bg-slate-100 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 text-xs sm:text-sm font-bold text-white shadow-md shadow-rose-500/25 hover:from-rose-700 hover:to-red-700 active:scale-95 transition-all"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
