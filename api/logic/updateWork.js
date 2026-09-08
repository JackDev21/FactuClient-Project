import validate from "com/validate.js"
import { Work, User, DeliveryNote } from "../model/index.js"
import { MatchError, NotFoundError, SystemError } from "com/errors.js"

const updateWork = (userId, deliveryNoteId, workId, concept, quantity, price) => {
  validate.id(userId, "userId")
  validate.id(deliveryNoteId, "deliveryNoteId")
  validate.id(workId, "workId")
  validate.text(concept, "concept")
  validate.number(quantity, "quantity")
  validate.number(price, "price")

  return User.findById(userId).select("-__v").lean()
    .catch((error) => { throw new SystemError(error.message) })
    .then((user) => {
      if (!user) {
        throw new NotFoundError("User not found")
      }

      return DeliveryNote.findById(deliveryNoteId).select("-__v").lean()
        .catch((error) => { throw new SystemError(error.message) })
        .then((deliveryNote) => {
          if (!deliveryNote) {
            throw new NotFoundError("Delivery note not found")
          }

          if (deliveryNote.company.toString() !== userId) {
            throw new MatchError("Can not update work from another company's delivery note")
          }

          if (deliveryNote.isInvoiced) {
            throw new MatchError("Can not update work in an invoiced delivery note")
          }

          return Work.findByIdAndUpdate(
            workId,
            { concept, quantity, price },
            { new: true }
          )
            .catch((error) => { throw new SystemError(error.message) })
            .then((updatedWork) => {
              if (!updatedWork) {
                throw new NotFoundError("Work not found")
              }

              return DeliveryNote.findById(deliveryNoteId)
                .populate("works")
                .populate("customer")
                .populate("company")
                .select("-__v")
                .lean()
                .catch((error) => { throw new SystemError(error.message) })
                .then((updatedDeliveryNote) => {
                  updatedDeliveryNote.id = updatedDeliveryNote._id.toString()
                  delete updatedDeliveryNote._id

                  updatedDeliveryNote.works.forEach((w) => {
                    w.id = w._id.toString()
                    delete w._id
                  })

                  return updatedDeliveryNote
                })
            })
        })
    })
}

export default updateWork
