import validate from "com/validate.js"
import errors, { SystemError } from "com/errors.js"

const registerDriver = (username, password, fullName, phone = "", email = "") => {
  validate.username(username)
  validate.password(password)
  validate.name(fullName, "fullName")

  const body = { username, password, fullName, phone, email }

  return fetch(`${import.meta.env.VITE_API_URL}/drivers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.token}`
    },
    body: JSON.stringify(body)
  })
    .catch(() => { throw new SystemError("connection error") })
    .then(response => {
      if (response.status === 201) return

      return response.json()
        .catch(() => { throw new SystemError("connection error") })
        .then(body => {
          const { error, message } = body
          const constructor = errors[error] || Error
          throw new constructor(message)
        })
    })
}

export default registerDriver
