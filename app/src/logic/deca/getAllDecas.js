import errors, { SystemError } from "com/errors"

const getAllDecas = () => {
  return fetch(`${import.meta.env.VITE_API_URL}/deca`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${sessionStorage.token}`,
    },
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

export default getAllDecas
