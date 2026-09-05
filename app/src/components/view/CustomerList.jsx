import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { PiUserListBold } from "react-icons/pi"
import { PiUserCirclePlusBold } from "react-icons/pi"
import { FaChevronDown, FaChevronRight } from "react-icons/fa6"


import useContext from "../../useContext"
import { SystemError } from "com/errors"

import Header from "../Header"
import Footer from "../core/Footer"
import Main from "../core/Main"

import logic from "../../logic/index"

import "./CustomerList.css"
import SearchFilter from "../SearchFilter"

const PAGE_SIZE = 8

export default function CustomerList() {
  const [customers, setCustomers] = useState([])
  const [refresh, setRefresh] = useState(0)
  const { alert } = useContext()
  const [searchTerm, setSearchTerm] = useState("")
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const filterCustomers = () =>
    customers.filter((customer) =>
      (customer.companyName || customer.fullName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )

  const loadCustomers = () => {
    try {
      // prettier-ignore
      logic.getAllCustomers()
        .then((customers) => {
          setCustomers(customers)
        })
        .catch((error) => {
          if (error instanceof SystemError) {
            alert(error.message)
          }
          alert("Todavía no hay clientes, Añade tu primer cliente")
        })
    } catch (error) {
      console.error(error.message)
      alert(error.message)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [refresh])

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [searchTerm])

  const filteredCustomers = filterCustomers()
  const visibleCustomers = filteredCustomers.slice(0, visibleCount)

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE)
  }

  const handleRegisterCustomerSubmitted = () => {
    setRefresh(Date.now())
  }

  return (
    <>
      <Header
        iconLeftHeader={<PiUserCirclePlusBold />}
        iconUser={<PiUserListBold />}
        onRegisterCustomer={handleRegisterCustomerSubmitted}
      >
        Listado Clientes
      </Header>

      <Main>
        <div className="w-full max-w-xl flex flex-col items-center gap-3.5 px-3">
          <SearchFilter
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            placeholder="Busca cliente o empresa..."
          />

          <div className="flex w-full justify-between items-center px-1 text-xs sm:text-sm font-semibold text-slate-200">
            <span className="rounded-full bg-slate-900/60 px-3.5 py-1.5 backdrop-blur">
              Total: {customers.length} clientes
            </span>
            <span className="rounded-full bg-slate-900/60 px-3.5 py-1.5 backdrop-blur">
              Mostrando: {visibleCustomers.length}
            </span>
          </div>

          <ul className="CustomerList">
            {visibleCustomers.map((customer) => (
              <Link to={`/customers/profile/${customer.id}`} key={customer.id} className="CustomerLink">
                <li className="CustomerCard border-l-4 border-l-orange-500">
                  <div className="flex flex-col items-start gap-1.5 flex-1 pr-2">
                    <span className="text-base font-bold text-slate-900 text-left leading-snug">
                      {customer.companyName || customer.fullName || "Cliente"}
                    </span>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                      {customer.taxId && (
                        <span>NIF/CIF: {customer.taxId}</span>
                      )}
                      {customer.phone && (
                        <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                          📞 {customer.phone}
                        </span>
                      )}
                    </div>
                  </div>
                  <FaChevronRight className="text-sm text-slate-400 shrink-0 ml-1" />
                </li>
              </Link>
            ))}

            {filteredCustomers.length === 0 && (
              <div className="w-full rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center backdrop-blur">
                <p className="text-base font-medium text-slate-500">
                  No se encontraron clientes con el criterio de búsqueda.
                </p>
              </div>
            )}
          </ul>

          {/* Botón Cargar Más con Contador de Alto Contraste */}
          {visibleCount < filteredCustomers.length && (
            <div className="flex w-full flex-col items-center gap-2.5 py-3">
              <button
                onClick={handleLoadMore}
                className="flex items-center gap-2 rounded-2xl bg-orange-500 px-7 py-3 text-base font-bold text-white shadow-md transition-all active:scale-95 hover:bg-orange-600 hover:shadow-lg"
              >
                <span>Cargar más clientes</span>
                <FaChevronDown className="text-xs" />
              </button>
              <span className="rounded-full bg-slate-900/80 px-4 py-1.5 text-xs sm:text-sm font-semibold text-slate-100 backdrop-blur shadow-sm">
                Mostrando {visibleCustomers.length} de {filteredCustomers.length} clientes
              </span>
            </div>
          )}
        </div>
      </Main>

      <Footer>FactuClient</Footer>
    </>
  )
}
