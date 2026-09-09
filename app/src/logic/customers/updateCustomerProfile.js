import errors, { SystemError } from "com/errors"
import validate from "com/validate"

const updateCustomerProfile = (customerId, updates) => {

  validate.id(customerId, "customerId")

  if (updates.username) validate.username(updates.username)
  if (updates.password) validate.password(updates.password)
  if (updates.email) validate.email(updates.email)
  if (updates.fullName) validate.name(updates.fullName, "full Name")
  if (updates.companyName) validate.companyName(updates.companyName)
  if (updates.address) validate.address(updates.address)
  if (updates.taxId) validate.taxId(updates.taxId)
  if (updates.phone) validate.phone(updates.phone)

  return fetch(`${import.meta.env.VITE_API_URL}/customers/${customerId}/update`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.token}`
    },
    body: JSON.stringify(updates)
  })
    .catch(() => { throw new SystemError("connection error") })
    .then(response => {
      if (response.status === 200) return


      return response.json()
        .catch(() => { throw new SystemError("connection error") })
        .then((body) => {
          const { error, message } = body
          const constructor = errors[error]
          throw new constructor(message)
        })
    })
}

export default updateCustomerProfile