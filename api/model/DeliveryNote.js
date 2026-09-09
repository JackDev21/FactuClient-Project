import { Schema, model } from "mongoose"

const { ObjectId } = Schema.Types

const deliveryNote = new Schema({
  date: {
    type: Date,
    required: true,
  },
  number: {
    type: String,
    required: true,
  },
  company: {
    type: ObjectId,
    required: true,
    ref: "User",
  },
  customer: {
    type: ObjectId,
    required: true,
    ref: "User",
  },
  works: [
    {
      type: ObjectId,
      ref: "Work",
    },
  ],
  observations: {
    type: String,
    required: false,
  },
  isInvoiced: {
    type: Boolean,
    default: false,
  },
  // Albarán valorado (true) o sin valorar (false, utilizado por choferes)
  isValued: {
    type: Boolean,
    default: true,
  },
  // Usuario que generó físicamente el albarán (autónomo o chofer empleado)
  createdBy: {
    type: ObjectId,
    ref: "User",
  },
  deca: {
    type: ObjectId,
    ref: "Deca",
  },
})

deliveryNote.index({ company: 1, number: 1 }, { unique: true })

const DeliveryNote = model("DeliveryNote", deliveryNote)

export default DeliveryNote