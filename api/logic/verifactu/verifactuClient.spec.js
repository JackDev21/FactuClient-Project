import { expect } from "chai"
import { parseAeatResponse, createClientCertAgent, AEAT_ENDPOINTS } from "../../utils/verifactuClient.js"

describe("Veri*factu AEAT Client Suite", () => {
  describe("AEAT_ENDPOINTS", () => {
    it("defines official endpoints for test and production", () => {
      expect(AEAT_ENDPOINTS.TEST).to.equal(
        "https://prewww1.aeat.es/wlpl/TIKE-CONT/ws/SistemaFacturacion/VerifactuSOAP"
      )
      expect(AEAT_ENDPOINTS.PRODUCTION).to.equal(
        "https://www1.agenciatributaria.gob.es/wlpl/TIKE-CONT/ws/SistemaFacturacion/VerifactuSOAP"
      )
    })
  })

  describe("createClientCertAgent", () => {
    it("throws a clear error if the certificate file is not found", () => {
      expect(() => {
        createClientCertAgent("certs/non_existent.pfx", "password")
      }).to.throw(/Certificado digital no encontrado/i)
    })
  })

  describe("parseAeatResponse", () => {
    it("correctly parses an accepted response with CSV", () => {
      const mockSuccessXml = `
        <env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/">
          <env:Body>
            <sfR:RespuestaRegFactuSistemaFacturacion xmlns:sfR="https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/RespuestaSuministro.xsd" xmlns:sf="https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroInformacion.xsd">
              <sfR:CSV>CSV-AEAT-2026-ABCD-998877</sfR:CSV>
              <sfR:TiempoEsperaEnvio>60</sfR:TiempoEsperaEnvio>
              <sfR:EstadoEnvio>Correcto</sfR:EstadoEnvio>
              <sfR:RespuestaLinea>
                <sfR:EstadoRegistro>Correcta</sfR:EstadoRegistro>
              </sfR:RespuestaLinea>
            </sfR:RespuestaRegFactuSistemaFacturacion>
          </env:Body>
        </env:Envelope>
      `

      const result = parseAeatResponse(mockSuccessXml)
      expect(result.success).to.be.true
      expect(result.csv).to.equal("CSV-AEAT-2026-ABCD-998877")
      expect(result.estadoEnvio).to.equal("Correcto")
      expect(result.estadoRegistro).to.equal("Correcta")
      expect(result.tiempoEspera).to.equal(60)
    })

    it("correctly parses an error / rejected response from AEAT", () => {
      const mockErrorXml = `
        <env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/">
          <env:Body>
            <sfR:RespuestaRegFactuSistemaFacturacion xmlns:sfR="https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/RespuestaSuministro.xsd">
              <sfR:EstadoEnvio>Incorrecto</sfR:EstadoEnvio>
              <sfR:RespuestaLinea>
                <sfR:EstadoRegistro>Incorrecta</sfR:EstadoRegistro>
                <sfR:CodigoErrorRegistro>4102</sfR:CodigoErrorRegistro>
                <sfR:DescripcionErrorRegistro>El NIF del emisor no se encuentra identificado en el censo de la AEAT</sfR:DescripcionErrorRegistro>
              </sfR:RespuestaLinea>
            </sfR:RespuestaRegFactuSistemaFacturacion>
          </env:Body>
        </env:Envelope>
      `

      const result = parseAeatResponse(mockErrorXml)
      expect(result.success).to.be.false
      expect(result.estadoEnvio).to.equal("Incorrecto")
      expect(result.estadoRegistro).to.equal("Incorrecta")
      expect(result.codigoError).to.equal("4102")
      expect(result.descripcionError).to.include("censo de la AEAT")
    })

    it("correctly parses a SOAP Fault message", () => {
      const mockFaultXml = `
        <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <soap:Fault>
              <faultcode>soap:Server</faultcode>
              <faultstring>Certificado cliente no admitido o revocado</faultstring>
            </soap:Fault>
          </soap:Body>
        </soap:Envelope>
      `

      const result = parseAeatResponse(mockFaultXml)
      expect(result.success).to.be.false
      expect(result.status).to.equal("FAULT")
      expect(result.message).to.include("Certificado cliente no admitido")
    })
  })
})
