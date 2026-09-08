import fs from "fs"
import path from "path"
import PDFDocument from "pdfkit"
import QRCode from "qrcode"

/**
 * Genera un PDF nativo conforme a los requisitos técnicos del DeCA
 * (Resolución de 5 de junio de 2026 y Orden FOM/2861/2012).
 *
 * Diseño dinámico con cálculo automático de alturas para evitar solapamientos.
 *
 * @param {Object} decaData - Datos completos del DeCA y relaciones
 * @param {string} outputPath - Ruta física donde guardar el PDF
 * @param {string} publicDownloadUrl - URL HTTPS pública de inspección en carretera
 * @returns {Promise<string>} Promesa que resuelve con outputPath
 */
export default async function generateDecaPdf(decaData, outputPath, publicDownloadUrl) {
  // Asegurar que el directorio de salida existe
  const dir = path.dirname(outputPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  // Generar buffer del código QR en alta calidad
  const qrBuffer = await QRCode.toBuffer(publicDownloadUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 160,
    color: {
      dark: "#0F172A",
      light: "#FFFFFF",
    },
  })

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4", // 595.28 x 841.89 pt
      margin: 35,
      info: {
        Title: `DeCA ${decaData.number}`,
        Author: decaData.shipper?.name || "FactuClient",
        Subject: "Documento Electrónico de Control Administrativo (DeCA)",
        CreationDate: decaData.generatedAt ? new Date(decaData.generatedAt) : new Date(),
      },
    })

    const writeStream = fs.createWriteStream(outputPath)
    doc.pipe(writeStream)

    const primaryColor = "#0F172A"
    const secondaryColor = "#475569"
    const accentColor = "#D97706"
    const borderColor = "#E2E8F0"
    const bgBoxColor = "#F8FAFC"
    const pageWidth = 525.28 // 595.28 - 70

    let curY = 32

    // ==========================================
    // 1. ENCABEZADO SUPERIOR Y BADGE
    // ==========================================
    // Título a la izquierda
    doc
      .fontSize(12.5)
      .fillColor(primaryColor)
      .font("Helvetica-Bold")
      .text("DOCUMENTO ELECTRÓNICO DE CONTROL ADMINISTRATIVO", 35, curY, {
        width: 440,
      })

    // Badge "DeCA" a la derecha
    doc
      .roundedRect(485, curY - 2, 75, 22, 3)
      .fillColor(primaryColor)
      .fill()

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#FFFFFF")
      .text("DeCA", 485, curY + 3, { width: 75, align: "center" })

    curY += 18

    // Subtítulo normativo oficial
    doc
      .fontSize(6.8)
      .fillColor(secondaryColor)
      .font("Helvetica")
      .text(
        "Control de transporte público de mercancías por carretera · ROTT Art. 222 · Orden FOM/2861/2012 · Resolución de 5 de junio de 2026",
        35,
        curY,
        { width: 440 }
      )

    curY += 14

    // Línea separadora elegante
    doc
      .moveTo(35, curY)
      .lineTo(560, curY)
      .lineWidth(1.2)
      .strokeColor(primaryColor)
      .stroke()

    curY += 8

    // ==========================================
    // 2. BLOQUE DE METADATOS TÉCNICOS
    // ==========================================
    const metaBoxHeight = 36
    doc
      .roundedRect(35, curY, pageWidth, metaBoxHeight, 3)
      .fillColor(bgBoxColor)
      .fillAndStroke(bgBoxColor, borderColor)

    // Nº DeCA
    doc.fontSize(6.5).font("Helvetica-Bold").fillColor(secondaryColor).text("DOCUMENTO Nº", 45, curY + 5)
    doc.fontSize(9.5).font("Helvetica-Bold").fillColor(accentColor).text(decaData.number || "", 45, curY + 16)

    // Albarán asociado
    const albNumber = decaData.deliveryNote?.number || decaData.deliveryNoteNumber || "N/A"
    doc.fontSize(6.5).font("Helvetica-Bold").fillColor(secondaryColor).text("ALBARÁN ASOCIADO", 170, curY + 5)
    doc.fontSize(9).font("Helvetica-Bold").fillColor(primaryColor).text(albNumber, 170, curY + 16)

    // Fecha / Hora emisión técnica previa al viaje
    const genDate = decaData.generatedAt ? new Date(decaData.generatedAt) : new Date()
    const formattedGen = `${genDate.toLocaleDateString("es-ES")} ${genDate.toLocaleTimeString("es-ES")}`
    doc.fontSize(6.5).font("Helvetica-Bold").fillColor(secondaryColor).text("EMISIÓN TÉCNICA (PREVIA AL VIAJE)", 290, curY + 5)
    doc.fontSize(8.5).font("Helvetica").fillColor(primaryColor).text(formattedGen, 290, curY + 16)

    // Estado del documento
    const statusText = decaData.status === "completed" ? "FINALIZADO" : "ACTIVO / EN VIGOR"
    doc.fontSize(6.5).font("Helvetica-Bold").fillColor(secondaryColor).text("ESTADO", 460, curY + 5)
    doc.fontSize(7.5).font("Helvetica-Bold").fillColor(decaData.status === "completed" ? secondaryColor : "#059669").text(statusText, 460, curY + 16)

    curY += metaBoxHeight + 8

    // ==========================================
    // 3. BLOQUE CARGADOR Y TRANSPORTISTA
    // ==========================================
    const colWidth = 257.5 // (525.28 - 10) / 2
    const shipperName = decaData.shipper?.name || "No especificado"
    const shipperAddress = decaData.shipper?.address || "No indicado"
    const carrierName = decaData.carrier?.name || "No especificado"
    const carrierAddress = decaData.carrier?.address || "Base operativa"

    // Calcular altura dinámica de las cajas de intervinientes
    doc.fontSize(8.5).font("Helvetica-Bold")
    const sNameH = doc.heightOfString(shipperName, { width: colWidth - 20 })
    const cNameH = doc.heightOfString(carrierName, { width: colWidth - 20 })

    doc.fontSize(7.5).font("Helvetica")
    const sAddrH = doc.heightOfString(`Domicilio: ${shipperAddress}`, { width: colWidth - 20 })
    const cAddrH = doc.heightOfString(`Domicilio/Base: ${carrierAddress}`, { width: colWidth - 20 })

    const partiesHeight = Math.max(76, Math.max(sNameH + sAddrH, cNameH + cAddrH) + 38)

    // Caja Cargador
    doc
      .roundedRect(35, curY, colWidth, partiesHeight, 3)
      .fillColor(bgBoxColor)
      .fillAndStroke(bgBoxColor, borderColor)

    doc.fontSize(7.5).font("Helvetica-Bold").fillColor(accentColor).text("1. CARGADOR CONTRACTUAL (EXPEDIDOR)", 45, curY + 6)
    doc.fontSize(8.5).font("Helvetica-Bold").fillColor(primaryColor).text(shipperName, 45, curY + 18, { width: colWidth - 20 })
    doc.fontSize(7.5).font("Helvetica").fillColor(secondaryColor).text(`NIF/CIF: ${decaData.shipper?.taxId || "N/A"}`, 45, curY + 20 + sNameH)
    doc.fontSize(7.5).font("Helvetica").fillColor(secondaryColor).text(`Domicilio: ${shipperAddress}`, 45, curY + 32 + sNameH, { width: colWidth - 20 })

    // Caja Transportista
    const col2X = 35 + colWidth + 10
    doc
      .roundedRect(col2X, curY, colWidth, partiesHeight, 3)
      .fillColor(bgBoxColor)
      .fillAndStroke(bgBoxColor, borderColor)

    doc.fontSize(7.5).font("Helvetica-Bold").fillColor(accentColor).text("2. TRANSPORTISTA EFECTIVO", col2X + 10, curY + 6)
    doc.fontSize(8.5).font("Helvetica-Bold").fillColor(primaryColor).text(carrierName, col2X + 10, curY + 18, { width: colWidth - 20 })
    doc.fontSize(7.5).font("Helvetica").fillColor(secondaryColor).text(`NIF/CIF: ${decaData.carrier?.taxId || "N/A"}`, col2X + 10, curY + 20 + cNameH)
    doc.fontSize(7.5).font("Helvetica").fillColor(secondaryColor).text(`Domicilio/Base: ${carrierAddress}`, col2X + 10, curY + 32 + cNameH, { width: colWidth - 20 })

    curY += partiesHeight + 8

    // ==========================================
    // 4. BLOQUE DATOS DE RUTA Y VEHÍCULO
    // ==========================================
    const originText = decaData.origin || "No especificado"
    const destText = decaData.destination || "No especificado"

    doc.fontSize(8).font("Helvetica")
    const origH = doc.heightOfString(originText, { width: colWidth - 20 })
    const destH = doc.heightOfString(destText, { width: colWidth - 20 })
    const routeHeight = Math.max(68, Math.max(origH, destH) + 48)

    doc
      .roundedRect(35, curY, pageWidth, routeHeight, 3)
      .fillColor(bgBoxColor)
      .fillAndStroke(bgBoxColor, borderColor)

    doc.fontSize(7.5).font("Helvetica-Bold").fillColor(accentColor).text("3. DATOS DE LA RUTA Y VEHÍCULO", 45, curY + 6)

    // Origen
    doc.fontSize(7).font("Helvetica-Bold").fillColor(secondaryColor).text("LUGAR DE ORIGEN (CARGA):", 45, curY + 18)
    doc.fontSize(8).font("Helvetica").fillColor(primaryColor).text(originText, 45, curY + 28, { width: colWidth - 20 })

    // Destino
    doc.fontSize(7).font("Helvetica-Bold").fillColor(secondaryColor).text("LUGAR DE DESTINO (DESCARGA):", col2X + 10, curY + 18)
    doc.fontSize(8).font("Helvetica").fillColor(primaryColor).text(destText, col2X + 10, curY + 28, { width: colWidth - 20 })

    // Matrícula y Conductor en la fila inferior de la caja
    const routeBottomY = curY + routeHeight - 18
    const plateText = decaData.vehiclePlate
      ? `${decaData.vehiclePlate}${decaData.trailerPlate ? ` / Remolque: ${decaData.trailerPlate}` : ""}`
      : "No indicada"

    doc.fontSize(7).font("Helvetica-Bold").fillColor(secondaryColor).text("MATRÍCULA(S):", 45, routeBottomY)
    doc.fontSize(7.5).font("Helvetica").fillColor(primaryColor).text(plateText, 115, routeBottomY)

    const driverText = decaData.driverName || "Conductor autorizado"
    doc.fontSize(7).font("Helvetica-Bold").fillColor(secondaryColor).text("CONDUCTOR:", col2X + 10, routeBottomY)
    doc.fontSize(7.5).font("Helvetica").fillColor(primaryColor).text(driverText, col2X + 75, routeBottomY)

    curY += routeHeight + 8

    // ==========================================
    // 5. BLOQUE MERCANCÍA TRANSPORTADA
    // ==========================================
    const cargoDesc = decaData.cargoDescription || "Mercancía general"
    doc.fontSize(8).font("Helvetica")
    const cargoDescH = doc.heightOfString(cargoDesc, { width: 340 })
    const cargoBoxH = Math.max(44, cargoDescH + 26)

    doc
      .roundedRect(35, curY, pageWidth, cargoBoxH, 3)
      .fillColor(bgBoxColor)
      .fillAndStroke(bgBoxColor, borderColor)

    doc.fontSize(7.5).font("Helvetica-Bold").fillColor(accentColor).text("4. NATURALEZA Y PESO DE LA MERCANCÍA TRANSPORTADA", 45, curY + 6)

    doc.fontSize(7).font("Helvetica-Bold").fillColor(secondaryColor).text("DESCRIPCIÓN DE LA CARGA:", 45, curY + 18)
    doc.fontSize(8).font("Helvetica").fillColor(primaryColor).text(cargoDesc, 45, curY + 28, { width: 340 })

    doc.fontSize(7).font("Helvetica-Bold").fillColor(secondaryColor).text("PESO DECLARADO / CANTIDAD:", 410, curY + 18)
    doc.fontSize(8.5).font("Helvetica-Bold").fillColor(primaryColor).text(decaData.cargoWeight || "A determinar en báscula", 410, curY + 28)

    curY += cargoBoxH + 8

    // ==========================================
    // 6. TABLA DE PARTIDAS / TRABAJOS DEL ALBARÁN
    // ==========================================
    const works = decaData.deliveryNote?.works || []
    if (works.length > 0) {
      // Cabecera de la tabla
      doc
        .roundedRect(35, curY, pageWidth, 16, 2)
        .fillColor(primaryColor)
        .fill()

      doc.fontSize(7).font("Helvetica-Bold").fillColor("#FFFFFF").text("CONCEPTO / DETALLE DE PARTIDAS", 45, curY + 4)
      doc.text("CANTIDAD", 420, curY + 4, { width: 55, align: "right" })
      doc.text("PRECIO REF.", 485, curY + 4, { width: 60, align: "right" })

      curY += 18

      // Filas dinámicas (máximo 4 para garantizar que cabe holgadamente en 1 página)
      works.slice(0, 4).forEach((work) => {
        const conceptText = work.concept || ""
        doc.fontSize(7.5).font("Helvetica")
        const textH = doc.heightOfString(conceptText, { width: 360 })
        const rowH = Math.max(14, textH + 4)

        doc.fillColor(primaryColor).text(conceptText, 45, curY + 1, { width: 360 })
        doc.text(String(work.quantity ?? "-"), 420, curY + 1, { width: 55, align: "right" })
        doc.text(work.price ? `${Number(work.price).toFixed(2)} €` : "-", 485, curY + 1, { width: 60, align: "right" })

        curY += rowH

        doc
          .moveTo(35, curY)
          .lineTo(560, curY)
          .lineWidth(0.5)
          .strokeColor("#F1F5F9")
          .stroke()

        curY += 2
      })

      curY += 4
    }

    // ==========================================
    // 7. OBSERVACIONES (SI APLICAN)
    // ==========================================
    if (decaData.observations && curY < 640) {
      doc.fontSize(6.8).font("Helvetica-Bold").fillColor(secondaryColor).text("OBSERVACIONES / RESERVAS:", 35, curY)
      doc.fontSize(7.2).font("Helvetica").fillColor(primaryColor).text(decaData.observations, 35, curY + 9, { width: pageWidth, lineGap: 1 })
      curY += doc.heightOfString(decaData.observations, { width: pageWidth }) + 14
    }

    // ==========================================
    // 8. BLOQUE INFERIOR DE CÓDIGO QR E INSPECCIÓN
    // ==========================================
    // Asegurar que el cuadro QR queda en la parte baja sin sobrepasar el folio A4
    const qrSectionY = Math.max(curY + 6, 685)
    const qrBoxHeight = 110

    doc
      .roundedRect(35, qrSectionY, pageWidth, qrBoxHeight, 4)
      .fillColor("#FFFFFF")
      .lineWidth(1)
      .strokeColor(primaryColor)

    // Imagen del QR centrado verticalmente en su caja
    doc.image(qrBuffer, 45, qrSectionY + 8, { width: 94, height: 94 })

    const textX = 152
    const textW = 396

    doc
      .fontSize(8.5)
      .font("Helvetica-Bold")
      .fillColor(primaryColor)
      .text("CÓDIGO QR PARA INSPECCIÓN EN CARRETERA (ACCESO DIRECTO)", textX, qrSectionY + 10)

    doc
      .fontSize(6.8)
      .font("Helvetica")
      .fillColor(secondaryColor)
      .text(
        "Conforme a la Resolución de 5 de junio de 2026 de la Dirección General de Transporte por Carretera y Ferrocarril, el escaneo de este código permite la descarga e inspección directa e inmediata del fichero electrónico original en formato PDF sin necesidad de credenciales, autenticación previa ni pantallas intermedias.",
        textX,
        qrSectionY + 24,
        { width: textW, lineGap: 1.5 }
      )

    doc
      .fontSize(7)
      .font("Helvetica-Bold")
      .fillColor(accentColor)
      .text("URL directa de verificación oficial:", textX, qrSectionY + 64)

    doc
      .fontSize(6.8)
      .font("Helvetica")
      .fillColor(primaryColor)
      .text(publicDownloadUrl, textX, qrSectionY + 75, { width: textW, link: publicDownloadUrl, underline: true })

    doc
      .fontSize(6.2)
      .font("Helvetica-Oblique")
      .fillColor(secondaryColor)
      .text(
        "Custodia legal activa: mínimo 1 año desde emisión · Validez de descarga pública: 7 días naturales tras la entrega.",
        textX,
        qrSectionY + 92,
        { width: textW }
      )

    // ==========================================
    // 9. PIE DE PÁGINA
    // ==========================================
    doc
      .fontSize(6.5)
      .font("Helvetica")
      .fillColor("#94A3B8")
      .text("FactuClient · Sistema de Gestión de Albaranes, Facturas y DeCA Digital", 35, 812, {
        align: "center",
        width: pageWidth,
      })

    doc.end()

    writeStream.on("finish", () => {
      resolve(outputPath)
    })

    writeStream.on("error", (err) => {
      reject(err)
    })
  })
}
