import validate from "com/validate.js"
import { User, DeliveryNote } from "../../model/index.js"
import { NotFoundError, SystemError, MatchError } from "com/errors.js"

const updateDateDeliveryNote = (userId, deliveryNoteId, date) => {
  validate.id(userId, "userId")
  validate.id(deliveryNoteId, "deliveryNoteId")
  validate.date(date, "date")

  // Convertir la fecha a un objeto Date
  const [day, month, year] = date.split('/')
  const dateObj = new Date(`${year}-${month}-${day}`)

  return User.findById(userId).select("-__v").lean()
    .catch(error => {
      throw new SystemError(error.message)
    })
    .then((user) => {
      if (!user) {
        throw new NotFoundError("User not found")
      }

      return DeliveryNote.findById(deliveryNoteId)
        .catch(error => {
          throw new SystemError(error.message)
        })
        .then(deliveryNote => {
          if (!deliveryNote) {
            throw new NotFoundError("Delivery note not found")
          }

          const isDriver = user.role === "driver"
          const companyId = isDriver && user.manager ? user.manager.toString() : userId

          if (deliveryNote.company.toString() !== companyId) {
            throw new MatchError("Can not update date from another company's delivery note")
          }

          if (isDriver && deliveryNote.createdBy && deliveryNote.createdBy.toString() !== userId) {
            throw new MatchError("Driver can only update date on their own delivery notes")
          }

          deliveryNote.date = dateObj
          return deliveryNote.save()
            .catch(error => { throw new SystemError(error.message) })
            .then(savedNote => {
              const result = savedNote.toObject()
              result.id = result._id.toString()
              delete result._id
              return result
            })
        })
    })
}

export default updateDateDeliveryNote