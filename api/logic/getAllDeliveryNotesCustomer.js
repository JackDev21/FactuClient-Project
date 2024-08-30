import { User, DeliveryNote } from "../model/index.js"
import validate from "com/validate.js"
import { NotFoundError, SystemError } from "com/errors.js"


function getAllDeliveryNotesCustomer(userId, customerId) {
  validate.id(userId, "userId")
  validate.id(customerId, "customerId")

  return User.findById(userId).lean()
    .catch(error => { throw new SystemError(error.message) })
    .then(user => {
      if (!user) {
        throw new NotFoundError("User not found")
      }

      return User.findById(customerId).lean()
        .catch(error => { throw new SystemError(error.message) })
        .then(customer => {
          if (!customer) {
            throw new NotFoundError("Customer not found")
          }


          return DeliveryNote.find({ customer: customerId }).populate("customer").populate("company").populate("works").sort({ date: -1 }).select("-__v").lean()
            .catch(error => { throw new SystemError(error.message) })
            .then(deliveryNotes => {

              if (!deliveryNotes.length) {
                throw new NotFoundError("DeliveryNotes not found")
              }


              return deliveryNotes.map(deliveryNote => {
                deliveryNote.id = deliveryNote._id.toString()
                delete deliveryNote._id

                return deliveryNote
              })
            })
        })
    })
}

export default getAllDeliveryNotesCustomer