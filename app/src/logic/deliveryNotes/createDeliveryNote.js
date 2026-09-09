import errors, { SystemError } from "com/errors"
import validate from "com/validate"

const createDeliveryNote = (customerId) => {
  validate.id(customerId, "customerId")

  return fetch(`${import.meta.env.VITE_API_URL}/create/delivery-notes/${customerId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.token}`
    }
  })
    .catch(() => { throw new SystemError("connection error") })
    .then((response) => {
      if (response.status === 201) {
        return response.json()
          .catch(() => { throw new SystemError("connection error") })
          .then((deliveryNote) => deliveryNote)
      }

      return response.json()
        .catch(() => { throw new SystemError("connection error") })
        .then(body => {
          const { error, message } = body
          const constructor = errors[error]
          throw new constructor(message)
        })
    })
}
export default createDeliveryNote