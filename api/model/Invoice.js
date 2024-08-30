import { Schema, model } from "mongoose"

const { ObjectId } = Schema.Types

const invoice = new Schema({
  date: {
    type: Date,
    required: true
  },
  number: {
    type: String,
    required: true
  },
  customer: {
    type: ObjectId,
    ref: "User",
  },
  company: {
    type: ObjectId,
    ref: "User",
  },
  deliveryNotes: [{
    type: ObjectId,
    ref: "DeliveryNote",
  }],
  observations: {
    type: String,
  },
  paymentType: {
    type: String,
  }
})

const Invoice = model("Invoice", invoice)

export default Invoice