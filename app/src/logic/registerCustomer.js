import validate from "com/validate.js"
import errors, { SystemError } from "com/errors.js"

const registerCustomer = (username, password, fullName, companyName, email, taxId, address, phone) => {
  validate.username(username)
  validate.password(password)
  validate.name(fullName)
  validate.companyName(companyName)
  validate.email(email)
  validate.taxId(taxId)
  validate.address(address, address)
  validate.phone(phone)

  const body = { username, password, fullName, companyName, email, taxId, address, phone }

  return fetch(`${import.meta.env.VITE_API_URL}/customers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.token}`
    },
    body: JSON.stringify(body)
  })
    .catch(() => { throw new SystemError("connection error") })
    .then(response => {
      if (response.status === 201) return


      return response.json()
        .catch(() => { throw new SystemError("connection error") })
        .then(body => {
          const { error, message } = body
          const constructor = errors[error]
          throw new constructor(message)
        })
    })
}

export default registerCustomer