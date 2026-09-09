import validate from "com/validate.js"
import errors, { SystemError } from "com/errors.js"

const deleteDriver = (driverId) => {
  validate.id(driverId, "driverId")

  return fetch(`${import.meta.env.VITE_API_URL}/drivers/${driverId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${sessionStorage.token}`
    }
  })
    .catch(() => { throw new SystemError("connection error") })
    .then(response => {
      if (response.status === 204) return

      return response.json()
        .catch(() => { throw new SystemError("connection error") })
        .then(body => {
          const { error, message } = body
          const constructor = errors[error] || Error
          throw new constructor(message)
        })
    })
}

export default deleteDriver
