import { useNavigate, useParams } from "react-router-dom"

import useContext from "../../useContext"
import { SystemError } from "com/errors"

import Title from "../Title"
import Main from "../core/Main"
import Button from "../core/Button"
import Footer from "../core/Footer"
import PasswordField from "../PasswordField"

import logic from "../../logic"

export default function ResetPassword() {
  const { alert } = useContext()
  const navigate = useNavigate()
  const { userId, token } = useParams()

  const handlePasswordReset = (event) => {
    event.preventDefault()

    const target = event.target
    const password = target.password.value
    const repeatPassword = target.confirmPassword.value

    try {
      logic
        .resetPassword(userId, password, repeatPassword, token)
        .then(() => {
          navigate("/login")
        })
        .catch((error) => {
          if (error instanceof SystemError) {
            alert(error.message)
          }
          alert("Tiempo de reseteo de contraseña expirado")
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
          <p>Introduce tu nueva contraseña.</p>
        </div>

        <form className="-mt-5 flex flex-col items-center" onSubmit={handlePasswordReset}>
          <PasswordField id="password" type="password" placeholder="Password" />
          <PasswordField id="confirmPassword" type="password" placeholder="Repite tu Password" />
          <Button className="mt-10" type="submit">
            Reset Password
          </Button>
        </form>
      </Main>

      <Footer />
    </>
  )
}
