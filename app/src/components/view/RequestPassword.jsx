import { useNavigate } from "react-router-dom"
import useContext from "../../useContext"

import { SystemError } from "com/errors"

import Title from "../Title"
import Main from "../core/Main"
import Field from "../core/Field"
import Button from "../core/Button"
import Footer from "../core/Footer"

import logic from "../../logic"

export default function RequestPassword() {
  const { alert } = useContext()
  const navigate = useNavigate()

  const handleRequestPasswordReset = (event) => {
    event.preventDefault()

    const target = event.target
    const email = target.email.value

    try {
      // prettier-ignore
      logic.requestPasswordReset(email)
        .then(() => {
          navigate("/login")
        })
        .catch((error) => {
          if(error instanceof SystemError) {
            alert(error.message)
          }
          alert("Invalid email")
        })
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <>
      <div className="Header">
        <Title level={1} className="FactuClient">
          FACTUCLIENT
        </Title>
      </div>

      <Main>
        <div className="w-[80%] text-center font-medium">
          <p>Introduce tu email para recordar tu contraseña.</p>
          <p>Te enviaremos un email con un enlace para restablecer tu contraseña.</p>
        </div>

        <form className="flex flex-col items-center" onSubmit={handleRequestPasswordReset}>
          <Field label="Email" id="email" type="email" placeholder="Introduce tu Email" />
          <Button className="mt-10" type="submit">
            Enviar
          </Button>
        </form>
      </Main>

      <Footer />
    </>
  )
}
