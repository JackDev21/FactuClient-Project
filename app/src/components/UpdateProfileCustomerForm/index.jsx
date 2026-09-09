import { useState, useEffect } from "react"
import { FaXmark, FaUserPen, FaBuilding, FaPhone, FaEnvelope, FaLock, FaLocationDot, FaIdCard, FaUser } from "react-icons/fa6"

import useContext from "../../useContext"
import logic from "../../logic"
import "./index.css"

export default function UpdateCustomerProfileForm({ onUpdateProfile, onCloseEditProfile, customer }) {
  const { alert } = useContext()
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    companyName: "",
    email: "",
    taxId: "",
    address: "",
    phone: ""
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (customer) {
      setFormData({
        username: customer.username || "",
        password: "",
        fullName: customer.fullName || "",
        companyName: customer.companyName || "",
        email: customer.email || "",
        taxId: customer.taxId || "",
        address: customer.address || "",
        phone: customer.phone || ""
      })
    }
  }, [customer])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleUpdateCustomerProfileForm = (event) => {
    event.preventDefault()
    setSaving(true)

    const updates = {
      username: (formData.username || "").trim(),
      companyName: (formData.companyName || "").trim().replace(/\s+/g, " "),
      fullName: (formData.fullName || "").trim().replace(/\s+/g, " "),
      taxId: (formData.taxId || "").trim().toUpperCase(),
      email: (formData.email || "").trim().toLowerCase(),
      address: (formData.address || "").trim().replace(/\s+/g, " "),
      phone: (formData.phone || "").replace(/[\s\-\.\(\)]/g, "").replace(/^(\+34|0034)/, "").trim(),
    }

    // Si hay contraseña nueva y válida, la enviamos
    if (formData.password && formData.password.trim()) {
      if (formData.password.length < 4) {
        setSaving(false)
        alert("La nueva contraseña debe tener al menos 4 caracteres.")
        return
      }
      updates.password = formData.password
    }

    try {
      // prettier-ignore
      logic.updateCustomerProfile(customer.id || customer._id, updates)
        .then(() => {
          setSaving(false)
          alert("Datos del cliente actualizados correctamente")
          if (onUpdateProfile) onUpdateProfile()
        })
        .catch((error) => {
          setSaving(false)
          alert(error.message)
        })
    } catch (error) {
      setSaving(false)
      alert(error.message)
    }
  }

  const handleClose = () => {
    if (onCloseEditProfile) {
      onCloseEditProfile()
    } else if (onUpdateProfile) {
      onUpdateProfile()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={handleClose}></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <FaUserPen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Editar Datos del Cliente
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {customer?.companyName || "Actualizar información"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-all active:scale-95"
            title="Cerrar"
          >
            <FaXmark className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleUpdateCustomerProfileForm} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-left">
            {/* Empresa y Fiscales */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Datos de la Empresa
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <FaBuilding className="text-slate-400 text-xs" /> Razón Social / Empresa
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <FaIdCard className="text-slate-400 text-xs" /> CIF / NIF
                  </label>
                  <input
                    type="text"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <FaLocationDot className="text-slate-400 text-xs" /> Dirección Fiscal
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Usuario y Contacto */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Usuario y Contacto
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <FaUser className="text-slate-400 text-xs" /> Usuario
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <FaLock className="text-slate-400 text-xs" /> Cambiar Contraseña (Opcional)
                  </label>
                  <input
                    type="password"
                    name="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Dejar en blanco para conservar"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <FaEnvelope className="text-slate-400 text-xs" /> Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-slate-100 bg-slate-50/80">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl bg-slate-100 px-4 py-2 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-200 active:scale-95 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-sm hover:from-amber-600 hover:to-orange-600 active:scale-95 transition-all disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
