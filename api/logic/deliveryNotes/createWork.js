import validate from "com/validate.js"
import { Work, User, DeliveryNote } from "../../model/index.js"
import { MatchError, NotFoundError, SystemError } from "com/errors.js"

const createWork = (userId, deliveryNoteId, concept, quantity, price) => {
  validate.id(userId, "userId")
  validate.id(deliveryNoteId, "deliveryNoteId")
  validate.text(concept, "concept")
  validate.number(quantity, "quantity")

  if (price !== undefined && price !== null && price !== "") {
    validate.number(price, "price")
  }

  return User.findById(userId).select("-__v").lean()
    .catch(error => { throw new SystemError(error.message) })
    .then(user => {
      if (!user) {
        throw new NotFoundError("User not found")
      }

      return DeliveryNote.findById(deliveryNoteId).select("-__v").lean()
        .catch(error => { throw new SystemError(error.message) })
        .then((deliveryNote) => {
          if (!deliveryNote) {
            throw new NotFoundError("Delivery note not found")
          }

          const isDriver = user.role === "driver"
          const companyId = isDriver && user.manager ? user.manager.toString() : userId

          if (deliveryNote.company.toString() !== companyId) {
            throw new MatchError("Can not add work to another company's delivery note")
          }

          if (deliveryNote.isInvoiced) {
            throw new MatchError("Can not add work to an invoiced delivery note")
          }

          const work = {
            concept,
            quantity,
            price: (price !== undefined && price !== null && price !== "") ? Number(price) : 0,
          }

          return Work.create(work)
            .catch(error => { throw new SystemError(error.message) })
            .then((work) => {
              const updateFields = { $push: { works: work._id } }
              if (!isDriver && Number(price) > 0) {
                updateFields.isValued = true
              }

              return DeliveryNote.findByIdAndUpdate(deliveryNoteId, updateFields, { new: true })
                .populate("works")
                .select("-__v")
                .lean()
                .catch(error => { throw new SystemError(error.message) })
                .then((deliveryNote) => {
                  deliveryNote.id = deliveryNote._id.toString()
                  delete deliveryNote._id

                  deliveryNote.works.forEach((work) => {
                    work.id = work._id.toString()
                    delete work._id
                  })

                  return deliveryNote
                })
            })
        })
    })
}

export default createWork