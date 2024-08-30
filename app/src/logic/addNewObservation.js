import errors, { SystemError } from "com/errors"
import validate from "com/validate"


const addNewObservation = (deliveryNoteId, observation) => {
  validate.id(deliveryNoteId, "deliveryNoteId")
  validate.text(observation, "observation")

  const body = { observation }

  return fetch(`${import.meta.env.VITE_API_URL}/observation/delivery-note/${deliveryNoteId}`, {
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

export default addNewObservation