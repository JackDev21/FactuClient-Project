import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import useContext from "../../useContext"
import { SystemError } from "com/errors"

import Header from "../Header"
import Main from "../core/Main"
import Footer from "../core/Footer"
import Button from "../core/Button"
import Time from "../core/Time"
import MonthFilter from "../MonthFilter"

import logic from "../../logic/index"

import SearchFilter from "../SearchFilter"

export default function NewInvoice() {
  const { alert } = useContext()

  const navigate = useNavigate()

  const [customers, setCustomers] = useState([])
  const [showCustomerList, setShowCustomerList] = useState(true)
  const [deliveryNotes, setDeliveryNotes] = useState([])
  const [selectedDeliveryNotes, setSelectedDeliveryNotes] = useState([])
  const [customerId, setCustomerId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")

  const filterCustomers = () =>
    customers.filter((customer) => customer.companyName.toLowerCase().includes(searchTerm.toLowerCase()))

  useEffect(() => {
    try {
      //prettier-ignore
      logic
        .getAllCustomers()
        .then((customers) => {
          setCustomers(customers)
        })
        .catch((error) => {
          if (error instanceof SystemError) {
            alert(error.message)
          }
        })
    } catch (error) {
      alert(error.message)
    }
  }, [])

  const handleDeliveryNotesCustomer = (customerId) => {
    try {
      //prettier-ignore
      logic
        .getAllDeliveryNotesCustomer(customerId)
        .then((deliveryNotes) => {
          setDeliveryNotes(deliveryNotes)
          setShowCustomerList(!showCustomerList)
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

  const handleCheckboxChange = (deliveryNoteId) => {
    // Actualizamos el estado de los albaranes seleccionados
    setSelectedDeliveryNotes((prevSelected) => {
      // Creamos una nueva lista de albaranes seleccionados
      let newSelected

      // Si el albarán ya está en la lista de seleccionados, lo quitamos
      if (prevSelected.includes(deliveryNoteId)) {
        newSelected = prevSelected.filter((id) => id !== deliveryNoteId)
      } else {
        // Si el albarán no está en la lista de seleccionados, lo añadimos
        newSelected = [...prevSelected, deliveryNoteId]
      }

      // Devolvemos la nueva lista de albaranes seleccionados para actualizar el estado
      return newSelected
    })
  }

  const handleCreateInvoice = () => {
    if (selectedDeliveryNotes.length === 0) {
      alert("Por favor, selecciona al menos un albarán.")
      return
    }
    try {
      //prettier-ignore
      logic
        .createInvoice(customerId, selectedDeliveryNotes)
        .then(() => {
          navigate(-1)
          alert("Factura creada correctamente")
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

  const handleCustomerSelect = (id) => {
    setCustomerId(id)
    handleDeliveryNotesCustomer(id)
  }

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value)
  }

  const filteredDeliveryNotes = deliveryNotes.filter((deliveryNote) => {
    if (!selectedMonth) return true
    const noteMonth = new Date(deliveryNote.date).getMonth() + 1
    return noteMonth === parseInt(selectedMonth, 10)
  })

  return (
    <>
      <Header className="z-10">
        <div>
          {showCustomerList ? (
            <div>
              <p>Crear Factura</p>
              <p>Selecciona Un Cliente</p>
            </div>
          ) : (
            <div>
              <p>Selecciona Albaran</p>
              <p>a facturar</p>
            </div>
          )}
        </div>
      </Header>
      <Main>
        {showCustomerList ? (
          <>
            <SearchFilter
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              placeholder="Buscar por nombre de cliente"
            />
            <ul className="CustomerList">
              {filterCustomers().map((customer) => (
                <li key={customer.id} className="Customer" onClick={() => handleCustomerSelect(customer.id)}>
                  {customer?.companyName}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="relative top-7 -mt-16 flex flex-col items-center rounded-lg p-6">
            <MonthFilter selectedMonth={selectedMonth} handleMonthChange={handleMonthChange} />
            <ul className="w-full text-[0.9rem]">
              {filteredDeliveryNotes.map((deliveryNote) => (
                <li
                  key={deliveryNote.id}
                  className="mb-4 flex cursor-pointer flex-wrap gap-2 rounded-lg bg-blue-50 p-2 shadow-md transition duration-300 hover:bg-blue-100"
                >
                  <input
                    className="h-6 w-6 cursor-pointer rounded border-gray-400 text-blue-600 focus:ring-blue-500"
                    type="checkbox"
                    checked={selectedDeliveryNotes.includes(deliveryNote.id)}
                    onChange={() => handleCheckboxChange(deliveryNote.id)}
                  />
                  <Time className="font-medium">{deliveryNote.date}</Time>&nbsp;
                  <p className="font-bold">
                    Nº{deliveryNote.number} - {deliveryNote.customer.companyName}
                  </p>
                </li>
              ))}
            </ul>
            <Button onClick={() => handleCreateInvoice()} className="w-auto transition duration-300">
              Generar Factura
            </Button>
          </div>
        )}
      </Main>
      <Footer>FactuClient</Footer>
    </>
  )
}
