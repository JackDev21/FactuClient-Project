import { User, DeliveryNote } from "../model/index.js"
import validate from "com/validate.js"
import { NotFoundError, SystemError } from "com/errors.js"

function getDeliveryNote(userId, deliveryNoteId) {
  validate.id(userId, "userId")
  validate.id(deliveryNoteId, "deliveryNoteId")

  return User.findById(userId).lean()
    .catch(error => { throw new SystemError(error.message) })
    .then(user => {
      if (!user) {
        throw new NotFoundError("User not found")
      }

      return DeliveryNote.findById(deliveryNoteId).populate("customer").populate("company").populate("works").select("-__v").lean()
        .catch(error => { throw new SystemError(error.message) })
        .then(deliveryNote => {
          if (!deliveryNote) {
            throw new NotFoundError("DeliveryNote not found")
          }

          deliveryNote.id = deliveryNote._id.toString()
          delete deliveryNote._id

          return deliveryNote
        })
    })
}
export default getDeliveryNote