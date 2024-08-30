import errors, { SystemError } from "com/errors"
import validate from "com/validate"


const createWork = (deliveryNoteId, concept, quantity, price) => {
  validate.id(deliveryNoteId, "deliveryNoteId")
  validate.text(concept)
  validate.number(quantity)
  validate.number(price)

  const body = { concept, quantity, price }

  return fetch(`${import.meta.env.VITE_API_URL}/create/work/delivery-notes/${deliveryNoteId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.token}`
    },

    body: JSON.stringify(body)
  })
    .catch(() => { throw new SystemError("connection error") })
    .then((response) => {
      if (response.status === 200) {
        return response.json()
          .catch(() => { throw new SystemError("connection error") })
          .then((deliveryNoteUpdated) => deliveryNoteUpdated)
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
export default createWork