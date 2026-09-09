import errors, { SystemError } from "com/errors"
import validate from "com/validate"

const updateInvoiceDate = (invoiceId, invoiceDate) => {
  validate.id(invoiceId, "invoiceId")
  // convert YYYY-MM-DD string to DD/MM/YYYY for validation
  const dateObj = new Date(invoiceDate)
  const day = String(dateObj.getDate()).padStart(2, '0')
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const year = String(dateObj.getFullYear())
  const formattedDate = `${day}/${month}/${year}`
  validate.date(formattedDate, "invoiceDate")

  const body = { invoiceDate: formattedDate }

  return fetch(`${import.meta.env.VITE_API_URL}/invoices/${invoiceId}/date`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.token}`
    },
    body: JSON.stringify(body)
  })
    .catch(() => { throw new SystemError("connection error") })
    .then(response => {
      if (response.status === 200) {
        return response.json().catch(() => { throw new SystemError("connection error") })
      }
      return response.json()
        .catch(() => { throw new SystemError("connection error") })
        .then(body => {
          const { error, message } = body
          const Constructor = errors[error]
          throw new Constructor(message)
        })
    })
}

export default updateInvoiceDate
