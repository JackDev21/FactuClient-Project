import { useState, useEffect } from "react"
import { useNavigate, useLocation, Link, matchPath } from "react-router-dom"
import { GiExitDoor } from "react-icons/gi"
import { FaArrowLeft } from "react-icons/fa6"
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
              <span>Cliente</span>
            </span>
            <div className="IconUser">{iconUser}</div>
            <div className="Children">{children}</div>
          </div>
        )}

        {location.pathname === "/users/profile" && (
          <div className="ContainerHeader">
            <span onClick={handleUpdateProfile} className="IconLeftHeader" title="Editar Perfil">
              {iconLeftHeader}
              <span>Editar</span>
            </span>
            <div className="IconUser">{iconUser}</div>
            <div className="Children">{children}</div>
          </div>
        )}

        {location.pathname === "/" && (
          (logic.isUserLoggedIn() && logic.getInfo()?.role === "driver") ? (
            <div className="w-full flex justify-center select-none">
              <div className="ContainerHeader">
                <div className="IconUser">{iconUser}</div>
                <div className="Children">{children}</div>
              </div>
            </div>
          ) : (
            <Link to="/users/profile" className="w-full flex justify-center">
              <div className="ContainerHeader">
                <div className="IconUser">{iconUser}</div>
                <div className="Children">{children}</div>
              </div>
            </Link>
          )
        )}

        {location.pathname === "/invoices" && (
          <div className="ContainerHeader">
            <div className="IconUser">{iconUser}</div>
            <div className="Children">{children}</div>
          </div>
        )}

        {isCustomerProfilePathInvoiceId && (
          <div className="ContainerHeader">
            <span onClick={onDeleteInvoice} className="IconLeftHeader bg-rose-500/20 text-rose-950 border border-rose-600/30 hover:bg-rose-500/30" title="Eliminar Factura">
              {iconLeftHeader}
              <span>Borrar</span>
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
            <span onClick={onDeleteCustomer} className="IconLeftHeader bg-rose-500/20 text-rose-950 border border-rose-600/30 hover:bg-rose-500/30" title="Eliminar Cliente">
              {iconLeftHeader}
              <span>Borrar</span>
            </span>
            <div className="IconUser">{iconUser}</div>
            <div className="CustomerName Children">{children}</div>
          </div>
        )}

        {isCustomerProfilePathDeliveryNoteId && (
          <div className="ContainerHeader">
            <span onClick={onDeleteDeliveryNote} className="IconLeftHeader bg-rose-500/20 text-rose-950 border border-rose-600/30 hover:bg-rose-500/30" title="Eliminar Albarán">
              {iconLeftHeader}
              <span>Borrar</span>
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

        {location.pathname === "/drivers" && (
          <div className="ContainerHeader">
            {iconLeftHeader && (
              <span onClick={onRegisterCustomer} className="IconLeftHeader" title="Añadir Chofer">
                {iconLeftHeader}
                <span>Chofer</span>
              </span>
            )}
            <div className="IconUser">{iconUser}</div>
            <div className="Children">{children}</div>
          </div>
        )}

        {isCustomerInfoPath && (
          <div className="ContainerHeader">
            {iconLeftHeader && (
              <span onClick={handleLogout} className="IconLeftHeader" title="Cerrar sesión">
                {iconLeftHeader}
                <span>Salir</span>
              </span>
            )}
            <div className="IconUser">{iconUser}</div>
            <div className="Children">{children}</div>
          </div>
        )}

        {/* Fallback genérico para rutas personalizadas como /deca, etc. */}
        {![
          "/customers",
          "/users/profile",
          "/",
          "/invoices",
          "/delivery-notes",
          "/create/delivery-notes",
          "/create/invoices",
          "/drivers"
        ].includes(location.pathname) &&
          !isCustomerProfilePathInvoiceId &&
          !isCustomerProfilePathCustomerId &&
          !isCustomerProfilePathDeliveryNoteId &&
          !isCustomerProfilePathCreateDeliveryNoteId &&
          !isCustomerInfoPath && (
            <div className="ContainerHeader">
              {iconLeftHeader && (
                <span onClick={onRegisterCustomer || onDeleteDeliveryNote} className="IconLeftHeader" title={location.pathname === "/deca" ? "Volver a Inicio" : ""}>
                  {iconLeftHeader}
                  {location.pathname === "/deca" && <span>Inicio</span>}
                </span>
              )}
              {iconUser && <div className="IconUser">{iconUser}</div>}
              <div className="Children">{children}</div>
            </div>
          )}
      </div>

      <span
        className="IconExit"
        onClick={location.pathname === "/" ? handleLogout : () => navigate(-1)}
        title={location.pathname === "/" ? "Cerrar sesión" : "Volver atrás"}
      >
        {location.pathname === "/" ? (
          <>
            <GiExitDoor className="shrink-0" />
            <span>Salir</span>
          </>
        ) : (
          showBackButton && (
            <>
              <FaArrowLeft className="shrink-0" />
              <span>Atrás</span>
            </>
          )
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

