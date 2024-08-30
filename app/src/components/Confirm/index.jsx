import Button from "../core/Button"
import Title from "../Title"

import "./index.css"

export default function Confirm({
  setShowConfirmDelete,
  handleDeleteDeliveryNote,
  handleDeleteCustomer,
  handleDeleteInvoice
}) {
  const handleDelete = () => {
    if (handleDeleteDeliveryNote) {
      handleDeleteDeliveryNote()
    }
    if (handleDeleteCustomer) {
      handleDeleteCustomer()
    }
    if (handleDeleteInvoice) {
      handleDeleteInvoice()
    }
  }

  return (
    <>
      <div className="Confirm">
        <Title level={2}>¿Seguro que quieres eliminar?</Title>
        <div className="Confirm-Buttons">
          <Button className="ConfirmButton" onClick={handleDelete}>
            Aceptar
          </Button>
          <Button className="CancelButton" onClick={() => setShowConfirmDelete(!setShowConfirmDelete)}>
            Cancelar
          </Button>
        </div>
      </div>
    </>
  )
}
