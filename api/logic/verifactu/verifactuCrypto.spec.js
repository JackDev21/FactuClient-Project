import { expect } from "chai"
import {
  formatDateAeat,
  getIsoDateTimeWithTimezone,
  buildHashInputString,
  computeInvoiceHash,
  buildAeatQrUrl,
  generateQrDataUrl,
} from "../../utils/verifactuCrypto.js"

describe("Veri*factu Cryptographic & QR Suite (Orden HAC/1177/2024)", () => {
  describe("AEAT Official Test Vector 1: Primer registro de alta (sin huella anterior)", () => {
    it("matches the official AEAT hash exactly (Case 6.1 from DIT specs)", () => {
      const params = {
        nif: "89890001K",
        numSerie: "12345678/G33",
        fechaExpedicion: "01-01-2024",
        tipoFactura: "F1",
        cuotaTotal: 12.35,
        importeTotal: 123.45,
        huellaAnterior: "",
        fechaHoraHusoGenRegistro: "2024-01-01T19:20:30+01:00",
      }

      const canonicalString = buildHashInputString(params)
      expect(canonicalString).to.equal(
        "IDEmisorFactura=89890001K&NumSerieFactura=12345678/G33&FechaExpedicionFactura=01-01-2024&TipoFactura=F1&CuotaTotal=12.35&ImporteTotal=123.45&Huella=&FechaHoraHusoGenRegistro=2024-01-01T19:20:30+01:00"
      )

      const hash = computeInvoiceHash(params)
      expect(hash).to.equal(
        "3C464DAF61ACB827C65FDA19F352A4E3BDC2C640E9E9FC4CC058073F38F12F60"
      )
      expect(hash).to.have.lengthOf(64)
    })
  })

  describe("AEAT Official Test Vector 2: Segundo registro encadenado (con huella anterior)", () => {
    it("matches the official AEAT chained hash exactly (Case 6.2 from DIT specs)", () => {
      const params = {
        nif: "89890001K",
        numSerie: "12345679/G34",
        fechaExpedicion: "01-01-2024",
        tipoFactura: "F1",
        cuotaTotal: 12.35,
        importeTotal: 123.45,
        huellaAnterior: "3C464DAF61ACB827C65FDA19F352A4E3BDC2C640E9E9FC4CC058073F38F12F60",
        fechaHoraHusoGenRegistro: "2024-01-01T19:20:35+01:00",
      }

      const canonicalString = buildHashInputString(params)
      expect(canonicalString).to.equal(
        "IDEmisorFactura=89890001K&NumSerieFactura=12345679/G34&FechaExpedicionFactura=01-01-2024&TipoFactura=F1&CuotaTotal=12.35&ImporteTotal=123.45&Huella=3C464DAF61ACB827C65FDA19F352A4E3BDC2C640E9E9FC4CC058073F38F12F60&FechaHoraHusoGenRegistro=2024-01-01T19:20:35+01:00"
      )

      const hash = computeInvoiceHash(params)
      expect(hash).to.equal(
        "F7B94CFD8924EDFF273501B01EE5153E4CE8F259766F88CF6ACB8935802A2B97"
      )
    })
  })

  describe("formatDateAeat", () => {
    it("formats dates correctly as DD-MM-YYYY", () => {
      const formatted = formatDateAeat(new Date(2026, 8, 12)) // Sept 12, 2026
      expect(formatted).to.equal("12-09-2026")
    })
  })

  describe("getIsoDateTimeWithTimezone", () => {
    it("returns ISO 8601 string with timezone offset", () => {
      const iso = getIsoDateTimeWithTimezone()
      expect(iso).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/)
    })
  })

  describe("buildAeatQrUrl", () => {
    it("builds test environment URL with correct parameters", () => {
      const url = buildAeatQrUrl({
        nif: "B12345678",
        numSerie: "2026/001",
        fechaExpedicion: "12-09-2026",
        importeTotal: 150.75,
        isProduction: false,
      })

      expect(url).to.equal(
        "https://prewww2.aeat.es/wlpl/TIKE-CONT/ValidarQR?nif=B12345678&numserie=2026%2F001&fecha=12-09-2026&importe=150.75"
      )
    })

    it("builds production environment URL when requested", () => {
      const url = buildAeatQrUrl({
        nif: "B12345678",
        numSerie: "2026/001",
        fechaExpedicion: "12-09-2026",
        importeTotal: "150.75",
        isProduction: true,
      })

      expect(url).to.equal(
        "https://www2.agenciatributaria.gob.es/wlpl/TIKE-CONT/ValidarQR?nif=B12345678&numserie=2026%2F001&fecha=12-09-2026&importe=150.75"
      )
    })
  })

  describe("generateQrDataUrl", () => {
    it("generates a valid PNG data URL from a QR URL", async () => {
      const url = "https://prewww2.aeat.es/wlpl/TIKE-CONT/ValidarQR?nif=B12345678&numserie=2026%2F001&fecha=12-09-2026&importe=150.75"
      const dataUrl = await generateQrDataUrl(url)

      expect(dataUrl).to.be.a("string")
      expect(dataUrl.startsWith("data:image/png;base64,")).to.be.true
    })
  })
})
