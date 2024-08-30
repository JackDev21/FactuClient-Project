import { MatchError, ContentError } from "com/errors"

const JWT_REGEX = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/

const extractPayloadJwt = (token) => {

  if (!JWT_REGEX.test(token)) {
    throw new ContentError("Token is not valid")
  }

  const payload64 = token.split(".")[1]

  const payloadJSON = atob(payload64)
  const payload = JSON.parse(payloadJSON)
  const { exp } = payload;

  const nowSeconds = Date.now() / 1000
  if (nowSeconds >= exp) {
    throw new MatchError("Token expired")
  }

  return payload
}

export default extractPayloadJwt
