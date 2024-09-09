import Field from "../core/Field"
import Button from "../core/Button"

import "./index.css"

import logic from "../../logic"

export default function UpdateCustomerProfileForm({ onUpdateProfile, customer }) {
  const handleUpdateCustomerProfileForm = (event) => {
    event.preventDefault()

    const target = event.target

    const username = target.username.value.trim()
    const password = target.password.value
    const fullName = target.fullName.value
    const email = target.email.value
    const companyName = target.companyName.value
    const address = target.address.value
    const taxId = target.taxId.value
    const phone = target.phone.value

    const updates = {
      username,
      password,
      fullName,
      email,
      companyName,
      taxId,
      address,
      phone
    }

    try {
      // prettier-ignore
      logic.updateCustomerProfile(customer.id, updates)
        .then(() => {
          onUpdateProfile()
        })
        .catch((error) => {
          alert(error.message)
        })
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <>
      <form className="UpdateProfileForm" onSubmit={handleUpdateCustomerProfileForm}>
        <Field id="username" type="text" placeholder="Usuario" required={false} value="Añade un usuario"></Field>
        <Field id="password" type="text" placeholder="Contraseña" required={false}></Field>
        <Field id="fullName" type="text" placeholder="Nombre" required={false} value="Añade un nombre"></Field>
        <Field id="companyName" type="text" placeholder="Nombre Empresa" required={false}></Field>
        <Field id="taxId" type="text" placeholder="CIF/NIF" required={false}></Field>
        <Field id="email" type="email" placeholder="Email" required={false}></Field>
        <Field id="address" type="text" placeholder="Dirección" required={false}></Field>
        <Field id="phone" type="text" placeholder="Número de Móvil" required={false}></Field>

        <Button type="submit">Actualizar</Button>
      </form>
    </>
  )
}
