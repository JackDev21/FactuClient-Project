import errors, { SystemError } from "com/errors.js"
import extractPayloadJwt from "../../utils/extractPayloadJwt.js"

const getUserName = () => {

  const { sub: userId } = extractPayloadJwt(sessionStorage.token)

  return fetch(`${import.meta.env.VITE_API_URL}/users/${userId}`, {

    method: "GET",
    headers: {
      Authorization: `Bearer ${sessionStorage.token}`
    }
  })

    .catch(() => { throw new SystemError("Connection error") })
    .then((response) => {
      if (response.status === 200) {
        return response.json()
          .catch(() => { throw new SystemError("Connection error") })
          .then(name => name)
      }

      return response.json()
        .catch(() => { throw new SystemError("Connection error") })
        .then(body => {
          const { error, message } = body
          const constructor = errors[error]
          throw new constructor(message)
        })
    })
}

export default getUserName