import { useState, useEffect } from "react"
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
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      // Si el usuario hace scroll hacia abajo más de 40px, ocultar la cabecera
      if (currentScrollY > lastScrollY && currentScrollY > 40) {
        setIsVisible(false)
      } else {
        // Si hace scroll hacia arriba, reaparecer inmediatamente
        setIsVisible(true)
      }
      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

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

  const visibilityClass = isVisible
    ? "translate-y-0 opacity-100"
    : "-translate-y-full opacity-0 pointer-events-none"

  return (
    <>
      <div className={`Header ${visibilityClass} transition-all duration-300 ease-in-out z-30 ${className ? className : ""}`}>
        {location.pathname === "/customers" && (
          <div className="ContainerHeader">
            <span onClick={handleRegisterCustomer} className="IconLeftHeader" title="Añadir Cliente">
              {iconLeftHeader}
            </span>
            <div className="IconUser">{iconUser}</div>
            <div className="Children">{children}</div>
          </div>
        )}

        {location.pathname === "/users/profile" && (
          <div className="ContainerHeader">
            <span onClick={handleUpdateProfile} className="IconLeftHeader" title="Editar Perfil">
              {iconLeftHeader}
            </span>
            <div className="IconUser">{iconUser}</div>
            <div className="Children">{children}</div>
          </div>
        )}

        {location.pathname === "/" && (
          <Link to="/users/profile" className="w-full flex justify-center">
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
            <span onClick={onDeleteInvoice} className="IconLeftHeader" title="Eliminar Factura">
              {iconLeftHeader}
            </span>
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
            <span onClick={onDeleteCustomer} className="IconLeftHeader" title="Eliminar Cliente">
              {iconLeftHeader}
            </span>
            <div className="IconUser">{iconUser}</div>
            <div className="CustomerName Children">{children}</div>
          </div>
        )}

        {isCustomerProfilePathDeliveryNoteId && (
          <div className="ContainerHeader">
            <span onClick={onDeleteDeliveryNote} className="IconLeftHeader" title="Eliminar Albarán">
              {iconLeftHeader}
            </span>
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
            <span onClick={handleLogout} className="IconLeftHeader" title="Cerrar Sesión">
              {iconLeftHeader}
            </span>
          </div>
        )}
      </div>

      <span className="IconExit" title={location.pathname === "/" ? "Cerrar sesión" : "Volver atrás"}>
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

