import validate from "com/validate.js"
import { User, DeliveryNote } from "../model/index.js"
import { NotFoundError, SystemError } from "com/errors.js"

const getAllDeliveryNotes = (userId) => {
  validate.id(userId, "userId")

  return User.findById(userId)
    .catch(error => { throw new SystemError(error.message) })
    .then(user => {
      if (!user) {
        throw new NotFoundError("User not found")
      }

      return DeliveryNote.find({ company: userId }).populate("customer", "username companyName").sort({ number: -1 }).select("-__v").lean()
        .catch(error => { throw new SystemError(error.message) })
        .then(deliveryNotes => {
          if (!deliveryNotes.length) {
            throw new NotFoundError("DeliveryNotes not found")
          }

          return deliveryNotes.map(deliveryNote => {
            deliveryNote.id = deliveryNote._id.toString()
            delete deliveryNote._id

            deliveryNote.customerName = deliveryNote.customer?.companyName || deliveryNote.customer?.username

            return deliveryNote
          })
        })
    })
}

export default getAllDeliveryNotes
