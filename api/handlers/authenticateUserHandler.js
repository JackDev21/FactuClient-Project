import "dotenv/config"
import logic from "../logic/index.js"
import jwt from "../utils/jsonwebtoken-promised.js"
import { SystemError } from "com/errors.js"

const { JWT_SECRET } = process.env

export default ((req, res, next) => {
  try {
    const { username, password } = req.body

    logic.authenticateUser(username, password)
      .then((user) => {
        const { userId, role } = user

        jwt.sign({ sub: userId, role }, JWT_SECRET, { expiresIn: "7d" })
          .then((token) => {
            res.json(token)
          })
          .catch((error) => next(new SystemError(error.message)))

      })
      .catch(error => next(error))
  } catch (error) {
    next(error)
  }
})