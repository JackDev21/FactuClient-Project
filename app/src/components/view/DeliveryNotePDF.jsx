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
  docBadge: {
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
  docMetaText: {
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
    color: "#FFFFFF",
    marginBottom: 2
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
  // Sección Inferior (Observaciones a la izquierda, Total a la derecha)
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 12,
    gap: 12
  },
  observationsBox: {
    flex: 1.2,
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC"
  },
  observationsTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#475569",
    textTransform: "uppercase",
    marginBottom: 3
  },
  observationsText: {
    fontSize: 8.5,
    color: "#334155",
    lineHeight: 1.3
  },
  totalBox: {
    flex: 0.8,
    padding: 8,
    backgroundColor: "#F8FAFC",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0F172A"
  },
  totalValue: {
    fontSize: 12,
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

const DeliveryNotePDF = ({ deliveryNote, total }) => {
  const formattedDate = deliveryNote?.date
    ? new Date(deliveryNote.date).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      })
    : ""

  const safeTotal = typeof total === "number" ? total : 0

  const emisorName =
    deliveryNote?.company?.companyName ||
    deliveryNote?.company?.fullName ||
    deliveryNote?.company?.username ||
    deliveryNote?.company?.email ||
    "EMPRESA"

  const clienteName =
    deliveryNote?.customer?.companyName ||
    deliveryNote?.customer?.fullName ||
    deliveryNote?.customer?.username ||
    "CLIENTE"

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabecera Superior */}
        <View style={styles.headerRow} wrap={false}>
          <View style={styles.headerLeft}>
            {deliveryNote?.company?.companyLogo ? (
              <Image style={styles.logo} src={deliveryNote.company.companyLogo} />
            ) : null}
            <Text style={styles.companyMainTitle}>{emisorName}</Text>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.docBadge}>ALBARÁN</Text>
            <Text style={styles.docMetaText}>Nº: {deliveryNote?.number || ""}</Text>
            <Text style={styles.docMetaText}>Fecha: {formattedDate}</Text>
          </View>
        </View>

        {/* Cajas de Datos: Emisor y Cliente */}
        <View style={styles.partiesRow} wrap={false}>
          <View style={styles.partyBox}>
            <Text style={styles.partyBoxTitle}>DATOS DEL EMISOR</Text>
            <Text style={styles.partyName}>{emisorName}</Text>
            {deliveryNote?.company?.taxId ? <Text style={styles.partyDetail}>NIF/CIF: {deliveryNote.company.taxId}</Text> : null}
            {deliveryNote?.company?.address ? <Text style={styles.partyDetail}>{deliveryNote.company.address}</Text> : null}
            {deliveryNote?.company?.email ? <Text style={styles.partyDetail}>Email: {deliveryNote.company.email}</Text> : null}
            {deliveryNote?.company?.phone ? <Text style={styles.partyDetail}>Tel: {deliveryNote.company.phone}</Text> : null}
          </View>

          <View style={styles.partyBox}>
            <Text style={styles.partyBoxTitle}>DATOS DEL CLIENTE</Text>
            <Text style={styles.partyName}>{clienteName}</Text>
            {deliveryNote?.customer?.taxId ? <Text style={styles.partyDetail}>NIF/CIF: {deliveryNote.customer.taxId}</Text> : null}
            {deliveryNote?.customer?.address ? <Text style={styles.partyDetail}>{deliveryNote.customer.address}</Text> : null}
            {deliveryNote?.customer?.email ? <Text style={styles.partyDetail}>Email: {deliveryNote.customer.email}</Text> : null}
            {deliveryNote?.customer?.phone ? <Text style={styles.partyDetail}>Tel: {deliveryNote.customer.phone}</Text> : null}
          </View>
        </View>

        {/* Tabla de Trabajos / Conceptos */}
        <View style={styles.tableHeader} wrap={false}>
          <Text style={styles.colConcept}>Concepto</Text>
          <Text style={styles.colQuantity}>Cantidad</Text>
          <Text style={styles.colPrice}>Precio</Text>
          <Text style={styles.colTotal}>Total</Text>
        </View>

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

        {/* Sección Inferior: Observaciones y Total */}
        <View style={styles.bottomRow} wrap={false}>
          {deliveryNote?.observations ? (
            <View style={styles.observationsBox}>
              <Text style={styles.observationsTitle}>Observaciones</Text>
              <Text style={styles.observationsText}>{deliveryNote.observations}</Text>
            </View>
          ) : (
            <View style={{ flex: 1.2 }} />
          )}

          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>TOTAL ALBARÁN:</Text>
            <Text style={styles.totalValue}>{safeTotal.toFixed(2)} €</Text>
          </View>
        </View>

        {/* Pie de página Dinámico con Paginación */}
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) => `FactuClient APP · Página ${pageNumber} de ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  )
}

export default DeliveryNotePDF
