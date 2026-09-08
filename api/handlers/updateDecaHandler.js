import "dotenv/config"
import logic from "../logic/index.js"
import jwt from "../utils/jsonwebtoken-promised.js"
import { CredentialsError } from "com/errors.js"

const { JWT_SECRET } = process.env

export default (req, res, next) => {
  try {
    const token = req.headers.authorization.slice(7)
    const { decaId } = req.params
    const { updates, reason } = req.body

    jwt.verify(token, JWT_SECRET)
      .then((payload) => {
        const { sub: userId } = payload

        logic.updateDeca(userId, decaId, updates, reason)
          .then((updatedDeca) => {
            res.status(200).json(updatedDeca)
          })
          .catch((error) => next(error))
      })
      .catch((error) => next(new CredentialsError(error.message)))
  } catch (error) {
    next(error)
  }
}
