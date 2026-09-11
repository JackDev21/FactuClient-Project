import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FaTruck, FaUserPlus, FaTrash, FaPhone, FaUser, FaLock, FaSpinner, FaArrowLeft, FaKey, FaPencil, FaEnvelope } from "react-icons/fa6"

import useContext from "../../useContext"
import Header from "../../components/Header"
import Footer from "../../components/core/Footer"
import Main from "../../components/core/Main"
import logic from "../../logic/index"

export default function DriverList() {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleteDriverId, setDeleteDriverId] = useState(null)
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    password: "",
    phone: "",
    email: ""
  })

  // Estado para editar chofer y cambiar contraseña
  const [editingDriver, setEditingDriver] = useState(null)
  const [editFormData, setEditFormData] = useState({ fullName: "", username: "", phone: "", email: "", newPassword: "" })
  const [updating, setUpdating] = useState(false)

  const { alert } = useContext()
  const navigate = useNavigate()

  const loadDrivers = () => {
    setLoading(true)
    try {
      logic.getAllDrivers()
        .then(data => setDrivers(data || []))
        .catch(error => {
          alert(error.message)
          setDrivers([])
        })
        .finally(() => setLoading(false))
    } catch (error) {
      alert(error.message)
      setLoading(false)
    }
  }

  useEffect(() => {
    const info = logic.getInfo()
    if (info.role !== "user" && info.role !== "company") {
      navigate("/")
      return
    }
    loadDrivers()
  }, [])

  const sanitizeUsername = (val) => {
    if (!val) return ""
    return val
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // elimina tildes: á->a, é->e, etc.
      .replace(/ñ/g, "n")
      .replace(/Ñ/g, "n")
      .replace(/^@+/, "") // elimina @ inicial
      .replace(/\s+/g, "_") // reemplaza espacios por _
      .replace(/[^a-z0-9_.-]/g, "") // deja solo caracteres permitidos
  }

  const translateDriverError = (msg) => {
    if (!msg) return "Ha ocurrido un error inesperado al procesar el chofer."
    const m = msg.toLowerCase()
    if (
      m.includes("ya está registrado por otro chofer o usuario") ||
      m.includes("ya está en uso") ||
      m.includes("username or email already in use") ||
      m.includes("user already exists")
    ) {
      return "El nombre de usuario ya está en uso. El chofer puede tener el mismo nombre y email que un cliente, pero el usuario debe ser único para el login (ej: prueba añadiendo _chofer)."
    }
    if (m.includes("correo electrónico ya está registrado") || m.includes("email already in use")) {
      return "El correo electrónico indicado ya está en uso por otra cuenta."
    }
    if (m.includes("username is not valid")) {
      return "El nombre de usuario no es válido. Solo puede contener letras, números, puntos o guiones bajos (sin espacios ni acentos)."
    }
    if (m.includes("fullname is not valid") || m.includes("name is not valid")) {
      return "El nombre completo no es válido. Por favor, revísalo."
    }
    if (m.includes("password is not valid")) {
      return "La contraseña no es válida. Debe tener al menos 4 caracteres."
    }
    if (m.includes("email is not valid")) {
      return "El formato del correo electrónico no es válido."
    }
    if (m.includes("only company owners can register drivers") || m.includes("only company owners can update drivers")) {
      return "Solo el autónomo o titular de la empresa puede gestionar chóferes."
    }
    return msg
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target

    if (name === "username") {
      setFormData(prev => ({ ...prev, username: sanitizeUsername(value) }))
      return
    }

    if (name === "fullName") {
      setFormData(prev => {
        const next = { ...prev, fullName: value }
        // Auto-sugerir username a partir del nombre completo si el usuario no ha escrito uno personalizado
        if (!prev.username || prev.username === sanitizeUsername(prev.fullName)) {
          next.username = sanitizeUsername(value)
        }
        return next
      })
      return
    }

    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCreateDriver = (e) => {
    e.preventDefault()
    setSubmitting(true)

    const finalUsername = sanitizeUsername(formData.username)
    const finalFullName = (formData.fullName || "").trim()

    if (!finalUsername) {
      alert("Por favor, introduce un nombre de usuario válido para el chofer.")
      setSubmitting(false)
      return
    }

    try {
      logic.registerDriver(
        finalUsername,
        formData.password,
        finalFullName,
        formData.phone ? formData.phone.trim() : "",
        formData.email ? formData.email.trim() : ""
      )
        .then(() => {
          setShowModal(false)
          setFormData({ fullName: "", username: "", password: "", phone: "", email: "" })
          loadDrivers()
        })
        .catch(error => alert(translateDriverError(error.message)))
        .finally(() => setSubmitting(false))
    } catch (error) {
      alert(translateDriverError(error.message))
      setSubmitting(false)
    }
  }

  const handleDeleteDriver = (driverId) => {
    try {
      logic.deleteDriver(driverId)
        .then(() => {
          setDeleteDriverId(null)
          loadDrivers()
        })
        .catch(error => alert(translateDriverError(error.message)))
    } catch (error) {
      alert(translateDriverError(error.message))
    }
  }

  const handleOpenEditModal = (driver) => {
    setEditingDriver(driver)
    const isDummyEmail = driver.email && driver.email.endsWith("@driver.factuclient.local")
    setEditFormData({
      fullName: driver.fullName || "",
      username: driver.username || "",
      phone: driver.phone || "",
      email: isDummyEmail ? "" : (driver.email || ""),
      newPassword: ""
    })
  }

  const handleEditInputChange = (e) => {
    const { name, value } = e.target
    if (name === "username") {
      setEditFormData(prev => ({ ...prev, username: sanitizeUsername(value) }))
      return
    }
    setEditFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleUpdateDriver = (e) => {
    e.preventDefault()
    setUpdating(true)

    const finalUsername = sanitizeUsername(editFormData.username)

    const payload = {
      fullName: (editFormData.fullName || "").trim(),
      username: finalUsername,
      phone: (editFormData.phone || "").trim(),
      email: (editFormData.email || "").trim()
    }
    if (editFormData.newPassword && editFormData.newPassword.trim()) {
      payload.password = editFormData.newPassword.trim()
    }

    try {
      logic.updateDriver(editingDriver.id, payload)
        .then(() => {
          setEditingDriver(null)
          setEditFormData({ fullName: "", username: "", phone: "", email: "", newPassword: "" })
          loadDrivers()
        })
        .catch(error => alert(translateDriverError(error.message)))
        .finally(() => setUpdating(false))
    } catch (error) {
      alert(translateDriverError(error.message))
      setUpdating(false)
    }
  }

  return (
    <>
      <Header iconUser={<FaTruck />}>
        Mis Choferes
      </Header>

      <Main>
        <div className="w-full max-w-2xl flex flex-col gap-4 px-2 sm:px-4">
          {/* Barra superior de contadores y acción */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="rounded-full bg-slate-900/70 px-3.5 py-1.5 text-xs font-bold text-slate-200 backdrop-blur">
              {loading ? "Cargando..." : `Plantilla: ${drivers.length} chofer(es)`}
            </span>

            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-xs transition-all cursor-pointer"
            >
              <FaUserPlus className="text-xs" />
              <span>+ Nuevo Chofer</span>
            </button>
          </div>

          {/* Listado de Choferes */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <FaSpinner className="w-6 h-6 animate-spin text-amber-500" />
              <span className="text-xs font-medium">Cargando plantilla de choferes...</span>
            </div>
          ) : drivers.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border-2 border-dashed border-slate-200 bg-white gap-3">
              <div className="h-16 w-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-2xl">
                <FaTruck />
              </div>
              <span className="text-base font-bold text-slate-800">Aún no tienes choferes registrados</span>
              <p className="text-xs text-slate-500 max-w-sm">
                Crea usuarios para tus conductores o empleados. Podrán registrar albaranes de transporte desde su móvil sin tener acceso a precios ni facturas.
              </p>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="mt-2 rounded-xl bg-amber-600 hover:bg-amber-700 px-4 py-2 text-xs font-bold text-white shadow-sm active:scale-95 transition-all"
              >
                Registrar Primer Chofer
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {drivers.map(driver => (
                <div
                  key={driver.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-amber-300 transition-colors gap-3 text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                        {(driver.fullName || "C").trim().charAt(0).toUpperCase() || "C"}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-extrabold text-slate-900 leading-tight">
                          {driver.fullName || "Chofer"}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          Usuario: <strong className="text-slate-700">@{driver.username}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(driver)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300 border border-slate-200 rounded-xl transition-all active:scale-95 shadow-2xs cursor-pointer"
                        title="Modificar datos o cambiar contraseña"
                      >
                        <FaKey className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-700" />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteDriverId(driver.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 hover:border-rose-300 border border-rose-200 rounded-xl transition-all active:scale-95 shadow-2xs cursor-pointer"
                        title="Dar de baja chofer"
                      >
                        <FaTrash className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600" />
                        <span>Baja</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs text-slate-600 gap-2">
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <span className="flex items-center gap-2 truncate">
                        <FaPhone className="text-slate-400 text-xs sm:text-sm shrink-0" />
                        {driver.phone && driver.phone.replace(/[^0-9+]/g, "").length >= 3 ? driver.phone.trim() : "Sin teléfono"}
                      </span>
                      <span className="flex items-center gap-2 truncate">
                        <FaEnvelope className="text-slate-400 text-xs sm:text-sm shrink-0" />
                        {driver.email && !driver.email.endsWith("@driver.factuclient.local") ? driver.email : "Sin correo"}
                      </span>
                    </div>
                    <span className="rounded-full bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 text-xs shrink-0 self-start sm:self-center">
                      Activo
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal: Crear Chofer */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 sm:p-4 animate-fadeIn">
              <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-5 sm:p-6 shadow-xl border border-slate-200 flex flex-col gap-4 text-left">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                      <FaUserPlus />
                    </div>
                    <span className="text-base font-extrabold text-slate-900">Alta de Chofer</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateDriver} className="flex flex-col gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Ej. Francisco García"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">Nombre de Usuario (Login) *</label>
                      <span className="text-[10px] text-amber-700 font-semibold">Sin espacios ni acentos</span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        name="username"
                        required
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="paco_chofer"
                        className="w-full rounded-xl border border-slate-300 pl-2 pr-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Contraseña de Acceso *</label>
                    <input
                      type="password"
                      name="password"
                      required
                      minLength={4}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Mínimo 4 caracteres"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="600123456"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email (Opcional)</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="chofer@empresa.es"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 italic mt-1">
                    Nota: El chofer solo podrá registrar albaranes sin valorar y consultar sus propios transportes. No tendrá acceso a datos fiscales ni facturas.
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all disabled:opacity-50"
                    >
                      {submitting && <FaSpinner className="animate-spin text-xs" />}
                      <span>{submitting ? "Guardando..." : "Crear Chofer"}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Editar Chofer / Cambiar Contraseña */}
          {editingDriver && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 sm:p-4 animate-fadeIn">
              <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-5 sm:p-6 shadow-xl border border-slate-200 flex flex-col gap-4 text-left">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                      <FaKey />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base font-extrabold text-slate-900 leading-tight">Editar Chofer</span>
                      <span className="text-xs text-slate-400 font-medium">@{editingDriver.username}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingDriver(null)}
                    className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleUpdateDriver} className="flex flex-col gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={editFormData.fullName}
                      onChange={handleEditInputChange}
                      placeholder="Ej. Francisco García"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">Nombre de Usuario (Login) *</label>
                      <span className="text-[10px] text-amber-700 font-semibold">Sin espacios ni acentos</span>
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">@</span>
                      <input
                        type="text"
                        name="username"
                        required
                        value={editFormData.username}
                        onChange={handleEditInputChange}
                        placeholder="usuario_chofer"
                        className="w-full rounded-xl border border-slate-300 pl-7 pr-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono</label>
                      <input
                        type="tel"
                        name="phone"
                        value={editFormData.phone}
                        onChange={handleEditInputChange}
                        placeholder="600123456"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={editFormData.email}
                        onChange={handleEditInputChange}
                        placeholder="chofer@empresa.es"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl bg-amber-50/70 p-3 border border-amber-200/80 flex flex-col gap-1.5">
                    <label className="block text-xs font-bold text-amber-950">
                      Nueva Contraseña de Acceso
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      minLength={4}
                      value={editFormData.newPassword}
                      onChange={handleEditInputChange}
                      placeholder="Dejar en blanco para no cambiarla"
                      className="w-full rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="text-[11px] text-amber-800/80">
                      Si el chofer ha olvidado su contraseña, escribe aquí la nueva (mínimo 4 caracteres).
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setEditingDriver(null)}
                      className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {updating && <FaSpinner className="animate-spin text-xs" />}
                      <span>{updating ? "Guardando..." : "Guardar Cambios"}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Confirmación Eliminar */}
          {deleteDriverId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
              <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl border border-slate-200 flex flex-col gap-3 text-center">
                <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-xl">
                  <FaTrash />
                </div>
                <span className="text-base font-extrabold text-slate-900">¿Dar de baja a este chofer?</span>
                <p className="text-xs text-slate-500">
                  El chofer perderá acceso a la aplicación. Los albaranes que haya registrado permanecerán guardados de forma segura.
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeleteDriverId(null)}
                    className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteDriver(deleteDriverId)}
                    className="rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white shadow-xs"
                  >
                    Confirmar Baja
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Main>

      <Footer />
    </>
  )
}
