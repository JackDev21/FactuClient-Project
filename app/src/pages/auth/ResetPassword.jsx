import { useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { FaLock, FaEye, FaEyeSlash, FaCheck, FaArrowLeft } from "react-icons/fa6"
import { FaSpinner } from "react-icons/fa"

import useContext from "../../useContext"
import { CredentialsError, SystemError } from "com/errors"
import Main from "../../components/core/Main"
import Footer from "../../components/core/Footer"
import logic from "../../logic"

export default function ResetPassword() {
  const { alert: showAlert } = useContext()
  const navigate = useNavigate()
  const { userId, token } = useParams()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handlePasswordReset = (event) => {
    event.preventDefault()
    if (loading) return

    if (!password || !confirmPassword) {
      showAlert("Por favor, introduce y confirma tu nueva contraseña.")
      return
    }

    if (password !== confirmPassword) {
      showAlert("Las contraseñas no coinciden. Por favor, revísalas.")
      return
    }

    try {
      setLoading(true)
      logic
        .resetPassword(userId, password, confirmPassword, token)
        .then(() => {
          showAlert("¡Contraseña restablecida con éxito! Ya puedes iniciar sesión con tu nueva contraseña.")
          navigate("/login")
        })
        .catch((error) => {
          const msg = (error.message || "").toLowerCase()
          if (error instanceof CredentialsError || msg.includes("jwt") || msg.includes("token") || msg.includes("expired")) {
            showAlert("El enlace ha caducado o no es válido. Por favor, solicita un nuevo correo de restablecimiento.")
          } else if (error instanceof SystemError) {
            showAlert("Error al conectar con el servidor. Inténtalo de nuevo más tarde.")
          } else {
            showAlert(error.message || "Error al restablecer la contraseña.")
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
            Nueva Contraseña
          </span>
        </div>
      </div>

      <Main className="LoginMain">
        <div className="w-full max-w-sm sm:max-w-md mx-auto flex flex-col gap-4">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-lg flex flex-col gap-5 text-left animate-fadeIn">
            <div className="flex flex-col items-center text-center gap-1.5 pb-2 border-b border-slate-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/80 text-xl shadow-2xs mb-1">
                <FaLock />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Restablecer Contraseña
              </h1>
              <p className="text-xs text-slate-500 font-medium max-w-xs">
                Introduce tu nueva contraseña segura para acceder a tu cuenta
              </p>
            </div>

            <form onSubmit={handlePasswordReset} className="flex flex-col gap-4 mt-1">
              {/* Nueva Contraseña */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="password"
                  className="text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-10 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                  </button>
                </div>
              </div>

              {/* Confirmar Contraseña */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  Repetir Contraseña
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-10 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                  </button>
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
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <span>Guardar Nueva Contraseña</span>
                    <FaCheck className="text-xs" />
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
