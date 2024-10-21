import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import Field from "../core/Field"
import Button from "../core/Button"

import "./index.css"

import logic from "../../logic"
import extractPayloadJwt from "../../../utils/extractPayloadJwt"

export default function UpdateProfileForm({ onUpdateProfile }) {
  const navigate = useNavigate()
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    let payload
    try {
      if (sessionStorage.token) {
        payload = extractPayloadJwt(sessionStorage.token)
        setUserId(payload.sub)
      }
    } catch (error) {
      alert(error.message)
    }
  }, [])

  const handleUpdateProfileForm = (event) => {
    event.preventDefault()

    const target = event.target

    const username = target.username.value.trim()
    const email = target.email.value
    const fullName = target.fullName.value
    const companyName = target.companyName.value
    const address = target.address.value
    const taxId = target.taxId.value
    const phone = target.phone.value
    const bankAccount = target.bankAccount.value
    const companyLogo = target.companyLogo.value
    const irpf = parseFloat(target.irpf.value)

    const updates = {
      username,
      email,
      fullName,
      companyName,
      address,
      taxId,
      phone,
      bankAccount,
      companyLogo,
      irpf
    }

    try {
      // prettier-ignore
      logic.updateProfile(updates)
        .then(() => {
          onUpdateProfile() // Llama a la función de actualización pasada como prop
          navigate("/")
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
      <form className="UpdateProfileForm" onSubmit={handleUpdateProfileForm}>
        <Field id="companyLogo" type="text" placeholder="url logo empresa" required={false}></Field>
        <Field id="username" type="text" placeholder="Nombre de usuario" required={false}></Field>
        <Field id="fullName" type="text" placeholder="Nombre" required={false}></Field>
        <Field id="companyName" type="text" placeholder="Nombre Empresa" required={false}></Field>
        <Field id="taxId" type="text" placeholder="CIF/NIF" required={false}></Field>
        <Field id="email" type="email" placeholder="Email" required={false}></Field>
        <Field id="address" type="text" placeholder="Dirección" required={false}></Field>
        <Field id="phone" type="text" placeholder="Número de Móvil" required={false}></Field>
        <Field id="bankAccount" type="text" placeholder="IBAN" required={false}></Field>
        <Field id="irpf" type="number" placeholder="IRPF" required={false}></Field>

        <Button type="submit">Actualizar</Button>
      </form>
    </>
  )
}
