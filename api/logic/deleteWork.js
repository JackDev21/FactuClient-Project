import validate from "com/validate.js"
import { Work, User, DeliveryNote } from "../model/index.js"
import { NotFoundError, SystemError } from "com/errors.js"

const deleteWork = (userId, deliveryNoteId, workId) => {
  validate.id(userId, "userId")
  validate.id(deliveryNoteId, "deliveryNoteId")
  validate.id(workId, "workId")

  return User.findById(userId).select("-__v").lean()
    .catch((error) => { throw new SystemError(error.message) })
    .then((user) => {
      if (!user) {
        throw new NotFoundError("User not found")
      }

      return DeliveryNote.findById(deliveryNoteId)
        .catch((error) => { throw new SystemError(error.message) })
        .then((deliveryNote) => {
          if (!deliveryNote) {
            throw new NotFoundError("Delivery note not found")
          }

          return Work.findByIdAndDelete(workId)
            .catch((error) => { throw new SystemError(error.message) })
            .then(() => {
              return DeliveryNote.findByIdAndUpdate(
                deliveryNoteId,
                { $pull: { works: workId } },
                { new: true }
              )
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

export default deleteWork
