import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FaXmark, FaUserPen, FaBuilding, FaPhone, FaEnvelope, FaCreditCard, FaPercent, FaLocationDot, FaIdCard, FaImage, FaUser } from "react-icons/fa6"

import useContext from "../../useContext"
import logic from "../../logic"
import extractPayloadJwt from "../../../utils/extractPayloadJwt"
import "./index.css"

export default function UpdateProfileForm({ onUpdateProfile, onCloseEditProfile }) {
  const navigate = useNavigate()
  const { alert } = useContext()
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

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      alert("La imagen no debe superar los 2MB de tamaño.")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        companyLogo: reader.result
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleUpdateProfileForm = (event) => {
    event.preventDefault()

    const cleanUsername = (formData.username || "").trim()
    const cleanEmail = (formData.email || "").trim().toLowerCase()
    const cleanFullName = (formData.fullName || "").trim().replace(/\s+/g, " ")
    const cleanCompanyName = (formData.companyName || "").trim().replace(/\s+/g, " ")
    const cleanAddress = (formData.address || "").trim().replace(/\s+/g, " ")
    const cleanTaxId = (formData.taxId || "").trim().toUpperCase()
    const cleanPhone = (formData.phone || "").replace(/[\s\-\.\(\)]/g, "").replace(/^(\+34|0034)/, "").trim()
    const cleanBankAccount = (formData.bankAccount || "").replace(/\s+/g, "").toUpperCase()
    const cleanLogo = (formData.companyLogo || "").trim()

    const irpfStr = String(formData.irpf || "0").replace(",", ".").trim()
    const irpfNum = parseFloat(irpfStr)

    if (isNaN(irpfNum) || irpfNum < 0 || irpfNum > 100) {
      alert("El IRPF debe ser un porcentaje válido entre 0 y 100.")
      return
    }

    if (cleanLogo && !cleanLogo.startsWith("http://") && !cleanLogo.startsWith("https://") && !cleanLogo.startsWith("data:image/")) {
      alert("El logotipo debe ser una URL válida (http:// o https://) o un archivo de imagen.")
      return
    }

    const updates = {
      username: cleanUsername,
      email: cleanEmail,
      fullName: cleanFullName,
      companyName: cleanCompanyName,
      address: cleanAddress,
      taxId: cleanTaxId,
      phone: cleanPhone,
      bankAccount: cleanBankAccount,
      irpf: irpfNum,
      companyLogo: cleanLogo,
    }

    setSaving(true)

    try {
      // prettier-ignore
      logic.updateProfile(updates)
        .then(() => {
          setSaving(false)
          alert("Perfil de empresa actualizado correctamente")
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
                      <FaImage className="text-slate-400 text-xs" /> Logotipo de Empresa (Opcional)
                    </label>

                    <div className="flex flex-col gap-2.5">
                      {formData.companyLogo && (
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={formData.companyLogo}
                              alt="Vista previa logo"
                              className="h-10 w-auto max-w-[100px] object-contain rounded-lg bg-white p-1 border border-slate-200 shadow-xs shrink-0"
                            />
                            <span className="text-xs font-medium text-slate-500 truncate">
                              {formData.companyLogo.startsWith("data:image") ? "Imagen cargada en el perfil" : formData.companyLogo}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, companyLogo: "" }))}
                            className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-all shrink-0 ml-2"
                          >
                            Quitar
                          </button>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all shadow-xs active:scale-95 shrink-0">
                          <span>📁 Subir imagen</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </label>
                        <input
                          type="text"
                          name="companyLogo"
                          value={formData.companyLogo.startsWith("data:image") ? "" : formData.companyLogo}
                          onChange={handleChange}
                          placeholder="o escribe una URL: https://ejemplo.com/logo.png"
                          className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>
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
