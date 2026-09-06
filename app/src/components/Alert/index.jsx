import { useEffect } from "react"
import {
  FaCircleCheck,
  FaTriangleExclamation,
  FaCircleExclamation,
  FaCircleInfo,
  FaXmark,
} from "react-icons/fa6"
import "./index.css"

function Alert({ message, onAccept }) {
  const lowerMsg = (message || "").toLowerCase()

  const isError =
    lowerMsg.includes("error") ||
    lowerMsg.includes("fallo") ||
    lowerMsg.includes("incorrect") ||
    lowerMsg.includes("no se pudo") ||
    lowerMsg.includes("denegad")

  const isSuccess =
    !isError &&
    (lowerMsg.includes("correctamente") ||
      lowerMsg.includes("éxito") ||
      lowerMsg.includes("exito") ||
      lowerMsg.includes("actualizad") ||
      lowerMsg.includes("guardad") ||
      lowerMsg.includes("cread") ||
      lowerMsg.includes("enviad"))

  const isWarning =
    !isError &&
    !isSuccess &&
    (lowerMsg.includes("no has") ||
      lowerMsg.includes("atención") ||
      lowerMsg.includes("aviso") ||
      lowerMsg.includes("falta") ||
      lowerMsg.includes("completa") ||
      lowerMsg.includes("selecciona") ||
      lowerMsg.includes("por favor"))

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onAccept && onAccept()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onAccept])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all duration-200"
      onClick={onAccept}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100 flex flex-col items-center text-center transition-all transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar X */}
        <button
          type="button"
          onClick={onAccept}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-full p-2 hover:bg-slate-100 transition-all active:scale-90"
          aria-label="Cerrar"
        >
          <FaXmark className="w-4 h-4" />
        </button>

        {/* Icono temático */}
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-1 shadow-inner ${
            isError
              ? "bg-rose-50 text-rose-600 border border-rose-200/80"
              : isSuccess
              ? "bg-emerald-50 text-emerald-600 border border-emerald-200/80"
              : isWarning
              ? "bg-amber-50 text-amber-600 border border-amber-200/80"
              : "bg-blue-50 text-blue-600 border border-blue-200/80"
          }`}
        >
          {isError ? (
            <FaCircleExclamation className="w-8 h-8" />
          ) : isSuccess ? (
            <FaCircleCheck className="w-8 h-8" />
          ) : isWarning ? (
            <FaTriangleExclamation className="w-8 h-8" />
          ) : (
            <FaCircleInfo className="w-8 h-8" />
          )}
        </div>

        {/* Título de estado */}
        <h3 className="text-lg font-black text-slate-900 mt-1">
          {isError
            ? "Ha ocurrido un error"
            : isSuccess
            ? "¡Operación completada!"
            : isWarning
            ? "Atención"
            : "Notificación"}
        </h3>

        {/* Mensaje descriptivo */}
        <p className="text-sm font-semibold text-slate-600 leading-relaxed px-2 mt-1">
          {message}
        </p>

        {/* Botón Aceptar moderno */}
        <button
          type="button"
          onClick={onAccept}
          className={`mt-4 w-full py-3.5 px-6 rounded-2xl font-bold text-sm text-white shadow-md transition-all active:scale-95 ${
            isError
              ? "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 shadow-rose-500/25"
              : isSuccess
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/25"
              : isWarning
              ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/25"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25"
          }`}
        >
          Aceptar
        </button>
      </div>
    </div>
  )
}

export default Alert
