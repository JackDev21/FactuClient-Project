import { useEffect, useState } from "react"

import Header from "../../components/Header"
import Main from "../../components/core/Main"
import Footer from "../../components/core/Footer"

import { FaUserPen } from "react-icons/fa6"

import logic from "../../logic"
import extractPayloadJwt from "../../../utils/extractPayloadJwt"

import "./UserProfile.css"

export default function UserProfile() {
  const [user, setUser] = useState(null)

  const { sub: userId } = extractPayloadJwt(sessionStorage.token)

  useEffect(() => {
    try {
      //prettier-ignore
      logic.getProfileUser(userId)
        .then((user) => {
          setUser(user)
        })
        .catch((error) => {
          alert(error.message)
        })
    } catch (error) {
      alert(error.message)
    }
  }, [userId])

  return (
    <>
      <Header className="HeaderProfile z-10" iconLeftHeader={<FaUserPen />}>
        <h1>Mi Perfil</h1>
      </Header>

      <Main className="MainProfile">
        <div className="w-full max-w-xl sm:max-w-2xl mx-auto flex flex-col gap-3.5 sm:gap-4 px-3 sm:px-4">
          {/* Tarjeta de Identidad / Cabecera de Perfil */}
          <div className="w-full flex flex-col items-center text-center rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs gap-3">
            {user?.companyLogo ? (
              <img
                className="h-16 w-auto max-w-[180px] object-contain rounded-xl p-1 border border-slate-200/80 bg-slate-50 shadow-xs"
                src={user.companyLogo}
                alt="Logo Empresa"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white font-black text-2xl flex items-center justify-center shadow-sm border border-amber-300/40">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : (user?.username ? user.username.charAt(0).toUpperCase() : "U")}
              </div>
            )}

            <div className="flex flex-col items-center">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {user?.fullName || user?.username || "Usuario"}
              </h1>
              {user?.companyName && (
                <p className="text-xs sm:text-sm font-bold text-amber-700 mt-0.5">
                  {user.companyName}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                @{user?.username || "admin"}
              </span>
              {user?.irpf !== undefined && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
                  IRPF: {user.irpf}%
                </span>
              )}
            </div>
          </div>

          {/* Tarjeta 1: Datos Fiscales y de Empresa */}
          <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 text-left">
              Datos Fiscales y de Empresa
            </span>

            <div className="flex flex-col gap-2.5 text-xs sm:text-sm text-left">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="font-semibold text-slate-500">🏢 Empresa:</span>
                <span className="font-bold text-slate-900 text-right">{user?.companyName || "No especificado"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="font-semibold text-slate-500">🆔 CIF / NIF:</span>
                <span className="font-bold text-slate-900 text-right">{user?.taxId || "No especificado"}</span>
              </div>
              <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                <span className="font-semibold text-slate-500 shrink-0">📍 Dirección Fiscal:</span>
                <span className="font-bold text-slate-900 text-right ml-2">{user?.address || "No especificada"}</span>
              </div>
              <div className="flex justify-between items-center pt-0.5">
                <span className="font-semibold text-slate-500">📊 Retención IRPF:</span>
                <span className="font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-lg border border-orange-200/80">{user?.irpf || 0} %</span>
              </div>
            </div>
          </div>

          {/* Tarjeta 2: Contacto y Facturación */}
          <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 text-left">
              Contacto y Datos Bancarios
            </span>

            <div className="flex flex-col gap-2.5 text-xs sm:text-sm text-left">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="font-semibold text-slate-500">📞 Teléfono:</span>
                {user?.phone ? (
                  <a href={`tel:${user.phone}`} className="font-bold text-blue-600 hover:underline text-right">{user.phone}</a>
                ) : (
                  <span className="font-bold text-slate-400">No especificado</span>
                )}
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="font-semibold text-slate-500">✉️ Email:</span>
                {user?.email ? (
                  <a href={`mailto:${user.email}`} className="font-bold text-blue-600 hover:underline text-right truncate max-w-[200px] sm:max-w-xs">{user.email}</a>
                ) : (
                  <span className="font-bold text-slate-400">No especificado</span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5 pt-0.5">
                <span className="font-semibold text-slate-500 shrink-0">💳 Cuenta Bancaria (IBAN):</span>
                <span className="font-bold font-mono text-slate-900 text-xs sm:text-sm tracking-wider bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-center sm:text-right whitespace-nowrap">
                  {user?.bankAccount || "No especificada"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Main>
      <Footer>FactuClient</Footer>
    </>
  )
}
