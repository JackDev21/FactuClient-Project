import { Link, useNavigate } from "react-router-dom"
import { FaKey } from "react-icons/fa"

import useContext from "../../useContext"
import { SystemError } from "com/errors"

import logic from "../../logic"

import "./Login.css"

import Title from "../../components/Title"
import Button from "../../components/core/Button"
import Field from "../../components/core/Field"
import Main from "../../components/core/Main"
import Footer from "../../components/core/Footer"
import PasswordField from "../../components/PasswordField"

export default function Login() {
  const { alert } = useContext()

  const navigate = useNavigate()

  const handleLoginSubmit = (event) => {
    event.preventDefault()

    const target = event.target
    const username = target.username.value.trim()
    const password = target.password.value

    try {
      logic.loginUser(username, password)
        .then(() => {    
          const { role, userId } = logic.getInfo()
          if (role === "customer") {
            navigate(`/customer/${userId}/info`)
          } else {
            navigate("/")
          }
        })
        .catch((error) => {
          if(error instanceof SystemError) {
            alert(error.message)
          }
          alert("Invalid username or password")
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

      <Main className="LoginMain">
        <form className="LoginForm" onSubmit={handleLoginSubmit}>
          <Field id="username" type="text" placeholder="Username"></Field>
          <PasswordField id="password" placeholder="Password"></PasswordField>
          <Link
            to="/request-password-reset"
            className="-mt-5 flex w-[18rem] items-center justify-center gap-2 rounded-xl border border-stone-300/80 bg-stone-100/90 py-2.5 px-3 text-sm font-bold text-stone-700 shadow-sm transition-all hover:border-amber-600/40 hover:bg-amber-50 hover:text-amber-950 active:scale-95"
          >
            <FaKey className="text-amber-700 text-xs shrink-0" />
            <span>¿Has olvidado tu contraseña?</span>
          </Link>
          <Button type="submit">Login</Button>
          {/* <div className="Link">
            <p>
              ¿No tienes cuenta?
              <Link to="/register">
                <span className="Link-RegisterLogin">Registrate</span>
              </Link>
            </p>
          </div> */}
        </form>
      </Main>

      <Footer></Footer>
    </>
  )
}
