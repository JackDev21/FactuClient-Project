import { Schema, model } from "mongoose"

const { ObjectId } = Schema.Types

const deliveryNote = new Schema({
  date: {
    type: Date,
    required: true
  },
  number: {
    type: String,
    required: true
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
      ref: "Work"
    }
  ],
  observations: {
    type: String,
    required: false
  }
})

const DeliveryNote = model("DeliveryNote", deliveryNote)

export default DeliveryNote