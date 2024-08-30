import errors, { SystemError } from "com/errors.js"
import validate from "com/validate.js"

const deleteCustomer = (customerId) => {
  validate.id(customerId, "customerId")

  return fetch(`${import.meta.env.VITE_API_URL}/customers/${customerId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${sessionStorage.token}`

    }
  })
    .catch(() => { throw new SystemError("connection error") })
    .then(response => {
      if (response.status === 204) return

      return response.json()
        .catch(() => { throw new SystemError("connection error") })
        .then(body => {
          const { error, message } = body
          const constructor = errors[error]
          throw new constructor(message)
        })
    })
}

export default deleteCustomer