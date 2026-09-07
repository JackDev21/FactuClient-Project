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

      return DeliveryNote.find({ company: userId }).select("number").lean()
        .then(allDeliveryNotes => {
              const currentYear = new Date().getFullYear()

              // Extraer el número secuencial de cualquier formato
              let maxNumber = 0
              allDeliveryNotes.forEach(dn => {
                const num = dn.number || ""
                let year, seq

                if (num.startsWith("ALB-")) {
                  // Formato legacy ALB-2026-0062
                  const parts = num.split("-")
                  year = parseInt(parts[1])
                  seq = parseInt(parts[2])
                } else if (num.includes("/")) {
                  // Formato actual 2026/001
                  const parts = num.split("/")
                  year = parseInt(parts[0])
                  seq = parseInt(parts[1])
                } else {
                  return // formato desconocido, ignorar
                }

                if (year === currentYear && seq > maxNumber) {
                  maxNumber = seq
                }
              })

              const nextNumber = maxNumber + 1
              const deliveryNoteNumber = `${currentYear}/${String(nextNumber).padStart(3, '0')}`

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
}

export default createDeliveryNote