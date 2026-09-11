import { User, DeliveryNote, Invoice } from "../../model/index.js"
import validate from "com/validate.js"
import { NotFoundError, SystemError, MatchError } from "com/errors.js"

function getDeliveryNote(userId, deliveryNoteId) {
  validate.id(userId, "userId")
  validate.id(deliveryNoteId, "deliveryNoteId")

  return User.findById(userId).lean()
    .catch(error => { throw new SystemError(error.message) })
    .then(user => {
      if (!user) {
        throw new NotFoundError("User not found")
      }

      return Promise.all([
        DeliveryNote.findById(deliveryNoteId)
          .populate("customer")
          .populate("company")
          .populate("works")
          .populate("createdBy", "fullName username role")
          .select("-__v")
          .lean(),
        Invoice.findOne({ deliveryNotes: deliveryNoteId }).select("number").lean()
      ])
        .catch(error => { throw new SystemError(error.message) })
        .then(([deliveryNote, invoice]) => {
          if (!deliveryNote) {
            throw new NotFoundError("DeliveryNote not found")
          }

          const isCompany = deliveryNote.company && (deliveryNote.company._id?.toString() === userId || deliveryNote.company.toString() === userId)
          const isCustomer = deliveryNote.customer && (deliveryNote.customer._id?.toString() === userId || deliveryNote.customer.toString() === userId)
          const isCompanyDriver = user.role === "driver" && user.manager && (deliveryNote.company._id?.toString() === user.manager.toString() || deliveryNote.company.toString() === user.manager.toString())

          if (!isCompany && !isCustomer && !isCompanyDriver) {
            throw new MatchError("Can not access delivery note from another company")
          }

          deliveryNote.id = deliveryNote._id.toString()
          delete deliveryNote._id

          deliveryNote.isInvoiced = !!invoice
          deliveryNote.invoiceNumber = invoice?.number || null

          if (user.role === "driver") {
            (deliveryNote.works || []).forEach(work => {
              delete work.price
            })
          }

          return deliveryNote
        })
    })
}
export default getDeliveryNote