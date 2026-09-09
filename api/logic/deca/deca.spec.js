import "dotenv/config"
import fs from "fs"
import { mongoose, Types } from "mongoose"
import bcrypt from "bcryptjs"
import { expect } from "chai"
import { User, DeliveryNote, Deca, Work } from "../../model/index.js"
import createDeca from "./createDeca.js"
import getDeca from "./getDeca.js"
import getDecaByToken from "./getDecaByToken.js"
import getAllDecas from "./getAllDecas.js"
import updateDeca from "./updateDeca.js"
import updateDecaTransportEnd from "./updateDecaTransportEnd.js"
import { NotFoundError, DuplicityError, MatchError } from "com/errors.js"

const { ObjectId } = Types
const { MONGODB_URL_TEST } = process.env

describe("DeCA logic suite", () => {
  let user, customer, deliveryNote, work, validPayload

  before(() => mongoose.connect(MONGODB_URL_TEST))

  beforeEach(async () => {
    await Promise.all([
      User.deleteMany(),
      DeliveryNote.deleteMany(),
      Deca.deleteMany(),
      Work.deleteMany(),
    ])

    const hash = await bcrypt.hash("1234", 10)

    user = await User.create({
      username: "logistica_express",
      email: "info@logistica.es",
      password: hash,
      companyName: "Logística Express SL",
      taxId: "B12345678",
      address: "Polígono Industrial Sur, Nave 4, Valencia",
      role: "user",
    })

    customer = await User.create({
      username: "cliente_madrid",
      email: "compras@clientemadrid.es",
      password: hash,
      companyName: "Distribuciones Madrid SA",
      taxId: "A87654321",
      address: "Calle Alcalá 100, Madrid",
      role: "customer",
      manager: user._id,
    })

    work = await Work.create({
      concept: "Transporte de 2 pallets de componentes electrónicos",
      quantity: 2,
      price: 250,
    })

    deliveryNote = await DeliveryNote.create({
      date: new Date(),
      number: "2026/001",
      company: user._id,
      customer: customer._id,
      works: [work._id],
      observations: "Manejar con precaución",
    })

    validPayload = {
      shipper: {
        name: user.companyName,
        taxId: user.taxId,
        address: user.address,
      },
      carrier: {
        name: "Transportes Rápidos Ibéricos SL",
        taxId: "B99887766",
        address: "Avda. del Transporte 12, Valencia",
      },
      origin: "Valencia (Polígono Industrial Sur)",
      destination: "Madrid (Centro Logístico Coslada)",
      cargoDescription: "Material informático y componentes electrónicos",
      cargoWeight: "850 kg",
      vehiclePlate: "1234-XYZ",
      trailerPlate: "R-5678-ABC",
      driverName: "Carlos Pérez Gómez",
      transportDate: new Date(),
      observations: "Entregar en muelle 3 antes de las 14:00h",
    }
  })

  describe("createDeca", () => {
    it("crea un DeCA exitosamente y genera el archivo PDF físico con QR", async () => {
      const deca = await createDeca(user.id, deliveryNote.id, validPayload)

      expect(deca).to.exist
      expect(deca.number).to.include("DECA-")
      expect(deca.number).to.include("/001")
      expect(deca.shipper.name).to.equal(validPayload.shipper.name)
      expect(deca.carrier.name).to.equal(validPayload.carrier.name)
      expect(deca.origin).to.equal(validPayload.origin)
      expect(deca.destination).to.equal(validPayload.destination)
      expect(deca.cargoDescription).to.equal(validPayload.cargoDescription)
      expect(deca.cargoWeight).to.equal(validPayload.cargoWeight)
      expect(deca.vehiclePlate).to.equal(validPayload.vehiclePlate)
      expect(deca.publicToken).to.be.a("string")
      expect(deca.publicDownloadUrl).to.include(deca.publicToken)
      expect(deca.status).to.equal("active")

      // Verificar que el PDF físico existe en disco
      expect(fs.existsSync(deca.pdfPath)).to.be.true
      const stats = fs.statSync(deca.pdfPath)
      expect(stats.size).to.be.greaterThan(1000)
      // Menos de 5 MB conforme a la ley
      expect(stats.size).to.be.lessThan(5 * 1024 * 1024)

      // Verificar que el albarán tiene la referencia al DeCA
      const dn = await DeliveryNote.findById(deliveryNote.id)
      expect(dn.deca.toString()).to.equal(deca.id.toString())
    })

    it("falla si se intenta emitir un segundo DeCA para el mismo albarán", async () => {
      await createDeca(user.id, deliveryNote.id, validPayload)

      let error
      try {
        await createDeca(user.id, deliveryNote.id, validPayload)
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(DuplicityError)
      expect(error.message).to.include("Ya existe un DeCA")
    })

    it("falla si faltan campos obligatorios del Art. 6 FOM/2861/2012", async () => {
      const invalidPayload = { ...validPayload, origin: "" }

      let error
      try {
        await createDeca(user.id, deliveryNote.id, invalidPayload)
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(MatchError)
      expect(error.message).to.include("origen")
    })
  })

  describe("getDeca", () => {
    it("obtiene el detalle completo del DeCA para el usuario emisor", async () => {
      const created = await createDeca(user.id, deliveryNote.id, validPayload)
      const fetched = await getDeca(user.id, created.id)

      expect(fetched.id).to.equal(created.id)
      expect(fetched.number).to.equal(created.number)
      expect(fetched.deliveryNote).to.exist
      expect(fetched.publicDownloadUrl).to.include(created.publicToken)
    })

    it("falla si el DeCA no existe", async () => {
      let error
      try {
        await getDeca(user.id, new ObjectId().toString())
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(NotFoundError)
    })
  })

  describe("getDecaByToken (Acceso público para inspección)", () => {
    it("permite a un inspector acceder al archivo PDF por token público sin login", async () => {
      const created = await createDeca(user.id, deliveryNote.id, validPayload)
      const inspectionData = await getDecaByToken(created.publicToken)

      expect(inspectionData.pdfPath).to.equal(created.pdfPath)
      expect(inspectionData.pdfFilename).to.equal(created.pdfFilename)
      expect(fs.existsSync(inspectionData.pdfPath)).to.be.true
    })

    it("falla si el token de inspección es inválido o no existe", async () => {
      let error
      try {
        await getDecaByToken("token-inexistente-12345")
      } catch (err) {
        error = err
      }

      expect(error).to.be.an.instanceOf(NotFoundError)
    })
  })

  describe("getAllDecas", () => {
    it("lista todos los DeCA del usuario ordenados por fecha", async () => {
      await createDeca(user.id, deliveryNote.id, validPayload)

      const decasList = await getAllDecas(user.id)
      expect(decasList).to.be.an("array")
      expect(decasList.length).to.equal(1)
      expect(decasList[0].number).to.include("DECA-")
    })
  })

  describe("updateDeca", () => {
    it("modifica datos operativos registrando la trazabilidad histórica exigida", async () => {
      const created = await createDeca(user.id, deliveryNote.id, validPayload)

      const updated = await updateDeca(
        user.id,
        created.id,
        {
          vehiclePlate: "9999-ZZZ",
          destination: "Madrid (Muelle 7, Coslada)",
        },
        "Cambio de cabeza tractora por avería mecánica"
      )

      expect(updated.vehiclePlate).to.equal("9999-ZZZ")
      expect(updated.destination).to.equal("Madrid (Muelle 7, Coslada)")
      expect(updated.modificationHistory.length).to.equal(2)
      expect(updated.modificationHistory[1].description).to.include("avería mecánica")
    })
  })

  describe("updateDecaTransportEnd", () => {
    it("marca la finalización del servicio y calcula el vencimiento de descarga pública a 7 días", async () => {
      const created = await createDeca(user.id, deliveryNote.id, validPayload)
      const finished = await updateDecaTransportEnd(user.id, created.id)

      expect(finished.status).to.equal("completed")
      expect(finished.transportEndDate).to.exist
      expect(finished.publicAccessExpiry).to.exist

      // Verificar que publicAccessExpiry es aproximadamente 7 días después
      const diffMs = new Date(finished.publicAccessExpiry) - new Date(finished.transportEndDate)
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
      expect(diffDays).to.equal(7)
    })
  })

  after(() => mongoose.disconnect())
})
