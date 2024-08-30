import Field from "../core/Field"
import Button from "../core/Button"

import "./index.css"

import useContext from "../../useContext"
import { SystemError } from "com/errors"

import logic from "../../logic/index"

export default function RegisterCustomer({ onCloseRegisterCustomer }) {
  const { alert } = useContext()

  const handleRegisterCustomerSubmit = (event) => {
    event.preventDefault()

    const target = event.target

    const username = target.username.value
    const password = target.password.value
    const fullName = target.fullName.value
    const companyName = target.companyName.value
    const taxId = target.taxId.value
    const email = target.email.value
    const address = target.address.value
    const phone = target.phone.value

    try {
      //prettier-ignore
      logic
        .registerCustomer(username, password, fullName, companyName, email, taxId, address, phone)
        .then(() => {
          onCloseRegisterCustomer()
        })
        .catch((error) => {
          if (error instanceof SystemError) {
            alert(error.message)
          }
          alert("Username ya existe.")
        })
    } catch (error) {
      alert(error.message)
    }
  }
  return (
    <>
      <form className="RegisterCustomerForm" onSubmit={handleRegisterCustomerSubmit}>
        <Field id="username" type="text" placeholder="Usuario"></Field>
        <Field id="password" type="text" placeholder="Contraseña"></Field>
        <Field id="fullName" type="text" placeholder="Nombre"></Field>
        <Field id="companyName" type="text" placeholder="Nombre Empresa"></Field>
        <Field id="taxId" type="text" placeholder="CIF/NIF"></Field>
        <Field id="email" type="email" placeholder="Email"></Field>
        <Field id="address" type="text" placeholder="Dirección"></Field>
        <Field id="phone" type="text" placeholder="Número de Móvil"></Field>
        <Button type="submit">Registrar Cliente</Button>
      </form>
    </>
  )
}
