import validate from "com/validate.js"
import errors, { SystemError } from "com/errors.js"

const updateDriver = (driverId, { password, fullName, phone, username, email } = {}) => {
  validate.id(driverId, "driverId")

  if (fullName !== undefined) {
    validate.name(fullName, "fullName")
  }

  if (username !== undefined) {
    validate.username(username, "username")
  }

  if (email !== undefined && email.trim() !== "") {
    validate.email(email.trim().toLowerCase())
  }

  if (password !== undefined && password !== "") {
    validate.password(password)
  }

  return fetch(`${import.meta.env.VITE_API_URL}/drivers/${driverId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${sessionStorage.token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ password, fullName, phone, username, email })
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

export default updateDriver
