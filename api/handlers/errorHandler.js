import { DuplicityError, ContentError, MatchError, CredentialsError, NotFoundError } from "com/errors.js"

export default (error, req, res, next) => {
  let status = 500

  if (error instanceof DuplicityError) {
    status = 409
  } else if (error instanceof ContentError) {
    status = 400
  } else if (error instanceof MatchError) {
    status = 412
  } else if (error instanceof CredentialsError) {
    status = 401
  } else if (error instanceof NotFoundError) {
    status = 404
  } else if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
    status = 401
  } else if (error instanceof TypeError && error.message?.includes("slice")) {
    status = 401
    return res.status(401).json({ error: "CredentialsError", message: "Token missing or malformed" })
  }

  res.status(status).json({ error: error.constructor.name, message: error.message })
}