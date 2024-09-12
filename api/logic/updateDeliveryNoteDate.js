import validate from "com/validate.js"
import { User, DeliveryNote } from "../model/index.js"
import { NotFoundError, SystemError } from "com/errors.js"

const updateDateDeliveryNote = (userId, deliveryNoteId, date) => {
  console.log("Entrando en updateDateDeliveryNote con:", { userId, deliveryNoteId, date });

  validate.id(userId, "userId")
  validate.id(deliveryNoteId, "deliveryNoteId")
  validate.date(date, "date")

  // Convertir la fecha a un objeto Date
  const [day, month, year] = date.split('/');
  const dateObj = new Date(`${year}-${month}-${day}`)
  console.log("Fecha convertida a objeto Date:", dateObj);

  return User.findById(userId).select("-__v").lean()
    .catch(error => {
      console.error("Error al buscar usuario:", error.message);
      throw new SystemError(error.message)
    })
    .then((user) => {
      console.log("Usuario encontrado:", user);
      if (!user) {
        throw new NotFoundError("User not found")
      }

      return DeliveryNote.findByIdAndUpdate(deliveryNoteId, { date: dateObj }, { new: true }).select("-__v").lean()
        .catch(error => {
          console.error("Error al actualizar nota de entrega:", error.message);
          throw new SystemError(error.message)
        })
        .then(updatedDeliveryNote => {
          console.log("Nota de entrega actualizada:", updatedDeliveryNote);
          if (!updatedDeliveryNote) {
            throw new NotFoundError("Delivery note not found")
          }

          return updateDateDeliveryNote
        })

    })

}

export default updateDateDeliveryNote