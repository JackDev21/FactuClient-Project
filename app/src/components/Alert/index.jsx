import Button from "../core/Button"

import "./index.css"

function Alert({ message, onAccept }) {
  return (
    <>
      <div className="ContainerAlert">
        <div className={`AlertBox`}>
          <p>{message}</p>
          <Button className="AlertButton" onClick={onAccept}>
            Aceptar
          </Button>
        </div>
      </div>
    </>
  )
}

export default Alert
