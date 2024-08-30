import validate from "com/validate.js";
import { User, DeliveryNote } from "../model/index.js";
import { NotFoundError, SystemError } from "com/errors.js"


const addNewObservation = (userId, deliveryNoteId, observation) => {
  validate.id(userId, "userId")
  validate.id(deliveryNoteId, "deliveryNoteId")
  validate.text(observation, "observation")

  return User.findById(userId).select("-__v").lean()
    .catch(error => { throw new SystemError(error.message) })
    .then(user => {
      if (!user) {
        throw new NotFoundError("User not found")
      }

      return DeliveryNote.findByIdAndUpdate(deliveryNoteId, { observations: observation }, { new: true }).select("-__v").lean()
        .catch(error => { throw new SystemError(error.message) })
        .then((deliveryNote) => {
          if (!deliveryNote) {
            throw new NotFoundError("Delivery note not found")
          }

          deliveryNote.id = deliveryNote._id.toString()
          delete deliveryNote._id

          return deliveryNote
        })

    })
}

export default addNewObservation