import validate from "com/validate.js"
import { User, DeliveryNote } from "../model/index.js"
import { NotFoundError, SystemError } from "com/errors.js"


const updateDateDeliveryNote = (userId, customerId, deliveryNoteId, date) => {
  validate.id(userId, "userId")
  validate.id(customerId, "customerId")
  validate.id(deliveryNoteId, "deliveryNoteId")
  validate.date(date, "date")

  // Convertir la fecha a un objeto Date
  const [day, month, year] = date.split('/');
  const dateObj = new Date(`${year}-${month}-${day}`)

  return User.findById(userId).select("-__v").lean()
    .catch(error => { throw new SystemError(error.message) })
    .then((user) => {
      if (!user) {
        throw new NotFoundError("User not found")
      }


      return User.findById(customerId).select("-__v").lean()
        .catch(error => { throw new SystemError(error.message) })
        .then(customer => {
          if (!customer) {
            throw new NotFoundError("Customer not found")
          }

          return DeliveryNote.findByIdAndUpdate(deliveryNoteId, { date: dateObj }, { new: true }).select("-__v").lean()
            .catch(error => { throw new SystemError(error.message) })
            .then(updatedDeliveryNote => {
              if (!updatedDeliveryNote) {
                throw new NotFoundError("Delivery note not found")
              }

              return updateDateDeliveryNote
            })
        })
    })

}

export default updateDateDeliveryNote 