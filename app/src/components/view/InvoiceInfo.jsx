import { useParams } from "react-router-dom"
import { useEffect, useState, Fragment } from "react"
import { useNavigate } from "react-router-dom"

import { PDFDownloadLink } from "@react-pdf/renderer"
import { FaRegFilePdf } from "react-icons/fa6"
import { FaSpinner } from "react-icons/fa"

import { MdDeleteForever } from "react-icons/md"

import Header from "../Header"
import Main from "../core/Main"
import Title from "../Title"
import Confirm from "../Confirm"
import InvoicePDF from "./InvoicePDF"

import logic from "../../logic/index"

import "./InvoiceInfo.css"
import Time from "../core/Time"

export default function InvoiceInfo() {
  const navigate = useNavigate()

  const { invoiceId } = useParams()
  const [invoice, setInvoice] = useState(null)
  const [isEditingPaymentType, setIsEditingPaymentType] = useState(false)
  const [editedPaymentType, setEditedPaymentType] = useState("")
  const [total, setTotal] = useState(0)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [iva, setIva] = useState(0)
  const [isEditingDate, setIsEditingDate] = useState(false)
  const [editedDate, setEditedDate] = useState("")

  useEffect(() => {
    if (invoice?.date) {
      setEditedDate(new Date(invoice.date).toISOString().split("T")[0])
    }
  }, [invoice])

  useEffect(() => {
    try {
      //prettier-ignore
      logic.getInvoice(invoiceId)
        .then((invoice) => {
          setInvoice(invoice)

          const calculateTotal = invoice.deliveryNotes.reduce((accumulator, deliveryNote) => {
            return accumulator + deliveryNote.works.reduce((acc, work) => acc + work.quantity * work.price, 0)
          }, 0)

          setTotal(calculateTotal)
          setIva(calculateTotal * 0.21) 
        })
        .catch((error) => {
          alert(error.message)
        })
    } catch (error) {
      alert(error.message)
    }
  }, [invoiceId])

  const handleDeleteInvoice = () => {
    try {
      //prettier-ignore
      logic.deleteInvoice(invoiceId)
        .then(() => {
          navigate(-1)
        })
        .catch((error) => {
          alert(error.message)
        })
    } catch (error) {
      alert(error.message)
    }
  }

  const handleShowConfirmDelete = () => {
    setShowConfirmDelete(!showConfirmDelete)
  }

  const irpfPercentage = invoice?.company.irpf || 0 // Porcentaje de IRPF del perfil del usuario
  const irpfAmount = total * (irpfPercentage / 100) // Cálculo del IRPF

  return (
    <>
      <Header
        iconLeftHeader={logic.getInfo().role === "user" && <MdDeleteForever />}
        className="InvoiceHeader"
        onDeleteInvoice={handleShowConfirmDelete}
      >
        <Title className="TitleInvoice" level={2}>
          Factura Nº: {invoice?.number && invoice.number}
          {invoice?.customer && <p>{invoice.customer.companyName}</p>}
        </Title>
      </Header>

      <Main className="MainInvoiceInfo">
        <div className="DataContainer">
          <div className="CompanyData">
            {invoice?.company && (
              <ul>
                <li>{invoice.company.companyName}</li>
                <li>{invoice.company.address}</li>
                <li>{invoice.company.taxId}</li>
                <li>{invoice.company.email}</li>
                <li>{invoice.company.phone}</li>
              </ul>
            )}
          </div>

          <div className="CustomerData">
            <p className="DataText">DATOS CLIENTE:</p>
            {invoice?.customer && (
              <ul>
                <li>{invoice.customer.companyName}</li>
                <li>{invoice.customer.address}</li>
                <li>{invoice.customer.taxId}</li>
                <li>{invoice.customer.email}</li>
                <li>{invoice.customer.phone}</li>
              </ul>
            )}
          </div>
        </div>
        <div className="InvoiceContainer">
          <div className="NumberDateContainer">
            {invoice?.number && <p className="InvoiceNumber">Fra.Nº: {invoice.number}</p>}
            {invoice?.date && (
              <div className="InvoiceDate">
                {isEditingDate ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={editedDate}
                      onChange={(e) => setEditedDate(e.target.value)}
                      className="rounded border p-1"
                    />
                    <button
                      onClick={() => {
                        logic
                          .updateInvoiceDate(invoiceId, editedDate)
                          .then((updated) => {
                            setInvoice((prev) => ({ ...prev, date: updated.date }))
                            setIsEditingDate(false)
                          })
                          .catch((error) => alert(error.message))
                      }}
                      className="text-sm text-blue-600"
                    >
                      Guardar
                    </button>
                    <button onClick={() => setIsEditingDate(false)} className="text-sm text-gray-600">
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Time>{invoice.date}</Time>
                    <button onClick={() => setIsEditingDate(true)} className="text-sm text-blue-600">
                      Editar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="HeaderTable">
            <div>Concepto</div>
            <div className="HeaderTotal">
              <div className="QuantityHeader">Cantidad</div>
              <div>Precio</div>
              <div>Total</div>
            </div>
          </div>
          <div className="BodyTable">
            {invoice?.deliveryNotes.map((deliveryNote) => (
              <Fragment>
                <div className="BodyInfo">
                  {deliveryNote?.number && (
                    <div className="InvoiceNumber">
                      A/Nº {deliveryNote.number} <Time>{deliveryNote.date}</Time>
                    </div>
                  )}
                </div>
                {deliveryNote?.works.map((work) => (
                  <div className="Info" key={work.id}>
                    <div className="w-[41rem]">{work.concept}</div>
                    <div className="QuantityInfo">
                      <div className="QuantityBody">{work.quantity.toFixed(2)}</div>
                      <div className="PriceWork">{work.price.toFixed(2)}</div>
                      <div className="ml-2">{(work.quantity * work.price).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </Fragment>
            ))}
          </div>
        </div>
        <p className="InvoiceTotal">TOTAL: {total.toFixed(2)} € </p>
        <p className="InvoiceTotal">21% IVA: {iva.toFixed(2)} € </p>
        {irpfAmount > 0 && (
          <p className="InvoiceTotal">
            {irpfPercentage}% IRPF: {irpfAmount.toFixed(2)} €
          </p>
        )}
        <p className="InvoiceTotal">TOTAL con IVA: {(total + iva - irpfAmount).toFixed(2)} € </p>
        <div className="PaymentType">
          {isEditingPaymentType ? (
            <div className="flex items-center gap-2">
              <select
                value={editedPaymentType}
                onChange={(e) => setEditedPaymentType(e.target.value)}
                className="rounded border p-1"
              >
                <option value="Transferencia">Transferencia</option>
                <option value="Efectivo">Efectivo</option>
              </select>
              <button
                onClick={() => {
                  logic
                    .updateInvoicePaymentType(invoiceId, editedPaymentType)
                    .then((updated) => {
                      setInvoice((prev) => ({ ...prev, paymentType: updated.paymentType }))
                      setIsEditingPaymentType(false)
                    })
                    .catch((error) => alert(error.message))
                }}
                className="text-sm text-blue-600"
              >
                Guardar
              </button>
              <button onClick={() => setIsEditingPaymentType(false)} className="text-sm text-gray-600">
                Cancelar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p>Forma de pago: {invoice?.paymentType || "Transferencia"} </p>
              <button
                onClick={() => {
                  setIsEditingPaymentType(true)
                  setEditedPaymentType(invoice?.paymentType || "Transferencia")
                }}
                className="text-sm text-blue-600"
              >
                Editar
              </button>
            </div>
          )}
          {invoice?.company && <p>{invoice.company.bankAccount}</p>}
        </div>
        {showConfirmDelete && (
          <Confirm handleDeleteInvoice={handleDeleteInvoice} setShowConfirmDelete={handleShowConfirmDelete} />
        )}

        {invoice && (
          <PDFDownloadLink
            className="PDFDownloadLink"
            document={
              <InvoicePDF
                invoice={invoice}
                total={total}
                iva={iva}
                irpfAmount={irpfAmount}
                irpfPercentage={irpfPercentage}
              />
            }
            fileName={`invoice-${invoice.number}.pdf`}
          >
            {({ loading }) => (loading ? <FaSpinner /> : <FaRegFilePdf />)}
          </PDFDownloadLink>
        )}
      </Main>
    </>
  )
}
