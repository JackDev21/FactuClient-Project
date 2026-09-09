import "dotenv/config"
import logic from "../../logic/index.js"
import jwt from "../../utils/jsonwebtoken-promised.js"
import getBaseUrl from "../../utils/getBaseUrl.js"
import { CredentialsError } from "com/errors.js"

const { JWT_SECRET } = process.env

export default (req, res, next) => {
  try {
    const token = req.headers.authorization.slice(7)
    const { deliveryNoteId } = req.params
    const decaData = req.body
    const baseUrl = getBaseUrl(req)

    jwt.verify(token, JWT_SECRET)
      .then((payload) => {
        const { sub: userId } = payload

        logic.createDeca(userId, deliveryNoteId, decaData, baseUrl)
          .then((deca) => {
            res.status(201).json(deca)
          })
          .catch((error) => next(error))
      })
      .catch((error) => next(new CredentialsError(error.message)))
  } catch (error) {
    next(error)
  }
}
