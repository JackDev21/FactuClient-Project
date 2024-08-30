import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"

import { RiFileUserLine } from "react-icons/ri"
import { GiExitDoor } from "react-icons/gi"
import { TiArrowBack } from "react-icons/ti"

import useContext from "../../useContext"
import { SystemError } from "com/errors"

import Header from "../Header"
import Main from "../core/Main"
import Footer from "../core/Footer"
import ProfileInfoItem from "../ProfileItemInfo"
import Button from "../core/Button"

import logic from "../../logic/index"

export default function CustomerInfo() {
  const { alert } = useContext()
  const navigate = useNavigate()

  const { customerId } = useParams()
  const [customer, setCustomer] = useState(null)
  const [deliveryNotes, setDeliveryNotes] = useState([])
  const [invoices, setInvoices] = useState([])
  const [showCustomerData, setShowCustomerData] = useState("Data")

  const handleLogout = () => {
    logic.logoutUser()
    navigate("/login")
  }

  const handleBack = () => {
    navigate(-1)
  }

  useEffect(() => {
    try {
      //prettier-ignore
      logic.getProfileUser(customerId)
        .then((customer) => { 
          setCustomer(customer) 
        })
        .catch((error) => {
          alert(error.message)
        })
    } catch (error) {
      alert(error.message)
    }
  }, [customerId])

  const handleGetAllInvoicesCustomer = () => {
    try {
      setShowCustomerData("Invoices")
      //prettier-ignore
      logic.getAllInvoicesCustomer(customerId)
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
  }

  const handleGetAllDeliveryNotesCustomer = () => {
    try {
      setShowCustomerData("DeliveryNotes")
      //prettier-ignore
      logic.getAllDeliveryNotesCustomer(customerId)
        .then((deliveryNotes) => {
          setDeliveryNotes(deliveryNotes)
        })
        .catch((error) => {
          if (error instanceof SystemError) {
            alert(error.message)
          }
          alert("No hay Albaranes para este cliente")
        })
    } catch (error) {
      alert(error.message)
    }
  }

  const handleBackToData = () => {
    setShowCustomerData("Data")
  }

  return (
    <>
      <Header
        iconLeftHeader={<GiExitDoor />}
        showBackButton={false}
        onLogout={handleLogout}
        onBack={handleBack}
        iconUser={<RiFileUserLine />}
      >
        {customer?.companyName && customer.companyName}
      </Header>

      <Main className="CustomerProfile Info">
        {showCustomerData === "Data" && (
          <>
            <div className="mt-7">
              <ProfileInfoItem label="UserName " value={customer?.username} />
              <ProfileInfoItem label="Nombre " value={customer?.fullName} />
              <ProfileInfoItem label="Empresa" value={customer?.companyName} />
              <ProfileInfoItem label="Email" value={customer?.email} />
              <ProfileInfoItem label="CIF/NIF" value={customer?.taxId} />
              <ProfileInfoItem label="Nº Móvil" value={customer?.phone} />
              <ProfileInfoItem label="Dirección	" value={customer?.address} />

              <div className="mt-10 flex w-full justify-center gap-12">
                <Button onClick={handleGetAllInvoicesCustomer} className="CustomerButtons">
                  Facturas
                </Button>
                <Button onClick={handleGetAllDeliveryNotesCustomer} className="CustomerButtons">
                  Albaranes
                </Button>
              </div>
            </div>
          </>
        )}

        {showCustomerData === "DeliveryNotes" && (
          <>
            <TiArrowBack className="absolute right-2 top-2 text-7xl" onClick={handleBackToData} />
            <ul className="mt-7">
              {deliveryNotes.map((deliveryNote) => (
                <Link className="DeliveryLink" to={`/delivery-notes/${deliveryNote.id}`} key={deliveryNote.id}>
                  <li className="DeliveryNote">
                    {deliveryNote?.number && <p>A/Nº: {deliveryNote.number}</p>}
                    {deliveryNote?.customer && <p>&nbsp;{deliveryNote.customer.companyName}</p>}
                  </li>
                </Link>
              ))}
            </ul>
          </>
        )}

        {showCustomerData === "Invoices" && (
          <>
            <TiArrowBack className="absolute right-2 top-2 text-7xl" onClick={handleBackToData} />
            <ul className="mt-7">
              {invoices.map((invoice) => (
                <Link className="InvoiceLink" key={invoice.id} to={`/invoices/${invoice.id}`}>
                  <li className="Invoice" key={invoice.id}>
                    {invoice?.number && <p>F/Nº: {invoice.number}</p>}
                    {invoice?.customer && <p>&nbsp;{invoice.customer.companyName}</p>}
                  </li>
                </Link>
              ))}
            </ul>
          </>
        )}
      </Main>
      <Footer>FactuClient</Footer>
    </>
  )
}
