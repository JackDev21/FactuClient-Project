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
            subject: "Password reset",
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          ${resetUrl}\n\n
          If you did not request this, please ignore this email and your password will remain unchanged.\n`
          }

          return transporter.sendMail(mailOptions)
        })
    })
    .catch((error) => { throw new SystemError(error.message) })
}

export default requestPasswordReset