import validate from "com/validate.js"
import { User, DeliveryNote } from "../model/index.js"
import { NotFoundError, SystemError } from "com/errors.js"

const createDeliveryNote = (userId, customerId) => {
  validate.id(userId, "userId")
  validate.id(customerId, "customerId")

  return User.findById(userId).select("-__v").lean()
    .catch(error => { throw new SystemError(error.message) })
    .then(user => {
      if (!user) {
        throw new NotFoundError("User not found")
      }

      return DeliveryNote.findOne({ company: userId }).sort({ number: -1 }).select("-__v").lean()
        .then(lastDeliveryNote => {
          const currentYear = new Date().getFullYear()
          //const currentYear = 2025 // prueba con año 2025 para ver si modifica la nota de entrega

          let nextDeliveryNoteNumber = 1

          if (lastDeliveryNote) {
            const [lastYear, lastNumber] = lastDeliveryNote.number.split("/") // ["2024", "001"]

            if (currentYear === parseInt(lastYear)) {

              nextDeliveryNoteNumber = parseInt(lastNumber) + 1
            } else {
              nextDeliveryNoteNumber = 1
            }
          }

          const deliveryNoteNumber = `${currentYear}/${String(nextDeliveryNoteNumber).padStart(3, '0')}`

          return DeliveryNote.findOne({ number: deliveryNoteNumber, company: userId }).select("-__v").lean()
            .then(() => {
              const newDeliveryNote = {
                date: new Date(),
                number: deliveryNoteNumber,
                company: userId,
                customer: customerId,
                observations: "",
                works: [],
              }

              return DeliveryNote.create(newDeliveryNote)
                .catch(error => { throw new SystemError(error.message) })
                .then((deliveryNote) => {
                  return DeliveryNote.findById(deliveryNote.id).populate("customer").populate("company").populate("works").select("-__v").lean()
                    .then((deliveryNote) => {
                      deliveryNote.id = deliveryNote._id.toString()
                      delete deliveryNote._id
                      return deliveryNote
                    })
                })
            })
        })
    })
}

export default createDeliveryNote