import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import { TfiSave } from "react-icons/tfi"
import { FiPlusSquare } from "react-icons/fi"
import { IoIosAddCircleOutline } from "react-icons/io"

import logic from "../../logic/index"

import Header from "../Header"
import Main from "../core/Main"
import Footer from "../core/Footer"
import Time from "../core/Time"
import Field from "../core/Field"

import "./CreateDeliveryNotes.css"

export default function CreateDeliveryNotes() {
  const { customerId } = useParams()
  const [deliveryNote, setDeliveryNote] = useState(null)
  const [total, setTotal] = useState(0)
  const [showFormWork, setShowFormWork] = useState(false)
  const [deliveryNoteUpdated, setDeliveryNoteUpdated] = useState(null)
  const [showObservationInput, setShowObservationInput] = useState(false)
  const [isEditingDate, setIsEditingDate] = useState(false)

  useEffect(() => {
    try {
      //prettier-ignore
      logic.createDeliveryNote(customerId)
        .then((deliveryNote)=>{
          setDeliveryNote(deliveryNote)
        })
        .catch((error)=> alert(error.message))
    } catch (error) {
      alert(error.message)
    }
  }, [customerId])

  const handleCreateWork = (event) => {
    event.preventDefault()

    const target = event.target
    let concept = target.concept.value.trim()
    const quantity = parseFloat(target.quantity.value)
    const price = parseFloat(target.price.value)

    concept = concept.replace(/\s+/g, ' ')

    try {
      //prettier-ignore
      logic.createWork(deliveryNote.id, concept, quantity, price)
        .then((deliveryNoteUpdated) => {
          setDeliveryNoteUpdated(deliveryNoteUpdated)

          setShowFormWork(!showFormWork)

          const calculateTotal = deliveryNoteUpdated.works.reduce((accumulator, work) => accumulator + work.quantity * work.price, 0)
          setTotal(calculateTotal)

        })
        .catch((error) => {
          alert(error.message)
        })
    } catch (error) {
      alert(error.message)
    }
  }

  const handleAddObservation = (event) => {
    event.preventDefault()

    const target = event.target
    const observation = target.observation.value.trim()

    try {
      //prettier-ignore
      logic.addNewObservation(deliveryNote.id, observation)
        .then((deliveryNoteUpdated) => {
          setDeliveryNote(prevState => ({...prevState, observations: deliveryNoteUpdated.observations}))

          setDeliveryNoteUpdated(prevState => ({...prevState, observations: deliveryNoteUpdated.observations}))

          setShowObservationInput(!showObservationInput)
        })
        .catch((error) => {
          alert(error.message)
        })
    } catch (error) {
      alert(error.message)
    }
  }

  const handleShowFormWork = () => {
    setShowFormWork(!showFormWork)
  }

  const handleShowObservationInput = () => {
    setShowObservationInput(!showObservationInput)
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

    try {
      //prettier-ignore
      logic.updateDeliveryNoteDate( deliveryNote.id, convertToISODate(date) )
        .then((deliveryNoteUpdated) => {
          setDeliveryNoteUpdated((prevState) => ({ ...prevState,  deliveryNoteUpdated }))
          setIsEditingDate(false)
        })
        .catch((error) => {
          alert(error.message)
        })
    } catch (error) {
      alert(error.message)
    }
  }

  const toggleEditDate = () => {
    setIsEditingDate(!isEditingDate)
  }

  return (
    <>
      <Header>{deliveryNote?.company?.companyName && deliveryNote.company.companyName}</Header>
      <Main>
        <div className="DeliveryInfoCustomer">
          {deliveryNote?.customer && <p>{deliveryNote.customer.companyName}</p>}
          {deliveryNote?.customer && <p>{deliveryNote.customer.address}</p>}
          {deliveryNote?.customer && <p>{deliveryNote.customer.taxId}</p>}
        </div>
        <div className="DeliveryWork">
          <div className="TitleDateContainer">
            {deliveryNote?.number && <p className="DeliveryNumber">Albarán nº:{deliveryNote.number}</p>}
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
          {deliveryNoteUpdated?.works &&
            deliveryNoteUpdated.works.map((work) => (
              <div className="DeliveryWorkInfo" key={work.id}>
                <p className="DeliveryWorkConcept">{work.concept}</p>
                <div className="DeliveryQuantityPrice">
                  <div className="QuantityContainer">
                    <p className="Quantity">{work.quantity?.toFixed(2)}</p>
                  </div>
                  <div className="PriceContainer">
                    <p className="Price">{work.price?.toFixed(2)}</p>
                  </div>
                  <div className="TotalContainer">
                    <p className="Total">{(work.quantity * work.price).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}

          {showFormWork && (
            <form className="FormWorkContainer" onSubmit={handleCreateWork}>
              <Field className="FormWorkConcept" id="concept" type="text" placeholder="Introduce concepto"></Field>
              <Field className="FormWorkQuantity" id="quantity" type="text" placeholder="Cantidad"></Field>
              <Field className="FormWorkPrice" id="price" type="text" placeholder="Precio"></Field>

              <div className="ContainerSaveButton">
                <button type="submit" className="SaveWorkButton">
                  <TfiSave />
                </button>
              </div>
            </form>
          )}

          <FiPlusSquare className="AddWorkButton" onClick={handleShowFormWork} />

          {showObservationInput && (
            <form className="observationInput" onSubmit={handleAddObservation}>
              <textarea
                className="z-20 flex w-[80%] p-1"
                id="observation"
                type="text"
                placeholder="Introduce observación"
              ></textarea>

              <div className="ContainerSaveButton">
                <button type="submit" className="SaveWorkButton">
                  <TfiSave />
                </button>
              </div>
            </form>
          )}

          <div className="ObservationsContainer">
            {deliveryNote?.customer && (
              <ul>
                <li className="mb-4 flex cursor-pointer gap-4" onClick={handleShowObservationInput}>
                  <IoIosAddCircleOutline className="rounded-lg text-2xl shadow-custom-shadow" /> Observaciones:
                </li>
                <li>{deliveryNote.observations}</li>
              </ul>
            )}
          </div>
          <div className="DeliveryTotal">TOTAL: {total.toFixed(2)} € </div>
        </div>
      </Main>
      <Footer>FactuClient</Footer>
    </>
  )
}
