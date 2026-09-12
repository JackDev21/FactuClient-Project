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
  },
  // Importes calculados para trazabilidad inmutable y cotejo Veri*factu
  baseAmount: {
    type: Number,
    default: 0,
  },
  taxAmount: {
    type: Number,
    default: 0,
  },
  irpfAmount: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    default: 0,
  },
  // Trazabilidad y encadenamiento SHA-256 (RD 1007/2023 y Orden HAC/1177/2024)
  huella: {
    type: String,
  },
  huellaAnterior: {
    type: String,
    default: "",
  },
  tipoFactura: {
    type: String,
    default: "F1",
  },
  fechaHoraHusoGenRegistro: {
    type: String,
  },
  qrUrl: {
    type: String,
  },
  qrDataUrl: {
    type: String,
  },
  facturaAnteriorNumber: {
    type: String,
    default: "",
  },
  facturaAnteriorDate: {
    type: Date,
  },
  verifactuStatus: {
    type: String,
    enum: ["GENERATED", "PENDING_SEND", "ACCEPTED", "ACCEPTED_WITH_ERRORS", "REJECTED"],
    default: "GENERATED",
  },
  verifactuCsv: {
    type: String,
  },
  verifactuSentAt: {
    type: Date,
  },
  verifactuErrors: [{
    type: String,
  }],
})

invoice.index({ company: 1, number: 1 }, { unique: true })

const Invoice = model("Invoice", invoice)

export default Invoice