import { useState } from "react"
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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleRegisterCustomerSubmit = (event) => {
    event.preventDefault()
    setSaving(true)

    const { username, password, fullName, companyName, taxId, email, address, phone } = formData

    try {
      //prettier-ignore
      logic
        .registerCustomer(username.trim(), password, fullName, companyName, email, taxId, address, phone)
        .then(() => {
          setSaving(false)
          onCloseRegisterCustomer()
        })
        .catch((error) => {
          setSaving(false)
          if (error instanceof SystemError) {
            alert(error.message)
          } else {
            alert(error.message)
          }
        })
    } catch (error) {
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
                  <FaUser className="text-slate-400 text-xs" /> Nombre de Contacto
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Persona de contacto"
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
                    <FaPhone className="text-slate-400 text-xs" /> Teléfono
                  </label>
                  <input
                    type="text"
                    name="phone"
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
