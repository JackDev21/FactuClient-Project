import https from "https"
import fs from "fs"
import path from "path"

/**
 * URLs oficiales del Web Service SOAP de la AEAT para VERI*FACTU
 * (SistemaFacturacion.wsdl)
 */
export const AEAT_ENDPOINTS = {
  TEST: "https://prewww1.aeat.es/wlpl/TIKE-CONT/ws/SistemaFacturacion/VerifactuSOAP",
  PRODUCTION: "https://www1.agenciatributaria.gob.es/wlpl/TIKE-CONT/ws/SistemaFacturacion/VerifactuSOAP",
}

/**
 * Resuelve la ruta absoluta al archivo de certificado
 * @param {string} certPath 
 * @returns {string} Ruta absoluta
 */
export const resolveCertPath = (certPath) => {
  if (!certPath) return ""
  if (path.isAbsolute(certPath)) return certPath
  return path.resolve(process.cwd(), certPath)
}

/**
 * Crea un agente HTTPS configurado con autenticación mutua TLS (mTLS)
 * utilizando el certificado de cliente en formato PKCS#12 (.p12 / .pfx).
 *
 * @param {string} certPath - Ruta al archivo .p12 / .pfx
 * @param {string} [certPass=""] - Contraseña del certificado
 * @returns {https.Agent} Agente HTTPS
 */
export const createClientCertAgent = (certPath, certPass = "") => {
  const resolved = resolveCertPath(certPath)
  if (!resolved || !fs.existsSync(resolved)) {
    throw new Error(
      `Certificado digital no encontrado en: ${resolved || "no especificado"}. ` +
      `Por favor coloca tu archivo .p12 o .pfx en la carpeta api/certs/ y configura VERIFACTU_CERT_PATH en api/.env`
    )
  }

  const pfxBuffer = fs.readFileSync(resolved)
  return new https.Agent({
    pfx: pfxBuffer,
    passphrase: certPass,
    rejectUnauthorized: true,
  })
}

/**
 * Realiza la petición HTTP POST enviando el mensaje SOAP a la AEAT
 *
 * @param {string} endpointUrl - URL del servicio web de la AEAT
 * @param {string} xmlPayload - Mensaje SOAP en XML
 * @param {https.Agent} agent - Agente con certificado de cliente
 * @returns {Promise<{ statusCode: number, headers: Object, body: string }>}
 */
export const sendSoapRequest = (endpointUrl, xmlPayload, agent) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(endpointUrl)
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: "POST",
      agent,
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: '""',
        "Content-Length": Buffer.byteLength(xmlPayload, "utf8"),
      },
    }

    const req = https.request(options, (res) => {
      let responseBody = ""
      res.setEncoding("utf8")
      res.on("data", (chunk) => {
        responseBody += chunk
      })
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: responseBody,
        })
      })
    })

    req.on("error", (err) => {
      reject(err)
    })

    req.write(xmlPayload)
    req.end()
  })
}

/**
 * Parsea la respuesta XML devuelta por la AEAT (RespuestaRegFactuSistemaFacturacion)
 * extrayendo el CSV, estado y códigos de error si existen.
 *
 * @param {string} xmlResponse - Respuesta SOAP en XML
 * @returns {Object} Datos procesados de la respuesta
 */
export const parseAeatResponse = (xmlResponse = "") => {
  if (!xmlResponse || typeof xmlResponse !== "string") {
    return {
      success: false,
      status: "ERROR",
      message: "Respuesta vacía o inválida de la AEAT",
      rawXml: xmlResponse,
    }
  }

  // Comprobar error SOAP Fault
  const faultMatch = xmlResponse.match(/<faultstring[^>]*>([^<]+)<\/faultstring>/i)
  if (faultMatch) {
    return {
      success: false,
      status: "FAULT",
      message: faultMatch[1].trim(),
      rawXml: xmlResponse,
    }
  }

  // Extraer campos principales de la respuesta
  const csvMatch = xmlResponse.match(/<(?:[a-zA-Z0-9_-]+:)?CSV[^>]*>([^<]+)<\/(?:[a-zA-Z0-9_-]+:)?CSV>/i)
  const estadoEnvioMatch = xmlResponse.match(/<(?:[a-zA-Z0-9_-]+:)?EstadoEnvio[^>]*>([^<]+)<\/(?:[a-zA-Z0-9_-]+:)?EstadoEnvio>/i)
  const estadoRegistroMatch = xmlResponse.match(/<(?:[a-zA-Z0-9_-]+:)?EstadoRegistro[^>]*>([^<]+)<\/(?:[a-zA-Z0-9_-]+:)?EstadoRegistro>/i)
  const codErrorMatch = xmlResponse.match(/<(?:[a-zA-Z0-9_-]+:)?CodigoErrorRegistro[^>]*>([^<]+)<\/(?:[a-zA-Z0-9_-]+:)?CodigoErrorRegistro>/i)
  const descErrorMatch = xmlResponse.match(/<(?:[a-zA-Z0-9_-]+:)?DescripcionErrorRegistro[^>]*>([^<]+)<\/(?:[a-zA-Z0-9_-]+:)?DescripcionErrorRegistro>/i)
  const tiempoEsperaMatch = xmlResponse.match(/<(?:[a-zA-Z0-9_-]+:)?TiempoEsperaEnvio[^>]*>([^<]+)<\/(?:[a-zA-Z0-9_-]+:)?TiempoEsperaEnvio>/i)

  const csv = csvMatch ? csvMatch[1].trim() : ""
  const estadoEnvio = estadoEnvioMatch ? estadoEnvioMatch[1].trim() : ""
  const estadoRegistro = estadoRegistroMatch ? estadoRegistroMatch[1].trim() : ""
  const codigoError = codErrorMatch ? codErrorMatch[1].trim() : ""
  const descripcionError = descErrorMatch ? descErrorMatch[1].trim() : ""
  const tiempoEspera = tiempoEsperaMatch ? parseInt(tiempoEsperaMatch[1].trim()) : 60

  const isAccepted =
    estadoRegistro === "Correcta" ||
    estadoRegistro === "AceptadaConErrores" ||
    estadoRegistro === "AceptadoConErrores" ||
    (estadoEnvio === "Correcto" && !!csv) ||
    (estadoEnvio === "ParcialmenteCorrecto" && !!csv) ||
    !!csv

  return {
    success: isAccepted,
    csv,
    estadoEnvio,
    estadoRegistro,
    codigoError,
    descripcionError,
    tiempoEspera,
    rawXml: xmlResponse,
  }
}

/**
 * Envía un Registro de Facturación a la AEAT utilizando el certificado digital configurado
 *
 * @param {string} xmlPayload - Mensaje SOAP de alta
 * @param {Object} [config]
 * @param {string} [config.certPath] - Ruta al certificado .p12 / .pfx
 * @param {string} [config.certPass] - Contraseña del certificado
 * @param {boolean} [config.isProduction] - Si envía a producción o pruebas
 * @returns {Promise<Object>} Resultado procesado de la AEAT
 */
export const sendToAeat = async (xmlPayload, config = {}) => {
  const certPath = config.certPath || process.env.VERIFACTU_CERT_PATH || "certs/certificado.pfx"
  const certPass = config.certPass || process.env.VERIFACTU_CERT_PASS || ""
  const isProduction = typeof config.isProduction === "boolean"
    ? config.isProduction
    : process.env.AEAT_ENVIRONMENT === "production"

  const endpoint = isProduction ? AEAT_ENDPOINTS.PRODUCTION : AEAT_ENDPOINTS.TEST
  const agent = createClientCertAgent(certPath, certPass)

  const rawResponse = await sendSoapRequest(endpoint, xmlPayload, agent)
  const parsed = parseAeatResponse(rawResponse.body)

  return {
    ...parsed,
    statusCode: rawResponse.statusCode,
    endpoint,
  }
}

export default {
  AEAT_ENDPOINTS,
  resolveCertPath,
  createClientCertAgent,
  sendSoapRequest,
  parseAeatResponse,
  sendToAeat,
}
