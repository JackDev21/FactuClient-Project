import validate from "com/validate.js"
import { User, DeliveryNote } from "../model/index.js"
import { MatchError, NotFoundError, SystemError } from "com/errors.js"

const deleteDeliveryNote = (userId, deliveryNoteId) => {
  validate.id(userId, "userId")
  validate.id(deliveryNoteId, "deliveryNoteId")

  return User.findById(userId).select("-__v").lean()
    .catch(error => { throw new SystemError(error.message) })
    .then(user => {
      if (!user) {
        throw new NotFoundError("User not found")
      }

      return DeliveryNote.findById(deliveryNoteId).select("-__v").lean()
        .catch(error => { throw new SystemError(error.message) })
        .then(deliveryNote => {
          if (!deliveryNote) {
            throw new NotFoundError("Delivery Note not found")
          }

          if (deliveryNote.company.toString() !== userId) {
            throw new MatchError("Can not delete Delivery Note from another company")
          }

          return DeliveryNote.deleteOne({ _id: deliveryNoteId })
            .catch(error => { throw new SystemError(error.message) })
            .then(() => { })
        })
    })
}

export default deleteDeliveryNote