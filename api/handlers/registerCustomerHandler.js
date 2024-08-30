import "dotenv/config"
import jwt from "../utils/jsonwebtoken-promised.js"
import logic from "../logic/index.js"
import { CredentialsError } from "com/errors.js"

const { JWT_SECRET } = process.env


export default ((req, res, next) => {

  try {
    const token = req.headers.authorization.slice(7)

    const { username, password, fullName, companyName, email, taxId, address, phone } = req.body

    jwt.verify(token, JWT_SECRET)
      .then(payload => {
        const { sub: userId } = payload
        try {

          logic.registerCustomer(userId, username, password, fullName, companyName, email, taxId, address, phone)
            .then(() => res.status(201).send())
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