import validate from "com/validate.js"
import { User, DeliveryNote } from "../../model/index.js"
import { NotFoundError, SystemError, ContentError, MatchError } from "com/errors.js"

const addNewObservation = (userId, deliveryNoteId, observation) => {
  validate.id(userId, "userId")
  validate.id(deliveryNoteId, "deliveryNoteId")
  if (typeof observation !== "string") {
    throw new ContentError("observation is not valid")
  }

  return User.findById(userId).select("-__v").lean()
    .catch(error => { throw new SystemError(error.message) })
    .then(user => {
      if (!user) {
        throw new NotFoundError("User not found")
      }

      return DeliveryNote.findById(deliveryNoteId)
        .catch(error => { throw new SystemError(error.message) })
        .then((deliveryNote) => {
          if (!deliveryNote) {
            throw new NotFoundError("Delivery note not found")
          }

          const isDriver = user.role === "driver"
          const companyId = isDriver && user.manager ? user.manager.toString() : userId

          if (deliveryNote.company.toString() !== companyId) {
            throw new MatchError("Can not update observation from another company's delivery note")
          }

          deliveryNote.observations = observation

          return deliveryNote.save()
            .catch(error => { throw new SystemError(error.message) })
            .then((savedNote) => {
              const result = savedNote.toObject()
              result.id = result._id.toString()
              delete result._id
              return result
            })
        })
    })
}

export default addNewObservation