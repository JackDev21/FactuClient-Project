import { Page, Text, View, Document, StyleSheet, Image } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 20,
    justifyContent: "space-between"
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  },
  header: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
    color: "#333333"
  },
  invoiceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    paddingBottom: 5
  },
  totalContainer: {
    flexDirection: "column",
    alignItems: "flex-end",
    marginTop: 20,
    marginBottom: 20
  },
  total: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333333"
  },
  totalWithIva: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333333"
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  column: {
    flex: 1,
    paddingRight: 5
  },
  rightColumn: {
    flex: 1,
    paddingRight: 5,
    alignItems: "flex-end"
  },
  logo: {
    width: 100,
    height: 50,
    marginBottom: 10
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "#CCCCCC",
    marginVertical: 10
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    paddingBottom: 5,
    marginBottom: 5,
    backgroundColor: "#F5F5F5",
    padding: 5
  },
  tableColumnConcept: {
    width: "55%",
    textAlign: "left",
    fontSize: 13,
    fontWeight: "bold",
    color: "#333333",
    paddingLeft: 5
  },
  tableColumn: {
    width: "15%",
    textAlign: "right",
    fontSize: 11,
    marginLeft: 0,
    color: "#333333",
    paddingRight: 5
  },
  smallText: {
    fontSize: 10,
    color: "#666666"
  },
  textRight: {
    marginLeft: 5
  },
  companyText: {
    fontSize: 12,
    color: "#333333"
  },
  clientText: {
    fontSize: 12,
    color: "#333333",
    whiteSpace: "nowrap"
  },
  invoiceText: {
    fontSize: 12,
    color: "#333333"
  },
  clientDataText: {
    fontSize: 10,
    fontWeight: "extrabold",
    color: "#333333",
    whiteSpace: "nowrap"
  },
  paymentText: {
    fontSize: 10,
    color: "#333333"
  },
  footer: {
    textAlign: "center",
    fontSize: 10,
    marginTop: 20,
    color: "#666666"
  }
})

const formatDate = (dateString) => {
  const options = { day: "2-digit", month: "2-digit", year: "numeric" }
  return new Date(dateString).toLocaleDateString("es-ES", options)
}

const InvoicePDF = ({ invoice, total, iva, irpfAmount, irpfPercentage }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <View style={styles.row}>
            {invoice?.company?.companyLogo && <Image style={styles.logo} src={invoice.company.companyLogo} />}
            <View style={styles.rightColumn}>
              {invoice?.company && (
                <>
                  <Text style={styles.companyText}>{invoice.company.companyName}</Text>
                  <Text style={styles.companyText}>{invoice.company.address}</Text>
                  <Text style={styles.companyText}>{invoice.company.taxId}</Text>
                  <Text style={styles.companyText}>{invoice.company.email}</Text>
                  <Text style={styles.companyText}>{invoice.company.phone}</Text>
                </>
              )}
            </View>
          </View>
          <View style={styles.separator} />
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.clientDataText}>DATOS CLIENTE:</Text>
              {invoice?.customer && (
                <>
                  <Text style={styles.clientText}>{invoice.customer.companyName}</Text>
                  <Text style={styles.clientText}>{invoice.customer.address}</Text>
                  <Text style={styles.clientText}>{invoice.customer.taxId}</Text>
                  <Text style={styles.clientText}>{invoice.customer.email}</Text>
                  <Text style={styles.clientText}>{invoice.customer.phone}</Text>
                </>
              )}
            </View>
            <View style={styles.rightColumn}>
              <Text style={styles.invoiceText}>Fra.Nº: {invoice.number}</Text>
              <Text style={styles.invoiceText}>Fecha Factura: {formatDate(invoice.date)}</Text>
            </View>
          </View>
          <View style={styles.separator} />
          <View style={styles.tableHeader}>
            <Text style={styles.tableColumnConcept}>Concepto</Text>
            <Text style={styles.tableColumn}>Cantidad</Text>
            <Text style={styles.tableColumn}>Precio</Text>
            <Text style={styles.tableColumn}>Total</Text>
          </View>
          {invoice?.deliveryNotes.map((deliveryNote) => (
            <View key={deliveryNote.id}>
              <Text style={[styles.smallText, styles.textRight]}>
                A/Nº {deliveryNote.number} - {formatDate(deliveryNote.date)}
              </Text>
              {deliveryNote?.works.map((work) => (
                <View key={work.id} style={styles.invoiceItem}>
                  <Text style={styles.tableColumnConcept}>{work.concept}</Text>
                  <Text style={styles.tableColumn}>{work.quantity.toFixed(2)}</Text>
                  <Text style={styles.tableColumn}>{work.price.toFixed(2)}</Text>
                  <Text style={styles.tableColumn}>{(work.quantity * work.price).toFixed(2)}</Text>
                </View>
              ))}
            </View>
          ))}
          <View style={styles.totalContainer}>
            <Text style={styles.total}>TOTAL: {total.toFixed(2)} €</Text>
            <Text style={styles.total}>21% IVA: {iva.toFixed(2)} €</Text>
            {irpfAmount > 0 && (
              <Text style={styles.total}>
                {irpfPercentage}% IRPF: {irpfAmount.toFixed(2)} €
              </Text>
            )}
            <Text style={styles.totalWithIva}>TOTAL con IVA: {(total + iva - irpfAmount).toFixed(2)} €</Text>
          </View>
          <View>
            {invoice?.paymentType && <Text style={styles.paymentText}>Forma de pago: {invoice.paymentType}</Text>}
            {invoice?.company && <Text style={styles.paymentText}>{invoice.company.bankAccount}</Text>}
          </View>
        </View>
        <Text style={styles.footer}>FactuClient APP</Text>
      </Page>
    </Document>
  )
}

export default InvoicePDF
