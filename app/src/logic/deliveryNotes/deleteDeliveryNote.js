import errors, { SystemError } from "com/errors.js"
import validate from "com/validate.js"

const deleteDeliveryNote = (deliveryNoteId) => {
  validate.id(deliveryNoteId, "deliveryNoteId")

  return fetch(`${import.meta.env.VITE_API_URL}/delivery-notes/${deliveryNoteId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${sessionStorage.token}`
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
export default deleteDeliveryNote