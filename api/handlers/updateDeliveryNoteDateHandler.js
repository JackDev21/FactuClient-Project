import "dotenv/config"
import logic from "../logic/index.js"
import jwt from "../utils/jsonwebtoken-promised.js"
import { CredentialsError } from "com/errors.js"

const { JWT_SECRET } = process.env

export default ((req, res, next) => {
  try {
    console.log("Entrando en el handler con:", { headers: req.headers, body: req.body, params: req.params });

    const token = req.headers.authorization.slice(7)
    console.log("Token extraído:", token);

    const { date } = req.body
    const { deliveryNoteId } = req.params

    jwt.verify(token, JWT_SECRET)
      .then(payload => {
        console.log("Payload verificado:", payload);
        const { sub: userId } = payload
        try {
          console.log("Llamando a logic.updateDeliveryNoteDate con:", { userId, deliveryNoteId, date });
          logic.updateDeliveryNoteDate(userId, deliveryNoteId, date)
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