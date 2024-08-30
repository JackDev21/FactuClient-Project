import validate from "com/validate.js"
import { User } from "../model/index.js"
import bcrypt from "bcryptjs"
import { SystemError, DuplicityError } from "com/errors.js"

const registerUser = (username, email, password, passwordRepeat) => {
  validate.username(username, "Username")
  validate.email(email)
  validate.password(password)
  validate.passwordsMatch(password, passwordRepeat)

  return User.findOne({ $or: [{ username }, { email }] })
    .catch((error) => { throw new SystemError(error.message) })
    .then(user => {
      if (user) {
        throw new DuplicityError("User already exists")
      }

      return bcrypt.hash(password, 10)
        .catch((error) => { throw new SystemError(error.message) })
        .then((hash) => {
          const newUser = {
            username,
            email,
            password: hash,
            fullName: "",
            companyName: "",
            address: "",
            taxId: "",
            phone: "",
            bankAccount: "",
            role: "user",
            companyLogo: ""
          }
          return User.create(newUser)
            .catch((error) => { throw new SystemError(error.message) })
            .then(() => { })
        })
    })
}

export default registerUser