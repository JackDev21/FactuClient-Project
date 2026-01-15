import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { LiaFileInvoiceSolid } from "react-icons/lia"

import useContext from "../../useContext"
import { SystemError } from "com/errors"

import Header from "../Header"
import Main from "../core/Main"
import Footer from "../core/Footer"

import logic from "../../logic"

import "./InvoiceList.css"
import SearchFilter from "../SearchFilter"

export default function InvoiceList() {
  const { alert } = useContext()

  const [invoices, setInvoices] = useState([])
  const [searchTerm, setSearchTerm] = useState("")

  const filterInvoices = () =>
    invoices.filter(
      (invoice) =>
        invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customer.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    )

  useEffect(() => {
    try {
      //prettier-ignore
      logic.getAllInvoices()
        .then((invoices) => {
          // Asegurar orden correlativo por `number` en formato YYYY/NNN
          const sorted = invoices.slice().sort((a, b) => {
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
          alert("No hay Facturas para este cliente")
        })
    } catch (error) {
      alert(error.message)
    }
  }, [])

  return (
    <>
      <Header className="HeaderInvoices" iconUser={<LiaFileInvoiceSolid />}>
        Facturas
      </Header>
      <Main>
        <SearchFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder="Buscar por número o nombre de Factura"
        />
        <ul className="InvoiceList">
          {filterInvoices().map((invoice) => (
            <Link className="InvoiceLink" key={invoice.id} to={`/invoices/${invoice.id}`}>
              <li className="Invoice" key={invoice.id}>
                {invoice?.number && <p>F/Nº: {invoice.number}</p>}
                {invoice?.customer && <p>&nbsp;{invoice.customer.companyName}</p>}
              </li>
            </Link>
          ))}
        </ul>
      </Main>
      <Footer>FactuClient</Footer>
    </>
  )
}
