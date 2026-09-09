import errors, { SystemError } from "com/errors"
import validate from "com/validate"

const updateDeca = (decaId, updates, reason) => {
  validate.id(decaId, "decaId")

  return fetch(`${import.meta.env.VITE_API_URL}/deca/${decaId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.token}`,
    },
    body: JSON.stringify({ updates, reason }),
  })
    .catch(() => {
      throw new SystemError("Error de conexión con el servidor")
    })
    .then((response) => {
      if (response.status === 200) {
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

export default updateDeca
