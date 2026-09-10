import validate from "com/validate.js"
import { User } from "../../model/index.js"
import { MatchError, NotFoundError, SystemError, CredentialsError, DuplicityError } from "com/errors.js"
import bcrypt from "bcryptjs"

const registerDriver = (userId, username, password, fullName, phone = "", email = "") => {
  validate.id(userId)

  const normalizedUsername = typeof username === "string" ? username.trim().toLowerCase() : username
  const normalizedFullName = typeof fullName === "string" ? fullName.trim() : fullName
  const normalizedPhone = typeof phone === "string" ? phone.trim() : ""
  const normalizedEmail = (email && typeof email === "string" && email.trim()) 
    ? email.trim().toLowerCase() 
    : `${normalizedUsername}@driver.factuclient.local`

  validate.username(normalizedUsername)
  validate.password(password)
  validate.name(normalizedFullName, "fullName")

  if (email && typeof email === "string" && email.trim()) {
    validate.email(normalizedEmail)
  }

  return User.findById(userId).lean()
    .catch(error => { throw new SystemError(error.message) })
    .then(owner => {
      if (!owner) {
        throw new NotFoundError("User not found")
      }

      if (owner.role !== "user" && owner.role !== "company") {
        throw new CredentialsError("Only company owners can register drivers")
      }

      return User.findOne({
        $or: [
          { username: normalizedUsername },
          { email: normalizedEmail }
        ]
      })
      .catch(error => { throw new SystemError(error.message) })
    })
    .then(existingDriver => {
      if (existingDriver) {
        if (existingDriver.active) {
          if (existingDriver.username === normalizedUsername) {
            throw new DuplicityError("El nombre de usuario ya está registrado por otro chofer o usuario")
          }
          if (existingDriver.email === normalizedEmail) {
            throw new DuplicityError("El correo electrónico ya está registrado en el sistema")
          }
          throw new DuplicityError("Username or email already in use")
        }

        // Si existía pero estaba desactivado y pertenece a la misma empresa, reactivarlo
        if (existingDriver.manager && existingDriver.manager.toString() === userId) {
          return bcrypt.hash(password, 10)
            .then(hash => {
              existingDriver.active = true
              existingDriver.password = hash
              existingDriver.fullName = fullName
              existingDriver.phone = phone || existingDriver.phone
              return existingDriver.save()
            })
            .catch(error => { throw new SystemError(error.message) })
            .then(() => {})
        } else {
          throw new DuplicityError("Username or email already in use")
        }
      }

      return bcrypt.hash(password, 10)
        .then(hash => {
          const newDriver = {
            username: normalizedUsername,
            password: hash,
            fullName,
            email: normalizedEmail,
            phone: phone || "",
            role: "driver",
            manager: userId,
            active: true
          }

          return User.create(newDriver)
            .catch(error => { throw new SystemError(error.message) })
            .then(() => {})
        })
    })
}

export default registerDriver
