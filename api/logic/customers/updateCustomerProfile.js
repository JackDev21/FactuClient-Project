import { NotFoundError, SystemError, MatchError } from "com/errors.js"
import { User } from "../../model/index.js"
import validate from "com/validate.js"
import bcrypt from "bcryptjs"

const updateCustomerProfile = (userId, customerId, updates) => {
  validate.id(userId, "userId")
  validate.id(customerId, "customerId")

  const updateFields = {}

  if (updates.username) {
    validate.username(updates.username, "username")
    updateFields.username = updates.username
  }
  if (updates.password) {
    validate.password(updates.password, "password")
    updateFields.password = bcrypt.hashSync(updates.password, 10)
  }
  if (updates.email) {
    validate.email(updates.email, "email")
    updateFields.email = updates.email
  }
  if (updates.fullName) {
    validate.name(updates.fullName, "fullName")
    updateFields.fullName = updates.fullName
  }
  if (updates.companyName) {
    validate.companyName(updates.companyName, "companyName")
    updateFields.companyName = updates.companyName
  }
  if (updates.address) {
    validate.address(updates.address, "address")
    updateFields.address = updates.address
  }
  if (updates.taxId) {
    validate.taxId(updates.taxId, "taxId")
    updateFields.taxId = updates.taxId
  }
  if (updates.phone) {
    validate.phone(updates.phone, "phone")
    updateFields.phone = updates.phone
  }

  return User.findById(userId).select("-__v").lean()
    .catch(error => { throw new SystemError(error.message) })
    .then(user => {
      if (!user) {
        throw new NotFoundError("User not found")
      }

      return User.findById(customerId)
        .catch(error => { throw new SystemError(error.message) })
        .then(customer => {
          if (!customer) {
            throw new NotFoundError("Customer not found")
          }

          if (customer.role !== "customer") {
            throw new MatchError("Target user is not a customer")
          }

          if (!customer.manager || customer.manager.toString() !== userId) {
            throw new MatchError("Can not update Customer from another user")
          }

          Object.assign(customer, updateFields)

          return customer.save()
            .catch(error => { throw new SystemError(error.message) })
            .then(() => {})
        })
    })
}

export default updateCustomerProfile
