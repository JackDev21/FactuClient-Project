import { Page, Text, View, Document, StyleSheet, Image } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    padding: 10,
    backgroundColor: "aliceblue"
  },
  section: {
    margin: 5,
    padding: 5,
    flexGrow: 1
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15
  },
  header: {
    fontSize: 16,
    textAlign: "center"
  },
  date: {
    fontSize: 12,
    textAlign: "center"
  },
  borderedSection: {
    border: "1px solid black",
    padding: 10,
    marginBottom: 10,
    flex: 1,
    textAlign: "center"
  },
  companyInfo: {
    backgroundColor: "#e0f7fa"
  },
  customerInfo: {
    backgroundColor: "#f1f8e9"
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    fontSize: 12
  },
  workInfoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    fontWeight: "bold",
    fontSize: 14,
    backgroundColor: "#d5cabd",
    padding: 5
  },
  workInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    fontSize: 12
  },
  concept: {
    flex: 3,
    textAlign: "left"
  },
  quantity: {
    flex: 1,
    textAlign: "right"
  },
  price: {
    flex: 1,
    textAlign: "right"
  },
  totalAmount: {
    flex: 1,
    textAlign: "right"
  },
  total: {
    marginTop: 20,
    fontSize: 16,
    textAlign: "right"
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: 15
  },
  footer: {
    textAlign: "center",
    fontSize: 10,
    marginTop: 20
  },
  observations: {
    marginTop: 5,
    marginBottom: 10,
    padding: 5,
    fontSize: 10
  },
  observationsTitle: {
    fontWeight: "bold",
    marginBottom: 5 // Añadir margen inferior
  }
})

const DeliveryNotePDF = ({ deliveryNote, total }) => {
  const formattedDate = new Date(deliveryNote.date).toLocaleDateString()

  return (
    <Document>
      <Page size="A5" orientation="landscape" style={styles.page}>
        <View style={styles.section}>
          {deliveryNote.company && deliveryNote.company.companyLogo ? (
            <Image style={styles.logo} src={deliveryNote.company.companyLogo} />
          ) : (
            <Text style={styles.header}>{deliveryNote.company.companyName}</Text>
          )}
          <View style={styles.headerRow}>
            <Text style={styles.header}>Albarán nº: {deliveryNote.number}</Text>
            <Text style={styles.date}>Fecha: {formattedDate}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.borderedSection, styles.companyInfo]}>
              {deliveryNote.company.companyName}
              {"\n"}
              {deliveryNote.company.address}
              {"\n"}
              {deliveryNote.company.taxId}
              {"\n"}
              {deliveryNote.company.email}
            </Text>
            <View style={[styles.borderedSection, styles.customerInfo]}>
              <Text style={{ fontWeight: "bold", textDecoration: "underline", marginBottom: 5 }}>Cliente:</Text>
              <Text>
                {deliveryNote.customer.companyName}
                {"\n"}
                {deliveryNote.customer.address}
                {"\n"}
                {deliveryNote.customer.taxId}
                {"\n"}
                {deliveryNote.customer.email}
              </Text>
            </View>
          </View>

          <View style={styles.workInfoHeader}>
            <Text style={styles.concept}>Concepto</Text>
            <Text style={styles.quantity}>Cantidad</Text>
            <Text style={styles.price}>Precio</Text>
            <Text style={styles.totalAmount}>Total</Text>
          </View>
          {deliveryNote.works.map((work) => (
            <View key={work._id} style={styles.workInfo}>
              <Text style={styles.concept}>{work.concept}</Text>
              <Text style={styles.quantity}>{work.quantity.toFixed(2)}</Text>
              <Text style={styles.price}>{work.price.toFixed(2)}</Text>
              <Text style={styles.totalAmount}>{(work.quantity * work.price).toFixed(2)}</Text>
            </View>
          ))}

          <View style={styles.observations}>
            <Text style={styles.observationsTitle}>Observaciones:</Text>
            <Text>{deliveryNote.observations}</Text>
          </View>

          <Text style={styles.total}>TOTAL: {total.toFixed(2)} €</Text>
        </View>
        <Text style={styles.footer}>FactuClient APP</Text>
      </Page>
    </Document>
  )
}

export default DeliveryNotePDF
