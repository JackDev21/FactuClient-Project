// import { Link, useNavigate } from "react-router-dom"

// import logic from "../../logic/index"

// import useContext from "../../useContext"
// import { SystemError } from "com/errors"

// import Title from "../Title"
// import Field from "../core/Field"
// import Button from "../core/Button"
// import Main from "../core/Main"
// import PasswordField from "../PasswordField"
// import Footer from "../core/Footer"

// import "./Register.css"

// export default function Register() {
//   const { alert } = useContext()
//   const navigate = useNavigate()

//   const handleRegisterSubmit = (event) => {
//     event.preventDefault()

//     const target = event.target
//     const username = target.username.value
//     const email = target.email.value
//     const password = target.password.value
//     const confirmPassword = target.confirmPassword.value

//     try {
//       // prettier-ignore
//       logic.registerUser( username, email, password, confirmPassword)
//         .then(() => {
//           navigate("/login")
//         })
//         .catch((error) => {
//           if (error instanceof SystemError) {
//             alert(error.message)
//           }

//           alert(error.message)
//         })
//     } catch (error) {
//       alert(error.message)
//     }
//   }

//   return (
//     <>
//       <div className="Header">
//         <Title level={1} className="FactuClient">
//           FACTUCLIENT
//         </Title>
//         <Title level={2} className="Welcome">
//           ¡¡Bienvenido!!
//         </Title>
//       </div>

//       <Main className="RegisterMain">
//         <form className="RegisterForm" onSubmit={handleRegisterSubmit}>
//           <Field id="username" type="text" placeholder="Nombre de Usuario"></Field>
//           <Field id="email" type="email" placeholder="Email"></Field>
//           <PasswordField id="password" placeholder="Password"></PasswordField>
//           <PasswordField id="confirmPassword" placeholder="Confirmar password"></PasswordField>
//           <Button type="submit">Registrate</Button>

//           <div className="Link">
//             <p>
//               ¿Tienes cuenta?
//               <Link to="/login">
//                 <span className="Link-RegisterLogin">Login</span>
//               </Link>
//             </p>
//           </div>
//         </form>
//       </Main>

//       <Footer></Footer>
//     </>
//   )
// }
