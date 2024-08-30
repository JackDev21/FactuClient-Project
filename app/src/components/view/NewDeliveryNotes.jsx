import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

import Header from "../Header"
import Main from "../core/Main"
import Footer from "../core/Footer"
import SearchFilter from "../SearchFilter"

import useContext from "../../useContext"
import { SystemError } from "com/errors"

import logic from "../../logic/index"

export default function NewDeliveryNotes() {
  const { alert } = useContext()

  const [customers, setCustomers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    try {
      //prettier-ignore
      logic.getAllCustomers()
        .then((customers) => {
          setCustomers(customers)
        })
        .catch((error) => {
          if (error instanceof SystemError) {
            alert(error.message)
          }
          alert("No hay clientes, añade uno para poder crear un albarán")
        })
    } catch (error) {
      alert(error.message)
    }
  }, [])

  const filterCustomers = () =>
    customers.filter((customer) => customer.companyName.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <>
      <Header>
        <div>
          <p>Crear Albarán</p>
          <p>Selecciona Un Cliente</p>
        </div>
      </Header>
      <Main className="MainCreateDelivery">
        <SearchFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder="Buscar por nombre de cliente"
        />
        <ul className="CustomerList">
          {filterCustomers().map((customer) => (
            <Link to={`/create/delivery-notes/${customer.id}`} key={customer.id}>
              {customer?.companyName && <li className="Customer">{customer.companyName}</li>}
            </Link>
          ))}
        </ul>
      </Main>
      <Footer>FactuClient</Footer>
    </>
  )
}
