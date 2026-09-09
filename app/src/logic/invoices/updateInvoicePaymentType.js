export default function updateInvoicePaymentType(invoiceId, paymentType) {
  return fetch(`${import.meta.env.VITE_API_URL}/invoices/${invoiceId}/payment-type`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.token}`
    },
    body: JSON.stringify({ paymentType })
  })
    .then(res => {
      if (!res.ok) throw new Error("No se pudo actualizar la forma de pago")
      return res.json()
    })
}
