export default function sendInvoiceVerifactu(invoiceId) {
  return fetch(`${import.meta.env.VITE_API_URL}/invoices/${invoiceId}/verifactu/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.token}`
    }
  })
    .then(async res => {
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.message || data.error || "Error al remitir la factura a la AEAT")
      }
      return data
    })
}
