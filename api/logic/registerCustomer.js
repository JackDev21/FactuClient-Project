import validate from "com/validate.js"
import { User } from "../model/index.js"
import { NotFoundError, SystemError } from "com/errors.js"
import bcrypt from "bcryptjs"

const registerCustomer = (userId, username, password, fullName, companyName, email, taxId, address, phone) => {
  validate.id(userId)
  validate.username(username)
  validate.password(password)
  validate.name(fullName, "fullName")
  validate.companyName(companyName, "companyName")
  validate.email(email)
  validate.taxId(taxId)
  validate.address(address)
  validate.phone(phone)

  return User.findById(userId)
    .catch(error => { throw new SystemError(error.message) })
    .then(user => {
      if (!user) {
        throw new NotFoundError('User not found')
      }

      return bcrypt.hash(password, 10)
    })
    .then(hash => {
      const newCustomer = {
        username,
        password: hash,
        fullName,
        companyName,
        email,
        taxId,
        address,
        phone,
        role: "customer",
        manager: userId
      }

      return User.create(newCustomer)
        .catch(error => { throw new SystemError(error.message) })
        .then(() => { })
    })
}
export default registerCustomer



