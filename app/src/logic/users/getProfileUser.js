import errors, { SystemError } from "com/errors"
import validate from "com/validate"

const getProfileUser = (targetUserId) => {
  validate.id(targetUserId, "targetUserId")

  return fetch(`${import.meta.env.VITE_API_URL}/users/${targetUserId}/profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${sessionStorage.token}`
    }
  })
    .catch(() => { throw new SystemError("connection error") })
    .then((response) => {
      if (response.status === 200) {
        return response.json()
          .catch(() => { throw new SystemError("connection error") })
          .then((targetUser) => targetUser)
      }
      return response.json()
        .catch(() => { throw new SystemError("connection error") })
        .then(body => {
          const { error, message } = body
          const constructor = errors[error]
          throw new constructor(message)
        })
    })
    .catch(() => { throw new SystemError("connection error") })
}

export default getProfileUser