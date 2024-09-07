import "dotenv/config"
import validate from "com/validate.js"
import { User } from "../model/index.js"
import { SystemError, NotFoundError } from "com/errors.js"
import jwt from "../utils/jsonwebtoken-promised.js"
import nodemailer from "nodemailer"

const { JWT_SECRET } = process.env
const { EMAIL_USER } = process.env
const { PASSWORD } = process.env
const { FRONTEND_URL } = process.env

const requestPasswordReset = (email) => {
  validate.email(email)

  return User.findOne({ email })
    .catch((error) => { throw new SystemError(error.message) })
    .then((user) => {
      if (!user) throw new NotFoundError("User not found")

      const userId = user.id

      return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "5m" })
        .catch((error) => { throw new SystemError(error.message) })
        .then((token) => {
          const resetUrl = `${FRONTEND_URL}/reset-password/${user.id}/${token}`

          const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
              user: EMAIL_USER,
              pass: PASSWORD,
            },
          })

          const mailOptions = {
            to: user.email,
            from: EMAIL_USER,
            subject: "Factuclient Reestablecer Contraseña",
            text: `Estás recibiendo esto porque tú (u otra persona) has solicitado el restablecimiento de la contraseña de tu cuenta.\n\n
              Por favor, haz clic en el siguiente enlace, o pégalo en tu navegador para completar el proceso:\n\n
              ${resetUrl}\n\n
              Si no solicitaste esto, por favor ignora este correo electrónico y tu contraseña permanecerá sin cambios.\n`
          }

          return transporter.sendMail(mailOptions)
        })
    })
    .catch((error) => { throw new SystemError(error.message) })
}

export default requestPasswordReset