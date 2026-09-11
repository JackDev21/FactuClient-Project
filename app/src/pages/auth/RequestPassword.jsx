import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { FaEnvelope, FaKey, FaArrowLeft, FaPaperPlane } from "react-icons/fa6"
import { FaSpinner } from "react-icons/fa"
import useContext from "../../useContext"

import { NotFoundError, SystemError } from "com/errors"
import Main from "../../components/core/Main"
import Footer from "../../components/core/Footer"
import logic from "../../logic"

export default function RequestPassword() {
  const { alert: showAlert } = useContext()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRequestPasswordReset = (event) => {
    event.preventDefault()
    if (loading) return

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      showAlert("Por favor, introduce tu correo electrónico.")
      return
    }

    try {
      setLoading(true)
      logic
        .requestPasswordReset(trimmedEmail)
        .then(() => {
          showAlert("Te hemos enviado un correo con las instrucciones para restablecer tu contraseña. Por favor, revisa tu bandeja de entrada o spam.")
          navigate("/login")
        })
        .catch((error) => {
          if (error instanceof NotFoundError) {
            showAlert("No existe ninguna cuenta registrada con este correo electrónico.")
          } else if (error instanceof SystemError) {
            showAlert("Error al conectar con el servidor de correo. Por favor, inténtalo más tarde.")
          } else {
            showAlert(error.message || "Error al procesar la solicitud.")
          }
        })
        .finally(() => {
          setLoading(false)
        })
    } catch (error) {
      setLoading(false)
      showAlert(error.message)
    }
  }

  return (
    <>
      <div className="Header">
        <div className="flex flex-col items-center justify-center">
          <span className="text-2xl sm:text-3xl font-black text-white tracking-wider drop-shadow-sm uppercase">
            FactuClient
          </span>
          <span className="text-[11px] sm:text-xs font-semibold text-amber-100/90 tracking-normal mt-0.5">
            Recuperación de Cuenta
          </span>
        </div>
      </div>

      <Main className="LoginMain">
        <div className="w-full max-w-sm sm:max-w-md mx-auto flex flex-col gap-4">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-lg flex flex-col gap-5 text-left animate-fadeIn">
            <div className="flex flex-col items-center text-center gap-1.5 pb-2 border-b border-slate-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/80 text-xl shadow-2xs mb-1">
                <FaKey />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Recuperar Contraseña
              </h1>
              <p className="text-xs text-slate-500 font-medium max-w-xs">
                Introduce tu correo electrónico y te enviaremos un enlace seguro para restablecerla
              </p>
            </div>

            <form onSubmit={handleRequestPasswordReset} className="flex flex-col gap-4 mt-1">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  Correo Electrónico
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@empresa.es"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all shadow-2xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 py-3 px-4 text-sm sm:text-base font-extrabold text-white shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin text-base" />
                    <span>Enviando enlace...</span>
                  </>
                ) : (
                  <>
                    <span>Enviar Enlace de Recuperación</span>
                    <FaPaperPlane className="text-xs" />
                  </>
                )}
              </button>

              <div className="flex justify-center pt-2 border-t border-slate-100">
                <Link
                  to="/login"
                  className="text-xs font-bold text-slate-600 hover:text-amber-800 transition-colors flex items-center gap-1.5"
                >
                  <FaArrowLeft className="text-[10px]" />
                  <span>Volver a iniciar sesión</span>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </Main>

      <Footer>FactuClient</Footer>
    </>
  )
}
