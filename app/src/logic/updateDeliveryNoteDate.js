import errors, { SystemError } from "com/errors"
import validate from "com/validate"

const updateDeliveryNoteDate = (customerId, deliveryNoteId, date) => {
  validate.id(customerId, "customerId")
  validate.id(deliveryNoteId, "deliveryNoteId")
  validate.date(date, "date")

  const body = { date }

  return fetch(`${import.meta.env.VITE_API_URL}/update-date/:${customerId}/:${deliveryNoteId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.token}`
    },

    body: JSON.stringify(body)
  })
    .catch(() => { throw new SystemError("connection error") })
    .then((response) => {
      if (response.status === 200) return

      return response.json()
        .catch(() => { throw new SystemError("connection error") })
        .then(body => {
          const { error, message } = body
          const constructor = errors[error]
          throw new constructor(message)
        })
    })
}

export default updateDeliveryNoteDate