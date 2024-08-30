import { useState } from "react"
import { useNavigate, useLocation, Link, matchPath } from "react-router-dom"
import { GiExitDoor } from "react-icons/gi"
import { TiArrowBack } from "react-icons/ti"

import "./index.css"

import logic from "../../logic"
import RegisterCustomer from "../RegisterCustomerForm"
import UpdateProfileForm from "../UpdateProfileForm"

export default function Header({
  className,
  iconUser,
  children,
  iconLeftHeader,
  onRegisterCustomer,
  onDeleteDeliveryNote,
  onDeleteCustomer,
  onDeleteInvoice,
  showBackButton = true
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const [showRegisterCustomer, setShowRegisterCustomer] = useState(false)
  const [showUpdateProfile, setShowUpdateProfile] = useState(false)

  const handleLogout = () => {
    logic.logoutUser()
    navigate("/login")
  }

  const handleRegisterCustomer = () => {
    setShowRegisterCustomer(!showRegisterCustomer)
  }

  const handleCloseRegisterCustomer = () => {
    setShowRegisterCustomer(false)
    onRegisterCustomer()
  }

  const handleUpdateProfile = () => {
    setShowUpdateProfile(!showUpdateProfile)
  }

  const handleCloseUpdateProfile = () => {
    setShowUpdateProfile(!showUpdateProfile)
  }

  const isCustomerProfilePathCustomerId = matchPath("/customers/profile/:customerId", location.pathname)
  const isCustomerProfilePathDeliveryNoteId = matchPath("/delivery-notes/:deliveryNoteId", location.pathname)
  const isCustomerProfilePathCreateDeliveryNoteId = matchPath("/create/delivery-notes/:customerId", location.pathname)
  const isCustomerProfilePathInvoiceId = matchPath("/invoices/:invoiceId", location.pathname)
  const isCustomerInfoPath = matchPath("/customer/:customerId/info", location.pathname)

  return (
    <>
      <div className={`Header ${className ? className : ""}`}>
        {location.pathname === "/customers" && (
          <div className="ContainerHeader">
            <div onClick={handleRegisterCustomer} className="IconLeftHeader">
              {iconLeftHeader}
            </div>
            <div className="IconUser">{iconUser}</div>
            <div className="Children">{children}</div>
          </div>
        )}

        {location.pathname === "/users/profile" && (
          <div className="ContainerHeader">
            <div onClick={handleUpdateProfile} className="IconLeftHeader">
              {iconLeftHeader}
            </div>
            <div className="IconUser">{iconUser}</div>
            <div className="Children">{children}</div>
          </div>
        )}

        {location.pathname === "/" && (
          <Link to="/users/profile">
            <div className="ContainerHeader">
              <div className="IconUser">{iconUser}</div>
              <div className="Children">{children}</div>
            </div>
          </Link>
        )}

        {location.pathname === "/invoices" && (
          <div className="ContainerHeader">
            <div className="IconUser">{iconUser}</div>
            <div className="Children">{children}</div>
          </div>
        )}

        {isCustomerProfilePathInvoiceId && (
          <div className="ContainerHeader">
            <div onClick={onDeleteInvoice} className="IconLeftHeader">
              {iconLeftHeader}
            </div>
            <div className="IconUser">{iconUser}</div>
            <div className="Children">{children}</div>
          </div>
        )}

        {location.pathname === "/delivery-notes" && (
          <div className="ContainerHeader">
            <div className="IconUser">{iconUser}</div>
            <div className="Children">{children}</div>
          </div>
        )}

        {location.pathname === "/create/delivery-notes" && (
          <div className="ContainerHeader">
            <div className="IconUser">{iconUser}</div>
            <div className="Children">{children}</div>
          </div>
        )}

        {location.pathname === "/create/invoices" && (
          <div className="ContainerHeader">
            <div className="IconUser">{iconUser}</div>
            <div className="Children">{children}</div>
          </div>
        )}

        {isCustomerProfilePathCustomerId && (
          <div className="ContainerHeader">
            <div onClick={onDeleteCustomer} className="IconLeftHeader">
              {iconLeftHeader}
            </div>
            <div className="IconUser">{iconUser}</div>
            <div className="Children">{children}</div>
          </div>
        )}

        {isCustomerProfilePathDeliveryNoteId && (
          <div className="ContainerHeader">
            <div onClick={onDeleteDeliveryNote} className="IconLeftHeader">
              {iconLeftHeader}
            </div>
            <div className="IconUser">{iconUser}</div>
            <div className="Children">{children}</div>
          </div>
        )}

        {isCustomerProfilePathCreateDeliveryNoteId && (
          <div className="ContainerHeader">
            <div className="IconUser">{iconUser}</div>
            <div className="Children">{children}</div>
          </div>
        )}

        {isCustomerInfoPath && (
          <div className="ContainerHeader">
            <div className="IconUser">{iconUser}</div>
            <div className="Children">{children}</div>
            <div onClick={handleLogout} className="IconLeftHeader">
              {iconLeftHeader}
            </div>
          </div>
        )}
      </div>

      <span className="IconExit">
        {location.pathname === "/" ? (
          <GiExitDoor onClick={handleLogout} />
        ) : (
          showBackButton && <TiArrowBack onClick={() => navigate(-1)} />
        )}
      </span>

      <div className="RegisterCustomer">
        {showRegisterCustomer && <RegisterCustomer onCloseRegisterCustomer={handleCloseRegisterCustomer} />}
      </div>

      <div className="UpdateProfile">
        {showUpdateProfile && (
          <UpdateProfileForm onUpdateProfile={handleCloseUpdateProfile} onCloseEditProfile={handleCloseUpdateProfile} />
        )}
      </div>
    </>
  )
}
