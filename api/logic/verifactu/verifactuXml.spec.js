import { expect } from "chai"
import { escapeXml, buildAltaFacturaXml } from "../../utils/verifactuXmlBuilder.js"

describe("Veri*factu XML Builder Suite (SuministroLR.xsd & SuministroInformacion.xsd)", () => {
  describe("escapeXml", () => {
    it("escapes special characters properly", () => {
      const unsafe = `Transportes & Logística "El Rápido" <SL> & Cía 'S.L.'`
      const safe = escapeXml(unsafe)

      expect(safe).to.include("&amp;")
      expect(safe).to.include("&quot;")
      expect(safe).to.include("&lt;")
      expect(safe).to.include("&gt;")
      expect(safe).to.include("&apos;")
      expect(safe).to.not.include(`"`)
      expect(safe).to.not.include(`<`)
    })
  })

  describe("buildAltaFacturaXml", () => {
    it("generates correct SOAP envelope for first invoice with PrimerRegistro", () => {
      const invoice = {
        number: "2026/001",
        date: new Date(2026, 8, 12),
        baseAmount: 100,
        taxAmount: 21,
        totalAmount: 121,
        huella: "3C464DAF61ACB827C65FDA19F352A4E3BDC2C640E9E9FC4CC058073F38F12F60",
        huellaAnterior: "",
        fechaHoraHusoGenRegistro: "2026-09-12T11:30:00+02:00",
        company: {
          taxId: "B12345678",
          companyName: "Empresa Emisora SL",
        },
        customer: {
          taxId: "A98765432",
          companyName: "Cliente Receptor SA",
        },
      }

      const xml = buildAltaFacturaXml(invoice)

      expect(xml).to.include("<soapenv:Envelope")
      expect(xml).to.include("<sf:ObligadoEmision>")
      expect(xml).to.include("<sf:NIF>B12345678</sf:NIF>")
      expect(xml).to.include("<sf:NombreRazon>Empresa Emisora SL</sf:NombreRazon>")
      expect(xml).to.include("<sf:IDVersion>1.0</sf:IDVersion>")
      expect(xml).to.include("<sf:NumSerieFactura>2026/001</sf:NumSerieFactura>")
      expect(xml).to.include("<sf:FechaExpedicionFactura>12-09-2026</sf:FechaExpedicionFactura>")
      expect(xml).to.include("<sf:TipoFactura>F1</sf:TipoFactura>")
      expect(xml).to.include("<sf:BaseImponibleOimporteNoSujeto>100.00</sf:BaseImponibleOimporteNoSujeto>")
      expect(xml).to.include("<sf:CuotaRepercutida>21.00</sf:CuotaRepercutida>")
      expect(xml).to.include("<sf:CuotaTotal>21.00</sf:CuotaTotal>")
      expect(xml).to.include("<sf:ImporteTotal>121.00</sf:ImporteTotal>")
      expect(xml).to.include("<sf:PrimerRegistro>S</sf:PrimerRegistro>")
      expect(xml).to.include("<sf:NombreSistemaInformatico>FactuClient</sf:NombreSistemaInformatico>")
      expect(xml).to.include("<sf:Huella>3C464DAF61ACB827C65FDA19F352A4E3BDC2C640E9E9FC4CC058073F38F12F60</sf:Huella>")
    })

    it("generates correct SOAP envelope for chained invoice with RegistroAnterior", () => {
      const invoice = {
        number: "2026/002",
        date: new Date(2026, 8, 12),
        baseAmount: 200,
        taxAmount: 42,
        totalAmount: 242,
        huella: "F7B94CFD8924EDFF273501B01EE5153E4CE8F259766F88CF6ACB8935802A2B97",
        huellaAnterior: "3C464DAF61ACB827C65FDA19F352A4E3BDC2C640E9E9FC4CC058073F38F12F60",
        facturaAnteriorNumber: "2026/001",
        facturaAnteriorDate: new Date(2026, 8, 12),
        fechaHoraHusoGenRegistro: "2026-09-12T11:35:00+02:00",
        company: {
          taxId: "B12345678",
          companyName: "Empresa Emisora SL",
        },
        customer: {
          taxId: "A98765432",
          companyName: "Cliente Receptor SA",
        },
      }

      const xml = buildAltaFacturaXml(invoice)

      expect(xml).to.include("<sf:RegistroAnterior>")
      expect(xml).to.include("<sf:NumSerieFactura>2026/001</sf:NumSerieFactura>")
      expect(xml).to.include("<sf:Huella>3C464DAF61ACB827C65FDA19F352A4E3BDC2C640E9E9FC4CC058073F38F12F60</sf:Huella>")
      expect(xml).to.include("<sf:Huella>F7B94CFD8924EDFF273501B01EE5153E4CE8F259766F88CF6ACB8935802A2B97</sf:Huella>")
    })
  })
})
