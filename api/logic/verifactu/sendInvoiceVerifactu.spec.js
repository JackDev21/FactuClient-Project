import "dotenv/config"
import mongoose, { Types } from "mongoose"
import bcrypt from "bcryptjs"
import { expect } from "chai"

import sendInvoiceVerifactu from "./sendInvoiceVerifactu.js"
import { User, Invoice, DeliveryNote, Work } from "../../model/index.js"
import { NotFoundError, MatchError, CredentialsError } from "com/errors.js"

const { ObjectId } = Types
const { MONGODB_URL_TEST } = process.env

describe("sendInvoiceVerifactu logic suite", () => {
  before(() => mongoose.connect(MONGODB_URL_TEST).then(() => User.deleteMany().then(() => Invoice.deleteMany())))
  beforeEach(() => Promise.all([
    User.deleteMany(),
    Invoice.deleteMany(),
    DeliveryNote.deleteMany(),
    Work.deleteMany(),
  ]))

  it("succeeds when AEAT accepts the invoice registration", async () => {
    const passwordHash = await bcrypt.hash("1234", 8)
    const company = await User.create({
      username: "EmpresaTest",
      email: "empresa@test.es",
      password: passwordHash,
      role: "company",
      taxId: "B12345678",
      companyName: "Empresa Test SL",
    })

    const customer = await User.create({
      username: "ClienteTest",
      email: "cliente@test.es",
      password: passwordHash,
      role: "customer",
      taxId: "A87654321",
    })

    const invoice = await Invoice.create({
      date: new Date(),
      number: "F-2026/0001",
      company: company._id,
      customer: customer._id,
      deliveryNotes: [],
      observations: "Prueba Verifactu",
      paymentType: "Transferencia",
      baseAmount: 100,
      taxAmount: 21,
      irpfAmount: 0,
      totalAmount: 121,
      huella: "A".repeat(64),
      tipoFactura: "F1",
      fechaHoraHusoGenRegistro: "2026-09-12T10:00:00+02:00",
    })

    const fakeSendFn = async (xmlPayload, options) => {
      expect(xmlPayload).to.include("<sf:RegistroAlta>")
      expect(xmlPayload).to.include("B12345678")
      return {
        success: true,
        csv: "CSV1234567890ABCDEF",
        estadoRegistro: "Correcta",
        estadoEnvio: "Correcto",
      }
    }

    const { invoice: updatedInvoice, result } = await sendInvoiceVerifactu(
      company._id.toString(),
      invoice._id.toString(),
      { sendFn: fakeSendFn }
    )

    expect(result.success).to.be.true
    expect(result.csv).to.equal("CSV1234567890ABCDEF")
    expect(updatedInvoice.verifactuStatus).to.equal("ACCEPTED")
    expect(updatedInvoice.verifactuCsv).to.equal("CSV1234567890ABCDEF")
    expect(updatedInvoice.verifactuSentAt).to.be.ok
    expect(updatedInvoice.verifactuErrors).to.be.empty

    // Verificar en base de datos
    const dbInvoice = await Invoice.findById(invoice._id)
    expect(dbInvoice.verifactuStatus).to.equal("ACCEPTED")
    expect(dbInvoice.verifactuCsv).to.equal("CSV1234567890ABCDEF")
  })

  it("updates invoice to ACCEPTED_WITH_ERRORS when AEAT accepts with warnings", async () => {
    const passwordHash = await bcrypt.hash("1234", 8)
    const company = await User.create({
      username: "EmpresaTest2",
      email: "empresa2@test.es",
      password: passwordHash,
      role: "company",
      taxId: "B12345678",
    })

    const customer = await User.create({
      username: "ClienteTest2",
      email: "cliente2@test.es",
      password: passwordHash,
      role: "customer",
      taxId: "A87654321",
    })

    const invoice = await Invoice.create({
      date: new Date(),
      number: "F-2026/0002",
      company: company._id,
      customer: customer._id,
      deliveryNotes: [],
      paymentType: "Transferencia",
      baseAmount: 200,
      totalAmount: 242,
      huella: "B".repeat(64),
      tipoFactura: "F1",
    })

    const fakeSendFn = async () => ({
      success: true,
      csv: "CSVWARNING987654",
      estadoRegistro: "AceptadaConErrores",
      estadoEnvio: "Correcto",
    })

    const { invoice: updatedInvoice } = await sendInvoiceVerifactu(
      company._id.toString(),
      invoice._id.toString(),
      { sendFn: fakeSendFn }
    )

    expect(updatedInvoice.verifactuStatus).to.equal("ACCEPTED_WITH_ERRORS")
    expect(updatedInvoice.verifactuCsv).to.equal("CSVWARNING987654")
  })

  it("updates invoice to REJECTED when AEAT rejects the invoice", async () => {
    const passwordHash = await bcrypt.hash("1234", 8)
    const company = await User.create({
      username: "EmpresaTest3",
      email: "empresa3@test.es",
      password: passwordHash,
      role: "company",
      taxId: "B12345678",
    })

    const customer = await User.create({
      username: "ClienteTest3",
      email: "cliente3@test.es",
      password: passwordHash,
      role: "customer",
      taxId: "A87654321",
    })

    const invoice = await Invoice.create({
      date: new Date(),
      number: "F-2026/0003",
      company: company._id,
      customer: customer._id,
      deliveryNotes: [],
      paymentType: "Transferencia",
      baseAmount: 50,
      totalAmount: 60.5,
      huella: "C".repeat(64),
      tipoFactura: "F1",
    })

    const fakeSendFn = async () => ({
      success: false,
      codigoError: "3000",
      descripcionError: "NIF del emisor no censado",
      estadoRegistro: "Incorrecta",
    })

    const { invoice: updatedInvoice, result } = await sendInvoiceVerifactu(
      company._id.toString(),
      invoice._id.toString(),
      { sendFn: fakeSendFn }
    )

    expect(result.success).to.be.false
    expect(updatedInvoice.verifactuStatus).to.equal("REJECTED")
    expect(updatedInvoice.verifactuErrors[0]).to.include("NIF del emisor no censado")

    const dbInvoice = await Invoice.findById(invoice._id)
    expect(dbInvoice.verifactuStatus).to.equal("REJECTED")
    expect(dbInvoice.verifactuErrors[0]).to.include("NIF del emisor no censado")
  })

  it("fails if requester is a driver", async () => {
    const passwordHash = await bcrypt.hash("1234", 8)
    const driver = await User.create({
      username: "Chofer",
      email: "chofer@test.es",
      password: passwordHash,
      role: "driver",
    })

    try {
      await sendInvoiceVerifactu(driver._id.toString(), new ObjectId().toString())
      expect.fail("Should have thrown CredentialsError")
    } catch (err) {
      expect(err).to.be.instanceOf(CredentialsError)
      expect(err.message).to.equal("Only company owners can remit invoices to AEAT")
    }
  })

  it("fails if invoice does not belong to company", async () => {
    const passwordHash = await bcrypt.hash("1234", 8)
    const company1 = await User.create({
      username: "Empresa1",
      email: "empresa1@test.es",
      password: passwordHash,
      role: "company",
    })

    const company2 = await User.create({
      username: "Empresa2",
      email: "empresa2@test.es",
      password: passwordHash,
      role: "company",
    })

    const customer = await User.create({
      username: "Cliente",
      email: "cliente@test.es",
      password: passwordHash,
      role: "customer",
    })

    const invoice = await Invoice.create({
      date: new Date(),
      number: "F-2026/9999",
      company: company2._id,
      customer: customer._id,
      deliveryNotes: [],
      paymentType: "Transferencia",
      baseAmount: 10,
      totalAmount: 12.1,
      huella: "D".repeat(64),
    })

    try {
      await sendInvoiceVerifactu(company1._id.toString(), invoice._id.toString())
      expect.fail("Should have thrown MatchError")
    } catch (err) {
      expect(err).to.be.instanceOf(MatchError)
      expect(err.message).to.equal("Can not remit invoice from another company")
    }
  })
})
