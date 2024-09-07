import validate from "com/validate"
import errors, { SystemError } from "com/errors"


const requestPasswordReset = (email) => {
  validate.email(email)

  const body = { email }

  return fetch(`${import.meta.env.VITE_API_URL}/request-password-reset`, {
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

export default requestPasswordReset