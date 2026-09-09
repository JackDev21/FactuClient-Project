import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { LiaFileInvoiceSolid } from "react-icons/lia"
import { FaChevronDown } from "react-icons/fa6"

import useContext from "../../useContext"
import { SystemError } from "com/errors"

import Header from "../../components/Header"
import Main from "../../components/core/Main"
import Footer from "../../components/core/Footer"

import logic from "../../logic"

import "./InvoiceList.css"
import SearchFilter from "../../components/SearchFilter"

const PAGE_SIZE = 8

export default function InvoiceList() {
  const { alert } = useContext()

  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useEffect(() => {
    setLoading(true)
    try {
      logic.getAllInvoices()
        .then((invoices) => {
          // Asegurar orden correlativo por `number`
          const sorted = (invoices || []).slice().sort((a, b) => {
            const parseNumber = (num) => {
              if (!num) return { year: 0, seq: 0 }
              const [y, s] = num.split("/")
              return { year: parseInt(y, 10) || 0, seq: parseInt(s, 10) || 0 }
            }

            const na = parseNumber(a.number)
            const nb = parseNumber(b.number)

            if (na.year !== nb.year) return nb.year - na.year
            return nb.seq - na.seq
          })

          setInvoices(sorted)
        })
        .catch((error) => {
          if (error instanceof SystemError) {
            alert(error.message)
          }
          setInvoices([])
        })
        .finally(() => {
          setLoading(false)
        })
    } catch (error) {
      setLoading(false)
      alert(error.message)
    }
  }, [])

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.customer?.companyName || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [searchTerm])

  const visibleInvoices = filteredInvoices.slice(0, visibleCount)

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE)
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    })
  }

  return (
    <>
      <Header className="HeaderInvoices" iconUser={<LiaFileInvoiceSolid />}>
        Facturas
      </Header>
      <Main>
        <div className="w-full max-w-xl flex flex-col items-center gap-3.5 px-3">
          <SearchFilter
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            placeholder="Buscar por nº o cliente..."
          />

          <div className="flex w-full justify-between items-center px-1 text-xs sm:text-sm font-semibold text-slate-200">
            <span className="rounded-full bg-slate-900/60 px-3.5 py-1.5 backdrop-blur">
              {loading ? "Cargando facturas..." : `Total: ${invoices.length} facturas`}
            </span>
            <span className="rounded-full bg-slate-900/60 px-3.5 py-1.5 backdrop-blur">
              {loading ? "..." : `Mostrando: ${visibleInvoices.length}`}
            </span>
          </div>

          <ul className="InvoiceList">
            {loading ? (
              <div className="flex flex-col gap-2.5 w-full">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-full rounded-2xl bg-white/80 p-4 border border-slate-200/70 shadow-xs animate-pulse flex items-center justify-between"
                  >
                    <div className="flex flex-col gap-2 flex-1 pr-4">
                      <div className="h-4 bg-slate-200 rounded-md w-2/5"></div>
                      <div className="h-3 bg-slate-100 rounded-md w-3/5"></div>
                    </div>
                    <div className="h-6 w-20 bg-slate-200 rounded-full"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {visibleInvoices.map((invoice) => (
                  <Link className="InvoiceLink" key={invoice.id} to={`/invoices/${invoice.id}`}>
                    <li className="InvoiceCard border-l-4 border-l-blue-600">
                      <div className="flex flex-col items-start gap-1 flex-1 pr-2">
                        <span className="text-base font-bold text-slate-900">
                          F/Nº: {invoice.number}
                        </span>
                        <span className="text-sm font-semibold text-slate-600 text-left leading-snug">
                          {invoice.customer?.companyName || "Cliente"}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs font-bold text-blue-700">
                          {formatDate(invoice.date)}
                        </span>
                      </div>
                    </li>
                  </Link>
                ))}

                {filteredInvoices.length === 0 && (
                  <div className="w-full rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center backdrop-blur">
                    <p className="text-base font-medium text-slate-500">
                      No se encontraron facturas con el criterio de búsqueda.
                    </p>
                  </div>
                )}
              </>
            )}
          </ul>

          {/* Botón Cargar Más con Contador de Alto Contraste */}
          {visibleCount < filteredInvoices.length && (
            <div className="flex w-full flex-col items-center gap-2.5 py-3">
              <button
                onClick={handleLoadMore}
                className="flex items-center gap-2 rounded-2xl bg-orange-500 px-7 py-3 text-base font-bold text-white shadow-md transition-all active:scale-95 hover:bg-orange-600 hover:shadow-lg"
              >
                <span>Cargar más facturas</span>
                <FaChevronDown className="text-xs" />
              </button>
              <span className="rounded-full bg-slate-900/80 px-4 py-1.5 text-xs sm:text-sm font-semibold text-slate-100 backdrop-blur shadow-sm">
                Mostrando {visibleInvoices.length} de {filteredInvoices.length} facturas
              </span>
            </div>
          )}
        </div>
      </Main>
      <Footer>FactuClient</Footer>
    </>
  )
}

