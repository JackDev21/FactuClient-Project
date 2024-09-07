import validate from "com/validate"
import errors, { SystemError } from "com/errors"

const resetPassword = (userId, password, passwordRepeat, token) => {
  validate.password(password)
  validate.passwordsMatch(password, passwordRepeat)

  const body = { password, passwordRepeat }

  return fetch(`${import.meta.env.VITE_API_URL}/reset-password/${userId}/${token}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
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

export default resetPassword