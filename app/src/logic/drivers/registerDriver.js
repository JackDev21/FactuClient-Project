import validate from "com/validate.js"
import errors, { SystemError } from "com/errors.js"

const registerDriver = (username, password, fullName, phone = "", email = "", vehiclePlate = "", trailerPlate = "") => {
  const normalizedUsername = typeof username === "string" ? username.trim().toLowerCase() : username
  const normalizedFullName = typeof fullName === "string" ? fullName.trim() : fullName
  const normalizedPhone = typeof phone === "string" ? phone.trim() : ""
  const normalizedEmail = typeof email === "string" ? email.trim() : ""
  const normalizedVehiclePlate = typeof vehiclePlate === "string" ? vehiclePlate.trim().toUpperCase() : ""
  const normalizedTrailerPlate = typeof trailerPlate === "string" ? trailerPlate.trim().toUpperCase() : ""

  validate.username(normalizedUsername)
  validate.password(password)
  validate.name(normalizedFullName, "fullName")

  const body = {
    username: normalizedUsername,
    password,
    fullName: normalizedFullName,
    phone: normalizedPhone,
    email: normalizedEmail,
    vehiclePlate: normalizedVehiclePlate,
    trailerPlate: normalizedTrailerPlate
  }

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
