import errors, { SystemError } from "com/errors"
import validate from "com/validate"

const createDeca = (deliveryNoteId, decaData) => {
  validate.id(deliveryNoteId, "deliveryNoteId")

  return fetch(`${import.meta.env.VITE_API_URL}/deca/${deliveryNoteId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.token}`,
    },
    body: JSON.stringify(decaData),
  })
    .catch(() => {
      throw new SystemError("Error de conexión con el servidor")
    })
    .then((response) => {
      if (response.status === 201) {
        return response.json().catch(() => {
          throw new SystemError("Error al procesar la respuesta del servidor")
        })
      }

      return response.json()
        .catch(() => {
          throw new SystemError("Error de conexión con el servidor")
        })
        .then((body) => {
          const { error, message } = body
          const constructor = errors[error] || Error
          throw new constructor(message)
        })
    })
}

export default createDeca
