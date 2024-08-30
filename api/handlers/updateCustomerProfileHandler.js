import "dotenv/config"
import logic from "../logic/index.js"
import jwt from "../utils/jsonwebtoken-promised.js"
import { CredentialsError } from "com/errors.js"

const { JWT_SECRET } = process.env

export default ((req, res, next) => {
  try {

    const token = req.headers.authorization.slice(7)

    const updates = req.body
    const { customerId } = req.params

    jwt.verify(token, JWT_SECRET)
      .then(payload => {
        const { sub: userId } = payload
        try {
          logic.updateCustomerProfile(userId, customerId, updates)
            .then(() => res.status(200).send())
            .catch(error => next(error))

        } catch (error) {
          next(error)
        }
      })
      .catch(error => next(new CredentialsError(error.message)))

  } catch (error) {
    next(error)
  }
})