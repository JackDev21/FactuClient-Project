import errors, { SystemError } from "com/errors"
import validate from "com/validate"

const loginUser = (username, password) => {
  validate.username(username)
  validate.password(password)

  const body = { username, password }

  return fetch(`${import.meta.env.VITE_API_URL}/users/auth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  })
    .catch(() => {
      throw new SystemError("connection error")
    })
    .then((response) => {
      if (response.status === 200) {
        return response.json()
          .catch(() => { throw new SystemError("connection error") })
          .then((token) => {
            sessionStorage.token = token
          })
      }
      return response
        .json()
        .catch(() => {
          throw new SystemError("connection error")
        })
        .then((body) => {
          const { error, message } = body
          const constructor = errors[error]
          throw new constructor(message)
        })
    })
}

export default loginUser
