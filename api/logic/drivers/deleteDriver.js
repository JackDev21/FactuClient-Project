import validate from "com/validate.js"
import { User } from "../../model/index.js"
import { NotFoundError, SystemError, CredentialsError, MatchError } from "com/errors.js"

const deleteDriver = (userId, driverId) => {
  validate.id(userId)
  validate.id(driverId, "driverId")

  return User.findById(userId).lean()
    .catch(error => { throw new SystemError(error.message) })
    .then(owner => {
      if (!owner) {
        throw new NotFoundError("User not found")
      }

      if (owner.role !== "user" && owner.role !== "company") {
        throw new CredentialsError("Only company owners can delete drivers")
      }

      return User.findById(driverId)
        .catch(error => { throw new SystemError(error.message) })
        .then(driver => {
          if (!driver || driver.role !== "driver") {
            throw new NotFoundError("Driver not found")
          }

          if (driver.manager.toString() !== userId) {
            throw new MatchError("Driver does not belong to this company")
          }

          driver.active = false
          return driver.save()
            .catch(error => { throw new SystemError(error.message) })
            .then(() => {})
        })
    })
}

export default deleteDriver
