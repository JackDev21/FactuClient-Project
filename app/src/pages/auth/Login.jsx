import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FaUser, FaLock, FaEye, FaEyeSlash, FaKey, FaArrowRight, FaShieldHalved } from "react-icons/fa6"
import { FaSpinner } from "react-icons/fa"

import useContext from "../../useContext"
import { SystemError } from "com/errors"
import logic from "../../logic"

import Main from "../../components/core/Main"
import Footer from "../../components/core/Footer"

export default function Login() {
  const { alert: showAlert } = useContext()
  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleLoginSubmit = (event) => {
    event.preventDefault()
    if (submitting) return

    const trimmedUser = username.trim()
    if (!trimmedUser || !password) {
      showAlert("Por favor, introduce tu usuario y contraseña.")
      return
    }

    setSubmitting(true)

    try {
      logic
        .loginUser(trimmedUser, password)
        .then(() => {
          setSubmitting(false)
          const { role, userId } = logic.getInfo()
          if (role === "customer") {
            navigate(`/customer/${userId}/info`)
          } else {
            navigate("/")
          }
        })
        .catch((error) => {
          setSubmitting(false)
          if (error instanceof SystemError) {
            showAlert(
              "No se ha podido conectar con el servidor. Por favor, comprueba tu conexión a internet o inténtalo más tarde."
            )
          } else {
            showAlert("Usuario o contraseña incorrectos. Por favor, comprueba tus datos de acceso.")
          }
        })
    } catch (error) {
      setSubmitting(false)
      showAlert(error.message)
    }
  }

  return (
    <>
      {/* Cabecera Principal con la identidad visual corporativa */}
      <div className="Header">
        <div className="flex flex-col items-center justify-center">
          <span className="text-2xl sm:text-3xl font-black text-white tracking-wider drop-shadow-sm uppercase">
            FactuClient
          </span>
          <span className="text-[11px] sm:text-xs font-semibold text-amber-100/90 tracking-normal mt-0.5">
            Gestión de Albaranes, Facturas y DeCA
          </span>
        </div>
      </div>

      <Main className="LoginMain">
        <div className="w-full max-w-sm sm:max-w-md mx-auto flex flex-col gap-4">
          {/* Tarjeta de Inicio de Sesión */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-lg flex flex-col gap-5 text-left animate-fadeIn">
            {/* Cabecera interior de la tarjeta */}
            <div className="flex flex-col items-center text-center gap-1.5 pb-2 border-b border-slate-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/80 text-xl shadow-2xs mb-1">
                <FaShieldHalved />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Iniciar Sesión
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Introduce tus credenciales para acceder a la plataforma
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4 mt-1">
              {/* Campo Usuario */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="username"
                  className="text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  Usuario o Correo
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Introduce tu usuario"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Campo Contraseña */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="password"
                  className="text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
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
                    title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  >
                    {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                  </button>
                </div>
              </div>

              {/* Enlace recuperación contraseña */}
              <div className="flex justify-end -mt-1">
                <Link
                  to="/request-password-reset"
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline transition-colors flex items-center gap-1.5"
                >
                  <FaKey className="text-[10px]" />
                  <span>¿Has olvidado tu contraseña?</span>
                </Link>
              </div>

              {/* Botón de acceso */}
              <button
                type="submit"
                disabled={submitting}
                className="mt-2 w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 py-3 px-4 text-sm sm:text-base font-extrabold text-white shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <FaSpinner className="animate-spin text-base" />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar a FactuClient</span>
                    <FaArrowRight className="text-xs" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </Main>

      <Footer>FactuClient</Footer>
    </>
  )
}
