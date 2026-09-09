import validate from "com/validate.js"
import { User } from "../../model/index.js"
import { NotFoundError, SystemError } from "com/errors.js"

const getAllCustomers = (userId) => {
  validate.id(userId)

  return User.findById(userId).lean()
    .catch((error) => { throw new SystemError(error.message) })
    .then(user => {
      if (!user) {
        throw new NotFoundError("User not found")
      }

      const isDriver = user.role === "driver"
      const managerId = isDriver && user.manager ? user.manager.toString() : userId

      return User.find({ manager: managerId, role: { $ne: "driver" }, active: { $ne: false } })
        .sort({ companyName: 1 })
        .select("-__v -password")
        .lean()
        .catch((error) => { throw new SystemError(error.message) })
        .then((customerUsers) => {

          if (!customerUsers.length) {
            throw new NotFoundError("Customers not found")
          }

          customerUsers.forEach((customerUser) => {
            customerUser.id = customerUser._id.toString()
            delete customerUser._id

            if (!customerUser.companyName) {
              customerUser.companyName = customerUser.fullName || customerUser.username || "Cliente"
            }

            if (customerUser.manager) {
              customerUser.manager = customerUser.manager.toString()
            }
          })
          return customerUsers
        })
    })
}

export default getAllCustomers;
