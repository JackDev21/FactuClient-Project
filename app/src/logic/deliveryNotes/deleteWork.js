import errors, { SystemError } from "com/errors"
import validate from "com/validate"

const deleteWork = (deliveryNoteId, workId) => {
  validate.id(deliveryNoteId, "deliveryNoteId")
  validate.id(workId, "workId")

  return fetch(`${import.meta.env.VITE_API_URL}/delivery-notes/${deliveryNoteId}/works/${workId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${sessionStorage.token}`
    }
  })
    .catch(() => {
      throw new SystemError("connection error")
    })
    .then((response) => {
      if (response.status === 200) {
        return response.json()
          .catch(() => { throw new SystemError("connection error") })
          .then((deliveryNoteUpdated) => deliveryNoteUpdated)
      }

      return response.json()
        .catch(() => { throw new SystemError("connection error") })
        .then((body) => {
          const { error, message } = body
          const constructor = errors[error]
          throw new constructor(message)
        })
    })
}

export default deleteWork
