import validate from "com/validate.js"
import { User } from "../model/index.js"
import { NotFoundError, SystemError } from "com/errors.js"

const getAllCustomers = (userId) => {
  validate.id(userId)

  return User.findById(userId).lean()
    .catch((error) => { throw new SystemError(error.message) })
    .then(user => {
      if (!user) {
        throw new NotFoundError("User not found")
      }

      return User.find({ manager: userId, active: true }).sort({ companyName: 1 }).select("-__v").lean()
        .catch((error) => { throw new SystemError(error.message) })
        .then((customerUsers) => {

          if (!customerUsers.length) {
            throw new NotFoundError("Customers not found")
          }

          customerUsers.forEach((customerUser) => {
            customerUser.id = customerUser._id.toString()
            delete customerUser._id

            if (customerUser.manager) {
              customerUser.manager = customerUser.manager.toString()
            }
          })
          return customerUsers
        })
    })
}

export default getAllCustomers;
