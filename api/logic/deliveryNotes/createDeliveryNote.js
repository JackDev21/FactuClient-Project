import validate from "com/validate.js"
import { User, DeliveryNote } from "../../model/index.js"
import { NotFoundError, SystemError } from "com/errors.js"

const MAX_RETRIES = 5

const getNextNumber = (allDeliveryNotes, currentYear) => {
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

  return maxNumber + 1
}

const formatNumber = (year, seq) => `${year}/${String(seq).padStart(3, '0')}`

const createDeliveryNote = (userId, customerId) => {
  validate.id(userId, "userId")
  validate.id(customerId, "customerId")

  return User.findById(userId).select("-__v").lean()
    .catch(error => { throw new SystemError(error.message) })
    .then(user => {
      if (!user) {
        throw new NotFoundError("User not found")
      }

      const isDriver = user.role === "driver"
      const companyId = isDriver ? user.manager.toString() : userId

      const currentYear = new Date().getFullYear()

      const attemptCreate = (retryCount = 0) => {
        return DeliveryNote.find({ company: companyId }).select("number").lean()
          .then(allDeliveryNotes => {
            const nextSeq = getNextNumber(allDeliveryNotes, currentYear)
            const deliveryNoteNumber = formatNumber(currentYear, nextSeq)

            const newDeliveryNote = {
              date: new Date(),
              number: deliveryNoteNumber,
              company: companyId,
              customer: customerId,
              observations: "",
              works: [],
              isValued: !isDriver,
              createdBy: userId,
            }

            return DeliveryNote.create(newDeliveryNote)
              .then((deliveryNote) => {
                return DeliveryNote.findById(deliveryNote.id)
                  .populate("customer")
                  .populate("company")
                  .populate("works")
                  .populate("createdBy", "fullName username role")
                  .select("-__v")
                  .lean()
                  .then((deliveryNote) => {
                    deliveryNote.id = deliveryNote._id.toString()
                    delete deliveryNote._id
                    return deliveryNote
                  })
              })
              .catch(error => {
                // Si es un error de duplicado (código 11000), reintentar con el siguiente número
                if (error.code === 11000 && retryCount < MAX_RETRIES) {
                  return attemptCreate(retryCount + 1)
                }
                throw new SystemError(error.message)
              })
          })
      }

      return attemptCreate()
    })
}

export default createDeliveryNote