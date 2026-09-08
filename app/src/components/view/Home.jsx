import { useState, useEffect } from "react"
import { Link, Navigate } from "react-router-dom"

import logic from "../../logic/index"

import { FaUserEdit, FaSpinner } from "react-icons/fa"
import { PiUsersThreeBold, PiClockCountdownBold } from "react-icons/pi"
import { LiaFileInvoiceDollarSolid } from "react-icons/lia"
import { GiStabbedNote } from "react-icons/gi"
import { FaPlus, FaChevronRight, FaFileShield } from "react-icons/fa6"

import Header from "../Header"
import Main from "../core/Main"
import Footer from "../core/Footer"

import "./Home.css"

export default function Home() {
  const [userName, setUserName] = useState("")
  const [stats, setStats] = useState({
    customersCount: 0,
    pendingDeliveryCount: 0,
    invoicesCount: 0,
    loading: true
  })

  useEffect(() => {
    try {
      logic.getUserName()
        .then((name) => setUserName(name))
        .catch(() => {})

      Promise.allSettled([
        logic.getAllCustomers(),
        logic.getAllDeliveryNotes(),
        logic.getAllInvoices()
      ]).then(([custRes, delivRes, invRes]) => {
        const customers = custRes.status === "fulfilled" && Array.isArray(custRes.value) ? custRes.value : []
        const deliveryNotes = delivRes.status === "fulfilled" && Array.isArray(delivRes.value) ? delivRes.value : []
        const invoices = invRes.status === "fulfilled" && Array.isArray(invRes.value) ? invRes.value : []

        setStats({
          customersCount: customers.length,
          pendingDeliveryCount: deliveryNotes.filter((d) => !d.isInvoiced).length,
          invoicesCount: invoices.length,
          loading: false
        })
      })
    } catch (error) {
      console.error(error)
    }
  }, [])

  const { role, userId } = logic.getInfo()
  if (role === "customer") {
    return <Navigate to={`/customer/${userId}/info`} />
  }

  return (
    <>
      <Header iconUser={<FaUserEdit />}>{userName || "FactuClient"}</Header>

      <Main className="MainHome">
        <div className="w-full max-w-md flex flex-col justify-evenly flex-1 gap-3 sm:gap-4 px-3 sm:px-4 py-1">
          {/* Fila de Métricas Rápidas en Vivo */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
            <Link to="/customers" className="StatCard border-t-4 border-t-blue-500">
              <div className="flex flex-col items-center text-center">
                <span className="text-xl sm:text-2xl font-black text-slate-900 flex items-center justify-center min-h-[28px] sm:min-h-[32px]">
                  {stats.loading ? (
                    <FaSpinner className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 animate-spin" />
                  ) : (
                    stats.customersCount
                  )}
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-slate-500 mt-0.5">
                  Clientes
                </span>
              </div>
            </Link>

            <Link to="/delivery-notes" className="StatCard border-t-4 border-t-amber-500">
              <div className="flex flex-col items-center text-center">
                <span className="text-xl sm:text-2xl font-black text-amber-600 flex items-center justify-center min-h-[28px] sm:min-h-[32px]">
                  {stats.loading ? (
                    <FaSpinner className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 animate-spin" />
                  ) : (
                    stats.pendingDeliveryCount
                  )}
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-slate-500 mt-0.5">
                  Pendientes
                </span>
              </div>
            </Link>

            <Link to="/invoices" className="StatCard border-t-4 border-t-emerald-500">
              <div className="flex flex-col items-center text-center">
                <span className="text-xl sm:text-2xl font-black text-emerald-600 flex items-center justify-center min-h-[28px] sm:min-h-[32px]">
                  {stats.loading ? (
                    <FaSpinner className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 animate-spin" />
                  ) : (
                    stats.invoicesCount
                  )}
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-slate-500 mt-0.5">
                  Facturas
                </span>
              </div>
            </Link>
          </div>

          {/* Tarjeta: Clientes */}
          <Link to="/customers" className="DashboardCardLink">
            <div className="DashboardCard border-l-4 border-l-blue-600">
              <div className="flex items-center gap-3.5">
                <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-2xl sm:text-3xl text-blue-600 shadow-xs">
                  <PiUsersThreeBold />
                </div>
                <div className="flex flex-col text-left gap-0.5">
                  <span className="text-base sm:text-lg font-extrabold text-slate-900">Listado de Clientes</span>
                  <span className="text-xs sm:text-sm font-medium text-slate-500">Gestiona tu cartera de clientes</span>
                </div>
              </div>
              <FaChevronRight className="text-sm text-slate-400 shrink-0" />
            </div>
          </Link>

          {/* Tarjeta: Facturas */}
          <Link to="/invoices" className="DashboardCardLink">
            <div className="DashboardCard border-l-4 border-l-emerald-600">
              <div className="flex items-center gap-3.5">
                <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-2xl sm:text-3xl text-emerald-600 shadow-xs">
                  <LiaFileInvoiceDollarSolid />
                </div>
                <div className="flex flex-col text-left gap-0.5">
                  <span className="text-base sm:text-lg font-extrabold text-slate-900">Facturas</span>
                  <span className="text-xs sm:text-sm font-medium text-slate-500">Consulta y genera facturas en PDF</span>
                </div>
              </div>
              <FaChevronRight className="text-sm text-slate-400 shrink-0" />
            </div>
          </Link>

          {/* Tarjeta: Albaranes */}
          <Link to="/delivery-notes" className="DashboardCardLink">
            <div className="DashboardCard border-l-4 border-l-amber-500">
              <div className="flex items-center gap-3.5">
                <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-2xl sm:text-3xl text-amber-600 shadow-xs">
                  <GiStabbedNote />
                </div>
                <div className="flex flex-col text-left gap-0.5">
                  <span className="text-base sm:text-lg font-extrabold text-slate-900">Albaranes</span>
                  <span className="text-xs sm:text-sm font-medium text-slate-500">Control de servicios y entregas</span>
                </div>
              </div>
              <FaChevronRight className="text-sm text-slate-400 shrink-0" />
            </div>
          </Link>

          {/* Tarjeta: Documentos DeCA (Transporte Oficial) */}
          <Link to="/deca" className="DashboardCardLink">
            <div className="DashboardCard border-l-4 border-l-slate-900">
              <div className="flex items-center gap-3.5">
                <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-2xl sm:text-3xl text-amber-400 shadow-xs">
                  <FaFileShield />
                </div>
                <div className="flex flex-col text-left gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-extrabold text-slate-900">DeCA Digital</span>
                    <span className="rounded-md bg-amber-100 text-amber-900 text-[10px] font-black px-1.5 py-0.5 border border-amber-300">
                      OCT 2026
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-slate-500">Control administrativo y QR para transporte</span>
                </div>
              </div>
              <FaChevronRight className="text-sm text-slate-400 shrink-0" />
            </div>
          </Link>

          {/* Sección de Acciones Rápidas */}
          <div className="flex w-full flex-col gap-2">
            <span className="text-left text-xs font-extrabold uppercase tracking-wider text-slate-500 px-1">
              Acciones Rápidas
            </span>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/create/delivery-notes" className="QuickActionLink">
                <div className="QuickActionButton bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md hover:from-orange-600 hover:to-amber-600">
                  <FaPlus className="text-xs" />
                  <span className="text-xs sm:text-sm font-bold">Crear Albarán</span>
                </div>
              </Link>

              <Link to="/create/invoices" className="QuickActionLink">
                <div className="QuickActionButton bg-slate-900 text-white shadow-md hover:bg-slate-800">
                  <FaPlus className="text-xs" />
                  <span className="text-xs sm:text-sm font-bold">Crear Factura</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </Main>

      <Footer>FactuClient</Footer>
    </>
  )
}



