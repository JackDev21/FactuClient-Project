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
          setInvoices(invoices)
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
