import { Link, useNavigate } from "react-router-dom"

import useContext from "../../useContext"
import { SystemError } from "com/errors"

import logic from "../../logic"

import "./Login.css"

import Title from "../Title"
import Button from "../core/Button"
import Field from "../core/Field"
import Main from "../core/Main"
import Footer from "../core/Footer"
import PasswordField from "../PasswordField"

export default function Login() {
  const { alert } = useContext()

  const navigate = useNavigate()

  const handleLoginSubmit = (event) => {
    event.preventDefault()

    const target = event.target
    const username = target.username.value.trim()
    const password = target.password.value

    try {
      // prettier-ignore
      logic.loginUser(username, password)
        .then(() => {    
          const { role, userId } = logic.getInfo()
          if(role === "user"){
            navigate("/")
          } 

          if(role === "customer"){
          navigate(`/customer/${userId}/info` )
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
        <Title level={2} className="Welcome">
          ¡¡Bienvenido!!
        </Title>
      </div>

      <Main className="LoginMain">
        <form className="LoginForm" onSubmit={handleLoginSubmit}>
          <Field id="username" type="text" placeholder="Username"></Field>
          <PasswordField id="password" placeholder="Password"></PasswordField>
          <Link to="/request-password-reset">
            <span className="-mt-8 w-[16rem] text-right font-medium">
              <em>Olvidé mi contraseña</em>
            </span>
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
