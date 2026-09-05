import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FaXmark, FaUserPen, FaBuilding, FaPhone, FaEnvelope, FaCreditCard, FaPercent, FaLocationDot, FaIdCard, FaImage, FaUser } from "react-icons/fa6"

import logic from "../../logic"
import extractPayloadJwt from "../../../utils/extractPayloadJwt"
import "./index.css"

export default function UpdateProfileForm({ onUpdateProfile, onCloseEditProfile }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    companyName: "",
    address: "",
    taxId: "",
    phone: "",
    bankAccount: "",
    companyLogo: "",
    irpf: 0
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    try {
      if (sessionStorage.token) {
        const payload = extractPayloadJwt(sessionStorage.token)
        logic.getProfileUser(payload.sub)
          .then((user) => {
            if (user) {
              setFormData({
                username: user.username || "",
                email: user.email || "",
                fullName: user.fullName || "",
                companyName: user.companyName || "",
                address: user.address || "",
                taxId: user.taxId || "",
                phone: user.phone || "",
                bankAccount: user.bankAccount || "",
                companyLogo: user.companyLogo || "",
                irpf: user.irpf !== undefined ? user.irpf : 0
              })
            }
            setLoading(false)
          })
          .catch((error) => {
            alert(error.message)
            setLoading(false)
          })
      }
    } catch (error) {
      alert(error.message)
      setLoading(false)
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleUpdateProfileForm = (event) => {
    event.preventDefault()
    setSaving(true)

    const updates = {
      ...formData,
      username: formData.username.trim(),
      irpf: parseFloat(formData.irpf) || 0
    }

    try {
      // prettier-ignore
      logic.updateProfile(updates)
        .then(() => {
          setSaving(false)
          if (onUpdateProfile) onUpdateProfile()
          navigate("/users/profile")
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
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={handleClose}></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <FaUserPen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Editar Datos de Perfil
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Actualiza los datos fiscales y de facturación
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

        {/* Modal Form */}
        <form onSubmit={handleUpdateProfileForm} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-left">
            {loading ? (
              <div className="py-12 text-center text-slate-400 font-medium text-sm">
                Cargando datos del perfil...
              </div>
            ) : (
              <>
                {/* Sección 1: Datos de Empresa */}
                <div className="space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Empresa y Datos Fiscales
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                        <FaBuilding className="text-slate-400 text-xs" /> Nombre Empresa
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Ej. Mi Empresa S.L."
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
                        placeholder="Ej. B12345678"
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
                      placeholder="Calle, número, código postal, ciudad"
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <FaPercent className="text-slate-400 text-xs" /> % Retención IRPF (Opcional)
                    </label>
                    <input
                      type="number"
                      step="any"
                      name="irpf"
                      value={formData.irpf}
                      onChange={handleChange}
                      placeholder="0"
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Sección 2: Usuario y Contacto */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Usuario y Contacto
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                        <FaUser className="text-slate-400 text-xs" /> Nombre de Usuario
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="usuario"
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                        <FaUser className="text-slate-400 text-xs" /> Nombre y Apellidos
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Tu nombre completo"
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
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
                        placeholder="correo@ejemplo.com"
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
                        placeholder="600000000"
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Sección 3: Banco y Logo */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Bancarios y Marca
                  </span>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <FaCreditCard className="text-slate-400 text-xs" /> Cuenta Bancaria (IBAN)
                    </label>
                    <input
                      type="text"
                      name="bankAccount"
                      value={formData.bankAccount}
                      onChange={handleChange}
                      placeholder="ESXX XXXX XXXX XXXX XXXX XXXX"
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs sm:text-sm font-medium font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <FaImage className="text-slate-400 text-xs" /> URL Logo de Empresa (Opcional)
                    </label>
                    <input
                      type="text"
                      name="companyLogo"
                      value={formData.companyLogo}
                      onChange={handleChange}
                      placeholder="https://ejemplo.com/logo.png"
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Modal Footer */}
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
