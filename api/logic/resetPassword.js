import "dotenv/config"
import validate from "com/validate.js"
import { User } from "../model/index.js"
import { NotFoundError, SystemError, CredentialsError } from "com/errors.js"
import jwt from "../utils/jsonwebtoken-promised.js"
import bcrypt from "bcryptjs"

const { JWT_SECRET } = process.env

const resetPassword = (id, password, passwordRepeat, token) => {
  validate.id(id, "id")
  validate.password(password)
  validate.passwordsMatch(password, passwordRepeat)

  return jwt.verify(token, JWT_SECRET)
    .catch((error) => { throw new CredentialsError(error.message) })
    .then(payload => {

      const { sub: userId } = payload

      if (id !== userId) throw new CredentialsError("Invalid token")

      return User.findById(userId)
        .catch((error) => { throw new SystemError(error.message) })
        .then(user => {
          if (!user) throw new NotFoundError("User not found")

          return bcrypt.hash(password, 10)
            .then(hash => {
              user.password = hash
              return user.save()
            })
        })
        .catch((error) => { throw new CredentialsError(error.message) })
    })
}

export default resetPassword