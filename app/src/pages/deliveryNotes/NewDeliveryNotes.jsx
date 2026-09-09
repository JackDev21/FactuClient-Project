import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FaChevronRight, FaPlus, FaBuilding } from "react-icons/fa6"

import Header from "../../components/Header"
import Main from "../../components/core/Main"
import Footer from "../../components/core/Footer"
import SearchFilter from "../../components/SearchFilter"

import useContext from "../../useContext"
import { SystemError } from "com/errors"
import logic from "../../logic/index"

export default function NewDeliveryNotes() {
  const { alert } = useContext()

  const [customers, setCustomers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      //prettier-ignore
      logic.getAllCustomers()
        .then((customers) => {
          setCustomers(customers || [])
          setLoading(false)
        })
        .catch((error) => {
          setLoading(false)
          if (error instanceof SystemError) {
            alert(error.message)
          } else {
            alert("No hay clientes, añade uno para poder crear un albarán")
          }
        })
    } catch (error) {
      setLoading(false)
      alert(error.message)
    }
  }, [])

  const filterCustomers = () =>
    customers.filter((customer) => customer.companyName.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <>
      <Header>
        <h1>Crear Albarán</h1>
      </Header>

      <Main className="MainCreateDelivery">
        <div className="w-full max-w-lg mx-auto flex flex-col gap-3 sm:gap-4 px-3 sm:px-4">
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Paso 1: Selecciona un Cliente
            </span>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Elige el cliente para el que emitirás el nuevo albarán
            </p>
          </div>

          <SearchFilter
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            placeholder="Buscar por nombre o CIF..."
          />

          <div className="flex flex-col gap-2.5 w-full">
            {loading ? (
              <div className="flex flex-col gap-2.5 w-full">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-full rounded-2xl bg-white/80 p-4 border border-slate-200/70 shadow-xs animate-pulse flex items-center justify-between"
                  >
                    <div className="flex flex-col gap-2 flex-1 pr-4">
                      <div className="h-4 bg-slate-200 rounded-md w-1/2"></div>
                      <div className="h-3 bg-slate-100 rounded-md w-1/3"></div>
                    </div>
                    <div className="h-4 w-4 bg-slate-200 rounded-full"></div>
                  </div>
                ))}
              </div>
            ) : filterCustomers().length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-medium text-sm bg-white rounded-2xl border border-slate-200 p-6">
                No se encontraron clientes que coincidan con la búsqueda.
              </div>
            ) : (
              filterCustomers().map((customer) => (
                <Link
                  to={`/create/delivery-notes/${customer.id || customer._id}`}
                  key={customer.id || customer._id}
                  className="w-full flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition-all hover:shadow-md hover:border-amber-300 active:scale-98 text-left"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white font-black text-lg flex items-center justify-center shadow-xs shrink-0">
                      {customer?.companyName ? customer.companyName.charAt(0).toUpperCase() : "C"}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug break-words">
                        {customer.companyName}
                      </span>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400 mt-0.5 font-medium">
                        {customer.taxId && <span>{customer.taxId}</span>}
                        {customer.phone && <span>• 📞 {customer.phone}</span>}
                      </div>
                    </div>
                  </div>
                  <FaChevronRight className="text-slate-300 text-sm shrink-0 ml-2" />
                </Link>
              ))
            )}
          </div>
        </div>
      </Main>
      <Footer>FactuClient</Footer>
    </>
  )
}
