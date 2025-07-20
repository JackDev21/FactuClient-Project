export default function updateInvoicePaymentType(invoiceId, paymentType) {
  return fetch(`/api/invoices/${invoiceId}/payment-type`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ paymentType })
  })
    .then(res => {
      if (!res.ok) throw new Error("No se pudo actualizar la forma de pago")
      return res.json()
    })
}
