import { formatDateAeat, getIsoDateTimeWithTimezone } from "./verifactuCrypto.js"

/**
 * Escapa caracteres especiales XML para garantizar XML válido
 * @param {string} unsafe 
 * @returns {string} Texto seguro para XML
 */
export const escapeXml = (unsafe = "") => {
  return String(unsafe || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

/**
 * Construye el mensaje SOAP completo para la remisión de un Registro de Facturación de Alta
 * conforme a los esquemas SuministroLR.xsd y SuministroInformacion.xsd de la AEAT
 * (RD 1007/2023 y Orden HAC/1177/2024).
 *
 * @param {Object} invoice - Objeto de factura poblado con company y customer
 * @param {Object} [options]
 * @param {string} [options.producerNif] - NIF de la entidad desarrolladora (opcional)
 * @param {string} [options.producerName] - Nombre de la entidad desarrolladora (opcional)
 * @returns {string} Envoltorio SOAP 1.1 con el payload XML de la AEAT
 */
export const buildAltaFacturaXml = (invoice, options = {}) => {
  const company = invoice.company || {}
  const customer = invoice.customer || {}

  const emisorNif = (company.taxId || "").trim().toUpperCase()
  const emisorName = (company.companyName || company.fullName || company.username || "EMPRESA").trim()

  const clienteNif = (customer.taxId || "").trim().toUpperCase()
  const clienteName = (customer.companyName || customer.fullName || customer.username || "CLIENTE").trim()

  const numSerie = (invoice.number || "").trim()
  const fechaExpedicion = formatDateAeat(invoice.date || new Date())
  const tipoFactura = invoice.tipoFactura || "F1"

  const baseAmount = typeof invoice.baseAmount === "number" ? invoice.baseAmount : 0
  const taxAmount = typeof invoice.taxAmount === "number" ? invoice.taxAmount : 0
  const totalAmount = typeof invoice.totalAmount === "number" ? invoice.totalAmount : 0

  const huella = (invoice.huella || "").trim().toUpperCase()
  const huellaAnterior = (invoice.huellaAnterior || "").trim().toUpperCase()
  const fechaHoraHuso = invoice.fechaHoraHusoGenRegistro || getIsoDateTimeWithTimezone(invoice.date || new Date())

  // Descripción de la operación
  const descripcionOperacion =
    invoice.observations && invoice.observations.trim().length > 0
      ? invoice.observations.trim().substring(0, 500)
      : `Factura ${numSerie} - Servicios de transporte y logística`

  // Productor del software (Declaración Responsable según Art. 15)
  const producerNif = (options.producerNif || process.env.VERIFACTU_PRODUCER_NIF || emisorNif || "B00000000").trim().toUpperCase()
  const producerName = (options.producerName || process.env.VERIFACTU_PRODUCER_NAME || "FactuClient Software").trim()

  // Bloque de destinatario (Cliente)
  let destinatarioXml = ""
  if (clienteNif) {
    destinatarioXml = `
          <sf:Destinatarios>
            <sf:IDDestinatario>
              <sf:NombreRazon>${escapeXml(clienteName)}</sf:NombreRazon>
              <sf:NIF>${clienteNif}</sf:NIF>
            </sf:IDDestinatario>
          </sf:Destinatarios>`
  }

  // Bloque de Encadenamiento (Art. 7 Orden HAC/1177/2024)
  let encadenamientoXml = ""
  if (!huellaAnterior || huellaAnterior.length === 0) {
    encadenamientoXml = `<sf:PrimerRegistro>S</sf:PrimerRegistro>`
  } else {
    const prevNumber = (invoice.facturaAnteriorNumber || invoice.previousInvoiceNumber || "").trim()
    const prevFecha = invoice.facturaAnteriorDate
      ? formatDateAeat(invoice.facturaAnteriorDate)
      : fechaExpedicion

    encadenamientoXml = `
            <sf:RegistroAnterior>
              <sf:IDEmisorFactura>${emisorNif}</sf:IDEmisorFactura>
              <sf:NumSerieFactura>${escapeXml(prevNumber)}</sf:NumSerieFactura>
              <sf:FechaExpedicionFactura>${prevFecha}</sf:FechaExpedicionFactura>
              <sf:Huella>${huellaAnterior}</sf:Huella>
            </sf:RegistroAnterior>`
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:sfLR="https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroLR.xsd"
  xmlns:sf="https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroInformacion.xsd">
  <soapenv:Header/>
  <soapenv:Body>
    <sfLR:RegFactuSistemaFacturacion>
      <sfLR:Cabecera>
        <sf:ObligadoEmision>
          <sf:NombreRazon>${escapeXml(emisorName)}</sf:NombreRazon>
          <sf:NIF>${emisorNif}</sf:NIF>
        </sf:ObligadoEmision>
        <sf:RemisionVoluntaria/>
      </sfLR:Cabecera>
      <sfLR:RegistroFactura>
        <sf:RegistroAlta>
          <sf:IDVersion>1.0</sf:IDVersion>
          <sf:IDFactura>
            <sf:IDEmisorFactura>${emisorNif}</sf:IDEmisorFactura>
            <sf:NumSerieFactura>${escapeXml(numSerie)}</sf:NumSerieFactura>
            <sf:FechaExpedicionFactura>${fechaExpedicion}</sf:FechaExpedicionFactura>
          </sf:IDFactura>
          <sf:NombreRazonEmisor>${escapeXml(emisorName)}</sf:NombreRazonEmisor>
          <sf:TipoFactura>${tipoFactura}</sf:TipoFactura>
          <sf:DescripcionOperacion>${escapeXml(descripcionOperacion)}</sf:DescripcionOperacion>${destinatarioXml}
          <sf:Desglose>
            <sf:DetalleDesglose>
              <sf:ClaveRegimen>01</sf:ClaveRegimen>
              <sf:CalificacionOperacion>S1</sf:CalificacionOperacion>
              <sf:TipoImpositivo>21.00</sf:TipoImpositivo>
              <sf:BaseImponibleOimporteNoSujeto>${baseAmount.toFixed(2)}</sf:BaseImponibleOimporteNoSujeto>
              <sf:CuotaRepercutida>${taxAmount.toFixed(2)}</sf:CuotaRepercutida>
            </sf:DetalleDesglose>
          </sf:Desglose>
          <sf:CuotaTotal>${taxAmount.toFixed(2)}</sf:CuotaTotal>
          <sf:ImporteTotal>${totalAmount.toFixed(2)}</sf:ImporteTotal>
          <sf:Encadenamiento>
            ${encadenamientoXml}
          </sf:Encadenamiento>
          <sf:SistemaInformatico>
            <sf:NombreRazon>${escapeXml(producerName)}</sf:NombreRazon>
            <sf:NIF>${producerNif}</sf:NIF>
            <sf:NombreSistemaInformatico>FactuClient</sf:NombreSistemaInformatico>
            <sf:IdSistemaInformatico>FC</sf:IdSistemaInformatico>
            <sf:Version>1.0.0</sf:Version>
            <sf:NumeroInstalacion>1</sf:NumeroInstalacion>
            <sf:TipoUsoPosibleSoloVerifactu>S</sf:TipoUsoPosibleSoloVerifactu>
            <sf:TipoUsoPosibleMultiOT>S</sf:TipoUsoPosibleMultiOT>
            <sf:IndicadorMultiplesOT>S</sf:IndicadorMultiplesOT>
          </sf:SistemaInformatico>
          <sf:FechaHoraHusoGenRegistro>${fechaHoraHuso}</sf:FechaHoraHusoGenRegistro>
          <sf:TipoHuella>01</sf:TipoHuella>
          <sf:Huella>${huella}</sf:Huella>
        </sf:RegistroAlta>
      </sfLR:RegistroFactura>
    </sfLR:RegFactuSistemaFacturacion>
  </soapenv:Body>
</soapenv:Envelope>`
}

export default {
  escapeXml,
  buildAltaFacturaXml,
}
