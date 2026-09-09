import { useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"

import useContext from "../../useContext"
import { CredentialsError, SystemError } from "com/errors"

import Title from "../../components/Title"
import Main from "../../components/core/Main"
import Button from "../../components/core/Button"
import Footer from "../../components/core/Footer"
import PasswordField from "../../components/PasswordField"

import logic from "../../logic"

export default function ResetPassword() {
  const { alert } = useContext()
  const navigate = useNavigate()
  const { userId, token } = useParams()
  const [loading, setLoading] = useState(false)

  const handlePasswordReset = (event) => {
    event.preventDefault()

    const target = event.target
    const password = target.password.value
    const repeatPassword = target.confirmPassword.value

    try {
      setLoading(true)
      logic
        .resetPassword(userId, password, repeatPassword, token)
        .then(() => {
          alert("¡Contraseña restablecida con éxito! Ya puedes iniciar sesión con tu nueva contraseña.")
          navigate("/login")
        })
        .catch((error) => {
          const msg = (error.message || "").toLowerCase()
          if (error instanceof CredentialsError || msg.includes("jwt") || msg.includes("token") || msg.includes("expired")) {
            alert("El enlace ha caducado o no es válido. Por favor, solicita un nuevo correo de restablecimiento.")
          } else if (error instanceof SystemError) {
            alert("Error al conectar con el servidor. Inténtalo de nuevo más tarde.")
          } else {
            alert(error.message || "Error al restablecer la contraseña.")
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
          <p>Introduce tu nueva contraseña.</p>
        </div>

        <form className="-mt-5 flex flex-col items-center" onSubmit={handlePasswordReset}>
          <PasswordField id="password" type="password" placeholder="Password" />
          <PasswordField id="confirmPassword" type="password" placeholder="Repite tu Password" />
          <Button className="mt-10" type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Enviar"}
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
