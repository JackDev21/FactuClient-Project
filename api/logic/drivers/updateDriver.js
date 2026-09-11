import validate from "com/validate.js"
import { User } from "../../model/index.js"
import { NotFoundError, SystemError, CredentialsError, MatchError, DuplicityError } from "com/errors.js"
import bcrypt from "bcryptjs"

const updateDriver = (userId, driverId, { password, fullName, phone, username, email, vehiclePlate, trailerPlate } = {}) => {
  validate.id(userId)
  validate.id(driverId, "driverId")

  if (fullName !== undefined) {
    validate.name(fullName, "fullName")
  }

  let normalizedUsername
  if (username !== undefined) {
    normalizedUsername = typeof username === "string" ? username.trim().toLowerCase() : username
    validate.username(normalizedUsername, "username")
  }

  if (email !== undefined && email.trim() !== "") {
    validate.email(email.trim().toLowerCase())
  }

  if (password !== undefined && password !== "") {
    validate.password(password)
  }

  return User.findById(userId).lean()
    .catch(error => { throw new SystemError(error.message) })
    .then(owner => {
      if (!owner) {
        throw new NotFoundError("User not found")
      }

      if (owner.role !== "user" && owner.role !== "company") {
        throw new CredentialsError("Only company owners can update drivers")
      }

      return User.findById(driverId)
        .catch(error => { throw new SystemError(error.message) })
        .then(driver => {
          if (!driver || driver.role !== "driver") {
            throw new NotFoundError("Driver not found")
          }

          if (!driver.manager || driver.manager.toString() !== userId) {
            throw new MatchError("Driver does not belong to this company")
          }

          const promises = []

          if (username !== undefined) {
            if (normalizedUsername !== driver.username) {
              promises.push(
                User.findOne({ username: normalizedUsername, _id: { $ne: driver._id } })
                  .catch(error => { throw new SystemError(error.message) })
                  .then(existing => {
                    if (existing) throw new DuplicityError("El nombre de usuario ya está en uso")
                    driver.username = normalizedUsername
                  })
              )
            }
          }

          if (email !== undefined) {
            const normalizedEmail = email.trim() ? email.trim().toLowerCase() : `${driver.username}@driver.factuclient.local`
            driver.email = normalizedEmail
          }

          return Promise.all(promises)
            .then(() => {
              if (fullName !== undefined) {
                driver.fullName = fullName.trim()
              }

              if (phone !== undefined) {
                driver.phone = phone ? phone.trim() : ""
              }

              if (vehiclePlate !== undefined) {
                driver.vehiclePlate = typeof vehiclePlate === "string" ? vehiclePlate.trim().toUpperCase() : ""
              }

              if (trailerPlate !== undefined) {
                driver.trailerPlate = typeof trailerPlate === "string" ? trailerPlate.trim().toUpperCase() : ""
              }

              if (password !== undefined && password !== "") {
                return bcrypt.hash(password, 10)
                  .then(hash => {
                    driver.password = hash
                    return driver.save()
                  })
                  .catch(error => { throw new SystemError(error.message) })
                  .then(() => {})
              }

              return driver.save()
                .catch(error => { throw new SystemError(error.message) })
                .then(() => {})
            })
        })
    })
}

export default updateDriver
