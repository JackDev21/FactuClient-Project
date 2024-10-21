import { NotFoundError, SystemError } from "com/errors.js"
import { User } from "../model/index.js"
import validate from "com/validate.js"

const updateProfile = (userId, updates) => {
  validate.id(userId, "userId")

  const updateFields = {}

  if (updates.username) {
    validate.username(updates.username, "username")
    updateFields.username = updates.username
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
  if (updates.bankAccount) {
    validate.iban(updates.bankAccount, "bankAccount")
    updateFields.bankAccount = updates.bankAccount
  }
  if (updates.companyLogo) {
    validate.url(updates.companyLogo, "companyLogo")
    updateFields.companyLogo = updates.companyLogo
  }

  if (updates.irpf !== null && updates.irpf !== undefined) {
    validate.number(updates.irpf, "irpf")
    updateFields.irpf = updates.irpf
  }
  return User.findByIdAndUpdate(userId, updateFields, { new: true }).select("-__v").lean()
    .catch(error => { throw new SystemError(error.message) })
    .then(user => {
      if (!user) {
        throw new NotFoundError("User not found")
      }
    })
}

export default updateProfile
