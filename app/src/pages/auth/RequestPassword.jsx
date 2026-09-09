import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import useContext from "../../useContext"

import { NotFoundError, SystemError } from "com/errors"

import Title from "../../components/Title"
import Main from "../../components/core/Main"
import Field from "../../components/core/Field"
import Button from "../../components/core/Button"
import Footer from "../../components/core/Footer"

import logic from "../../logic"

export default function RequestPassword() {
  const { alert } = useContext()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleRequestPasswordReset = (event) => {
    event.preventDefault()

    const target = event.target
    const email = target.email.value

    try {
      setLoading(true)
      logic.requestPasswordReset(email)
        .then(() => {
          alert("Te hemos enviado un correo con las instrucciones para restablecer tu contraseña. Por favor, revisa tu bandeja de entrada o spam.")
          navigate("/login")
        })
        .catch((error) => {
          if (error instanceof NotFoundError) {
            alert("No existe ninguna cuenta registrada con este correo electrónico.")
          } else if (error instanceof SystemError) {
            alert("Error al conectar con el servidor de correo. Por favor, inténtalo más tarde.")
          } else {
            alert(error.message || "Error al procesar la solicitud.")
          }
        })
        .finally(() => {
          setLoading(false)
        })
    } catch (error) {
      setLoading(false)
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
          <Button className="mt-10" type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Enviar"}
          </Button>

          <Link to="/login" className="mt-6 text-sm font-semibold text-stone-500 hover:text-stone-800 underline">
            Volver a iniciar sesión
          </Link>
        </form>
      </Main>

      <Footer />
    </>
  )
}
