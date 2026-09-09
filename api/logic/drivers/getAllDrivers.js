import validate from "com/validate.js"
import { User } from "../../model/index.js"
import { NotFoundError, SystemError, CredentialsError } from "com/errors.js"

const getAllDrivers = (userId) => {
  validate.id(userId)

  return User.findById(userId).lean()
    .catch(error => { throw new SystemError(error.message) })
    .then(owner => {
      if (!owner) {
        throw new NotFoundError("User not found")
      }

      if (owner.role !== "user" && owner.role !== "company") {
        throw new CredentialsError("Only company owners can list drivers")
      }

      return User.find({ manager: userId, role: "driver", active: true })
        .select("-password -__v")
        .sort({ fullName: 1 })
        .lean()
        .catch(error => { throw new SystemError(error.message) })
        .then(drivers => {
          return drivers.map(driver => {
            driver.id = driver._id.toString()
            delete driver._id
            return driver
          })
        })
    })
}

export default getAllDrivers
