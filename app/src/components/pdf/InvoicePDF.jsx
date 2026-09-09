import { Page, Text, View, Document, StyleSheet, Image } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    paddingTop: 25,
    paddingBottom: 35,
    paddingHorizontal: 25,
    backgroundColor: "#FFFFFF",
    fontSize: 9,
    color: "#334155",
    fontFamily: "Helvetica"
  },
  // Cabecera superior
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: "#0F172A",
    paddingBottom: 10
  },
  headerLeft: {
    flex: 1.2
  },
  headerRight: {
    flex: 0.8,
    alignItems: "flex-end"
  },
  logo: {
    width: 100,
    maxHeight: 45,
    objectFit: "contain",
    marginBottom: 6
  },
  companyMainTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F172A",
    textTransform: "uppercase"
  },
  invoiceBadge: {
    backgroundColor: "#0F172A",
    color: "#FFFFFF",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 3,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "right",
    marginBottom: 4
  },
  invoiceMetaText: {
    fontSize: 9,
    color: "#475569",
    marginTop: 2
  },
  // Bloque Emisor / Cliente
  partiesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12
  },
  partyBox: {
    flex: 1,
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC"
  },
  partyBoxTitle: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 2
  },
  partyName: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 2
  },
  partyDetail: {
    fontSize: 8.5,
    color: "#475569",
    marginTop: 1,
    lineHeight: 1.25
  },
  // Tabla
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0F172A",
    borderRadius: 3,
    paddingVertical: 5,
    paddingHorizontal: 8,
    fontWeight: "bold",
    fontSize: 8.5,
    color: "#FFFFFF"
  },
  deliveryNotePill: {
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    paddingVertical: 3,
    paddingHorizontal: 6,
    marginTop: 6,
    marginBottom: 2,
    alignSelf: "flex-start"
  },
  deliveryNotePillText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#1E293B"
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingVertical: 4,
    paddingHorizontal: 8,
    minHeight: 18,
    alignItems: "flex-start"
  },
  colConcept: {
    flex: 5.5,
    textAlign: "left",
    paddingRight: 6,
    lineHeight: 1.25,
    fontSize: 8.5
  },
  colQuantity: {
    flex: 1.5,
    textAlign: "right",
    paddingRight: 6,
    fontSize: 8.5
  },
  colPrice: {
    flex: 1.5,
    textAlign: "right",
    paddingRight: 6,
    fontSize: 8.5
  },
  colTotal: {
    flex: 1.5,
    textAlign: "right",
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#0F172A"
  },
  // Sección Inferior (Pago a la izquierda, Totales a la derecha)
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 12,
    gap: 12
  },
  paymentBox: {
    flex: 1.1,
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC"
  },
  paymentBoxTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#475569",
    textTransform: "uppercase",
    marginBottom: 3
  },
  paymentDetailText: {
    fontSize: 8.5,
    color: "#334155",
    lineHeight: 1.3
  },
  totalBox: {
    flex: 0.9,
    padding: 8,
    backgroundColor: "#F8FAFC",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#CBD5E1"
  },
  totalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
    fontSize: 8.5,
    color: "#475569"
  },
  totalFinalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1.5,
    borderTopColor: "#0F172A",
    fontSize: 11,
    fontWeight: "bold",
    color: "#0F172A"
  },
  // Pie de página
  footer: {
    position: "absolute",
    bottom: 15,
    left: 25,
    right: 25,
    textAlign: "center",
    fontSize: 7.5,
    color: "#94A3B8",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 4
  }
})

const formatDate = (dateString) => {
  if (!dateString) return ""
  const options = { day: "2-digit", month: "2-digit", year: "numeric" }
  return new Date(dateString).toLocaleDateString("es-ES", options)
}

const InvoicePDF = ({ invoice, total, iva, irpfAmount, irpfPercentage }) => {
  const safeTotal = typeof total === "number" ? total : 0
  const safeIva = typeof iva === "number" ? iva : 0
  const safeIrpfAmount = typeof irpfAmount === "number" ? irpfAmount : 0
  const totalWithIva = safeTotal + safeIva - safeIrpfAmount

  const emisorName =
    invoice?.company?.companyName ||
    invoice?.company?.fullName ||
    invoice?.company?.username ||
    invoice?.company?.email ||
    "EMPRESA"

  const clienteName =
    invoice?.customer?.companyName ||
    invoice?.customer?.fullName ||
    invoice?.customer?.username ||
    "CLIENTE"

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabecera Superior */}
        <View style={styles.headerRow} wrap={false}>
          <View style={styles.headerLeft}>
            {invoice?.company?.companyLogo ? (
              <Image style={styles.logo} src={invoice.company.companyLogo} />
            ) : null}
            <Text style={styles.companyMainTitle}>{emisorName}</Text>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.invoiceBadge}>FACTURA</Text>
            <Text style={styles.invoiceMetaText}>Nº: {invoice?.number || ""}</Text>
            <Text style={styles.invoiceMetaText}>Fecha: {formatDate(invoice?.date)}</Text>
          </View>
        </View>

        {/* Cajas de Datos: Emisor y Cliente */}
        <View style={styles.partiesRow} wrap={false}>
          <View style={styles.partyBox}>
            <Text style={styles.partyBoxTitle}>DATOS DEL EMISOR</Text>
            <Text style={styles.partyName}>{emisorName}</Text>
            {invoice?.company?.taxId ? <Text style={styles.partyDetail}>NIF/CIF: {invoice.company.taxId}</Text> : null}
            {invoice?.company?.address ? <Text style={styles.partyDetail}>{invoice.company.address}</Text> : null}
            {invoice?.company?.email ? <Text style={styles.partyDetail}>Email: {invoice.company.email}</Text> : null}
            {invoice?.company?.phone ? <Text style={styles.partyDetail}>Tel: {invoice.company.phone}</Text> : null}
          </View>

          <View style={styles.partyBox}>
            <Text style={styles.partyBoxTitle}>DATOS DEL CLIENTE</Text>
            <Text style={styles.partyName}>{clienteName}</Text>
            {invoice?.customer?.taxId ? <Text style={styles.partyDetail}>NIF/CIF: {invoice.customer.taxId}</Text> : null}
            {invoice?.customer?.address ? <Text style={styles.partyDetail}>{invoice.customer.address}</Text> : null}
            {invoice?.customer?.email ? <Text style={styles.partyDetail}>Email: {invoice.customer.email}</Text> : null}
            {invoice?.customer?.phone ? <Text style={styles.partyDetail}>Tel: {invoice.customer.phone}</Text> : null}
          </View>
        </View>

        {/* Tabla de Conceptos */}
        <View style={styles.tableHeader} wrap={false}>
          <Text style={styles.colConcept}>Concepto</Text>
          <Text style={styles.colQuantity}>Cantidad</Text>
          <Text style={styles.colPrice}>Precio</Text>
          <Text style={styles.colTotal}>Total</Text>
        </View>

        {Array.isArray(invoice?.deliveryNotes) &&
          invoice.deliveryNotes.map((deliveryNote) => (
            <View key={deliveryNote._id || deliveryNote.id || Math.random()}>
              {deliveryNote?.number ? (
                <View style={styles.deliveryNotePill} wrap={false}>
                  <Text style={styles.deliveryNotePillText}>
                    Albarán nº {deliveryNote.number} · {formatDate(deliveryNote.date)}
                  </Text>
                </View>
              ) : null}

              {Array.isArray(deliveryNote?.works) &&
                deliveryNote.works.map((work) => {
                  const quantity = typeof work.quantity === "number" ? work.quantity : 0
                  const price = typeof work.price === "number" ? work.price : 0
                  const workTotal = quantity * price

                  return (
                    <View key={work._id || work.id || Math.random()} style={styles.tableRow} wrap={false}>
                      <Text style={styles.colConcept}>{work.concept || ""}</Text>
                      <Text style={styles.colQuantity}>{quantity.toFixed(2)}</Text>
                      <Text style={styles.colPrice}>{price.toFixed(2)} €</Text>
                      <Text style={styles.colTotal}>{workTotal.toFixed(2)} €</Text>
                    </View>
                  )
                })}
            </View>
          ))}

        {/* Sección Inferior: Datos de Pago y Totales */}
        <View style={styles.bottomRow} wrap={false}>
          <View style={styles.paymentBox}>
            <Text style={styles.paymentBoxTitle}>Condiciones y Forma de Pago</Text>
            {invoice?.paymentType ? (
              <Text style={styles.paymentDetailText}>• Método: {invoice.paymentType}</Text>
            ) : null}
            {invoice?.company?.bankAccount ? (
              <Text style={styles.paymentDetailText}>• Cuenta (IBAN): {invoice.company.bankAccount}</Text>
            ) : null}
            {invoice?.observations ? (
              <Text style={[styles.paymentDetailText, { marginTop: 3 }]}>• Observaciones: {invoice.observations}</Text>
            ) : null}
          </View>

          <View style={styles.totalBox}>
            <View style={styles.totalLine}>
              <Text>Base Imponible:</Text>
              <Text>{safeTotal.toFixed(2)} €</Text>
            </View>
            <View style={styles.totalLine}>
              <Text>IVA (21%):</Text>
              <Text>{safeIva.toFixed(2)} €</Text>
            </View>
            {safeIrpfAmount > 0 ? (
              <View style={styles.totalLine}>
                <Text>IRPF ({irpfPercentage || 0}%):</Text>
                <Text>-{safeIrpfAmount.toFixed(2)} €</Text>
              </View>
            ) : null}
            <View style={styles.totalFinalLine}>
              <Text>TOTAL A PAGAR:</Text>
              <Text>{totalWithIva.toFixed(2)} €</Text>
            </View>
          </View>
        </View>

        {/* Pie de Página Dinámico con Paginación */}
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) => `FactuClient APP · Página ${pageNumber} de ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  )
}

export default InvoicePDF
