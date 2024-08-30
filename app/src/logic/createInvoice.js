import errors, { SystemError } from "com/errors"
import validate from "com/validate"

const createInvoice = (customerId, deliveryNotesId) => {
  validate.id(customerId, "customerId")

  deliveryNotesId.forEach((deliveryNoteId) => {
    validate.id(deliveryNoteId, "deliveryNoteId")
  })

  const body = { deliveryNotesId }

  return fetch(`${import.meta.env.VITE_API_URL}/create/invoices/${customerId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.token}`
    },

    body: JSON.stringify(body)
  })
    .catch(() => { throw new SystemError("connection error") })
    .then((response) => {
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

export default createInvoice