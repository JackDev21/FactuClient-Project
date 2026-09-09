import { useState, useRef } from "react"
import { FaXmark, FaUserPlus, FaBuilding, FaPhone, FaEnvelope, FaLock, FaLocationDot, FaIdCard, FaUser } from "react-icons/fa6"

import useContext from "../../useContext"
import { SystemError } from "com/errors"
import logic from "../../logic/index"
import "./index.css"

export default function RegisterCustomer({ onCloseRegisterCustomer }) {
  const { alert } = useContext()
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    companyName: "",
    taxId: "",
    email: "",
    address: "",
    phone: ""
  })
  const [saving, setSaving] = useState(false)
  const isSavingRef = useRef(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleRegisterCustomerSubmit = (event) => {
    event.preventDefault()
    if (isSavingRef.current || saving) return

    const cleanUsername = (formData.username || "").trim()
    const cleanCompanyName = (formData.companyName || "").trim().replace(/\s+/g, " ")
    const cleanFullName = (formData.fullName || "").trim().replace(/\s+/g, " ") || cleanCompanyName
    const cleanTaxId = (formData.taxId || "").trim().toUpperCase()
    const cleanEmail = (formData.email || "").trim().toLowerCase()
    const cleanAddress = (formData.address || "").trim().replace(/\s+/g, " ")
    const cleanPhone = (formData.phone || "").replace(/[\s\-\.\(\)]/g, "").replace(/^(\+34|0034)/, "").trim()
    const password = formData.password

    if (!cleanCompanyName) {
      alert("Por favor, introduce la razón social o nombre de empresa.")
      return
    }
    if (!cleanTaxId) {
      alert("Por favor, introduce el CIF / NIF del cliente.")
      return
    }
    if (!cleanAddress) {
      alert("Por favor, introduce la dirección del cliente.")
      return
    }
    if (!cleanUsername) {
      alert("Por favor, introduce el nombre de usuario de acceso.")
      return
    }
    if (!password || password.length < 4) {
      alert("La contraseña debe tener al menos 4 caracteres.")
      return
    }
    if (!cleanEmail) {
      alert("Por favor, introduce un email válido.")
      return
    }
    if (!cleanPhone) {
      alert("Por favor, introduce un teléfono de contacto de 9 dígitos.")
      return
    }

    isSavingRef.current = true
    setSaving(true)

    try {
      //prettier-ignore
      logic
        .registerCustomer(cleanUsername, password, cleanFullName, cleanCompanyName, cleanEmail, cleanTaxId, cleanAddress, cleanPhone)
        .then(() => {
          isSavingRef.current = false
          setSaving(false)
          alert("Cliente registrado correctamente")
          onCloseRegisterCustomer()
        })
        .catch((error) => {
          isSavingRef.current = false
          setSaving(false)
          alert(error.message)
        })
    } catch (error) {
      isSavingRef.current = false
      setSaving(false)
      alert(error.message)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onCloseRegisterCustomer}></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-800">
              <FaUserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Registrar Nuevo Cliente
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Crea una cuenta y ficha para tu cliente
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCloseRegisterCustomer}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-all active:scale-95"
            title="Cerrar"
          >
            <FaXmark className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleRegisterCustomerSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-left">
            {/* Empresa y Fiscales */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Datos de la Empresa
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <FaBuilding className="text-slate-400 text-xs" /> Razón Social / Empresa *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    required
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Ej. Construcciones Gómez S.L."
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <FaIdCard className="text-slate-400 text-xs" /> CIF / NIF *
                  </label>
                  <input
                    type="text"
                    name="taxId"
                    required
                    value={formData.taxId}
                    onChange={handleChange}
                    placeholder="Ej. B98765432"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <FaLocationDot className="text-slate-400 text-xs" /> Dirección *
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Calle, número, código postal, localidad"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Acceso y Contacto */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Acceso de Usuario y Contacto
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <FaUser className="text-slate-400 text-xs" /> Usuario de Acceso *
                  </label>
                  <input
                    type="text"
                    name="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="usuario_cliente"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <FaLock className="text-slate-400 text-xs" /> Contraseña *
                  </label>
                  <input
                    type="password"
                    name="password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <FaUser className="text-slate-400 text-xs" /> Nombre de Contacto *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Ej. Juan Pérez"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <FaEnvelope className="text-slate-400 text-xs" /> Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="cliente@ejemplo.com"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <FaPhone className="text-slate-400 text-xs" /> Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="600000000"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-slate-100 bg-slate-50/80">
            <button
              type="button"
              onClick={onCloseRegisterCustomer}
              className="rounded-xl bg-slate-100 px-4 py-2 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-200 active:scale-95 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition-all disabled:opacity-50"
            >
              {saving ? "Registrando..." : "Registrar Cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
