import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { FaRegFilePdf } from "react-icons/fa6"
import { FaSpinner } from "react-icons/fa"
import { TfiSave } from "react-icons/tfi"

import { GiStabbedNote } from "react-icons/gi"
import { MdDeleteForever } from "react-icons/md"

import useContext from "../../useContext"
import { SystemError } from "com/errors"

import Header from "../Header"
import Main from "../core/Main"
import Time from "../core/Time"
import Footer from "../core/Footer"
import Confirm from "../Confirm"
import DeliveryNotePDF from "./DeliveryNotePDF"

import logic from "../../logic/index"

import "./DeliveryInfo.css"

export default function DeliveryInfo() {
  const { alert } = useContext()

  const navigate = useNavigate()
  const { deliveryNoteId } = useParams()
  const [deliveryNote, setDeliveryNote] = useState(null)
  const [total, setTotal] = useState(0)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [isEditingDate, setIsEditingDate] = useState(false)

  useEffect(() => {
    try {
      //prettier-ignore
      logic
        .getDeliveryNote(deliveryNoteId)
        .then((deliveryNote) => {
          setDeliveryNote(deliveryNote)

          const calculateTotal = deliveryNote.works.reduce(
            (accumulator, work) => accumulator + work.quantity * work.price, 0)
          setTotal(calculateTotal)
        })
        .catch((error) => {
          if (error instanceof SystemError) {
            alert(error.message)
          }
        })
    } catch (error) {
      alert(error.message)
    }
  }, [deliveryNoteId])

  const handleDeleteDeliveryNote = () => {
    try {
      //prettier-ignore
      logic
        .deleteDeliveryNote(deliveryNoteId)
        .then(() => {
          navigate(-1)
        })
        .catch((error) => {
          if (error instanceof SystemError) {
            alert(error.message)
          }
        })
    } catch (error) {
      alert(error.message)
    }
  }

  const handleShowConfirmDelete = () => {
    setShowConfirmDelete(!showConfirmDelete)
  }

  const handleDateChange = (event) => {
    const newDate = event.target.value
    setDeliveryNote((prevState) => ({
      ...prevState,
      date: newDate
    }))
  }

  const handleUpdateDeliveryNoteDate = (event) => {
    event.preventDefault()

    const target = event.target
    const date = target.date.value

    const convertToISODate = (date) => {
      const [day, month, year] = date.split("-")
      return `${year}/${month}/${day}`
    }

    const isoDate = convertToISODate(date)

    try {
      //prettier-ignore
      logic.updateDeliveryNoteDate(deliveryNote.id, isoDate)
      .then((deliveryNoteUpdated) => {
        setDeliveryNote(deliveryNoteUpdated)
        setIsEditingDate(false)
        navigate(-1)

      })
      .catch((error) => {
        console.error("Error en la actualización:", error.message)
        alert(error.message)
      })
    } catch (error) {
      console.error("Error en el try-catch:", error.message)
      alert(error.message)
    }
  }

  const toggleEditDate = () => {
    setIsEditingDate(!isEditingDate)
  }

  return (
    <>
      <Header
        iconUser={<GiStabbedNote />}
        iconLeftHeader={logic.getInfo().role === "user" && <MdDeleteForever />}
        className={"HeaderDeliveryInfo"}
        onDeleteDeliveryNote={handleShowConfirmDelete}
      ></Header>

      <Main className={"MainDeliveryInfo"}>
        <div className="DeliveryInfoCustomer">
          {deliveryNote?.customer && (
            <ul className="flex flex-col items-center">
              <li>{deliveryNote.customer.companyName}</li>
              <li>{deliveryNote.customer.address}</li>
              <li>{deliveryNote.customer.taxId}</li>
            </ul>
          )}
        </div>
        <div className="DeliveryWork">
          <div className="TitleDateContainer">
            {deliveryNote?.number && <p className="DeliveryNumber">Albarán nº: {deliveryNote.number}</p>}
            {isEditingDate ? (
              <form onSubmit={handleUpdateDeliveryNoteDate}>
                <input type="date" id="date" value={deliveryNote?.date} onChange={handleDateChange} />
                <button type="submit">
                  <TfiSave />
                </button>
              </form>
            ) : (
              <p onClick={toggleEditDate} className="DeliveryDate">
                {deliveryNote?.date && <Time>{deliveryNote.date}</Time>}
              </p>
            )}
          </div>
          <div className="DeliveryTitleInfo">
            <h6>Concepto</h6>
            <div className="DeliveryTitleQuantityPrice">
              <h6>Cantidad</h6> <h6>Precio</h6> <h6>Total</h6>
            </div>
          </div>
          {deliveryNote?.works &&
            deliveryNote.works.map((work) => (
              <div className="DeliveryWorkInfo" key={work._id}>
                <p className="DeliveryWorkConcept">{work.concept}</p>
                <div className="DeliveryQuantityPrice">
                  <div className="QuantityContainer">
                    <p className="Quantity">{work.quantity.toFixed(2)}</p>
                  </div>
                  <div className="PriceContainer">
                    <p className="Price">{work.price.toFixed(2)}</p>
                  </div>
                  <div className="TotalContainer">
                    <p className="Total">{(work.quantity * work.price).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          <div className="ObservationsContainer">
            {deliveryNote?.customer && (
              <ul>
                <li className="Observations">Observaciones:</li>
                <li>{deliveryNote.observations}</li>
              </ul>
            )}
          </div>
          <div className="DeliveryTotal">TOTAL: {total.toFixed(2)} €</div>
        </div>

        {showConfirmDelete && (
          <Confirm handleDeleteDeliveryNote={handleDeleteDeliveryNote} setShowConfirmDelete={handleShowConfirmDelete} />
        )}

        {deliveryNote && (
          <PDFDownloadLink
            className="PDFDownloadLink"
            document={<DeliveryNotePDF deliveryNote={deliveryNote} total={total} />}
            fileName={`delivery-note-${deliveryNote.number}.pdf`}
          >
            {({ loading }) => (loading ? <FaSpinner /> : <FaRegFilePdf />)}
          </PDFDownloadLink>
        )}
      </Main>

      <Footer>FactuClient</Footer>
    </>
  )
}
