import { Schema, model } from "mongoose"

const { ObjectId } = Schema.Types

const decaSchema = new Schema({
  // Referencia al albarán de origen
  deliveryNote: {
    type: ObjectId,
    ref: "DeliveryNote",
    required: true,
  },

  // Identificador formal del documento DeCA (ej. DECA-2026/001)
  number: {
    type: String,
    required: true,
  },

  // Fecha y hora exacta de emisión técnica previa al transporte
  generatedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },

  // Empresa creadora / propietaria de la cuenta
  company: {
    type: ObjectId,
    ref: "User",
    required: true,
  },

  // Cliente destinatario (referencia a User con rol customer)
  customer: {
    type: ObjectId,
    ref: "User",
    required: true,
  },

  // --- DATOS OBLIGATORIOS (Art. 6 Orden FOM/2861/2012) ---

  // 1. Cargador contractual
  shipper: {
    name: { type: String, required: true },
    taxId: { type: String, required: true },
    address: { type: String, required: true },
  },

  // 2. Transportista efectivo
  carrier: {
    name: { type: String, required: true },
    taxId: { type: String, required: true },
    address: { type: String, default: "" },
  },

  // 3. Lugares de origen (carga) y destino (descarga)
  origin: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },

  // 4. Naturaleza y peso de la mercancía
  cargoDescription: {
    type: String,
    required: true,
  },
  cargoWeight: {
    type: String, // Texto o número formateado (ej. "1200 kg" o "Aprox. 2 pallets")
    required: true,
  },

  // --- DATOS OPERATIVOS COMPLEMENTARIOS ---
  vehiclePlate: {
    type: String,
    default: "",
  },
  trailerPlate: {
    type: String,
    default: "",
  },
  transportDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  driverName: {
    type: String,
    default: "",
  },

  // --- GESTIÓN DEL ARCHIVO PDF Y ACCESO PÚBLICO (INSPECCIÓN) ---
  pdfFilename: {
    type: String,
    required: true,
  },
  pdfPath: {
    type: String,
    required: true,
  },
  publicToken: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },

  // --- TRAZABILIDAD Y REGISTRO DE MODIFICACIONES (Resolución 5 junio 2026) ---
  modificationHistory: [
    {
      date: { type: Date, default: Date.now },
      description: { type: String, required: true },
      modifiedFields: [{ type: String }],
    },
  ],

  // --- CONTROL DE VIGENCIA Y CUSTODIA LEGAL ---
  status: {
    type: String,
    enum: ["active", "in_transit", "completed", "expired"],
    default: "active",
  },
  transportEndDate: {
    type: Date,
  },
  publicAccessExpiry: {
    type: Date, // 7 días naturales tras finalizar el porte
  },
  retainUntil: {
    type: Date, // Mínimo 1 año de conservación exigido por ley
    required: true,
  },

  observations: {
    type: String,
    default: "",
  },
})

decaSchema.index({ company: 1, number: 1 }, { unique: true })

const Deca = model("Deca", decaSchema)

export default Deca
