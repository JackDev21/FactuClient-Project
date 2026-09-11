import { useState, useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"
import logic from "../../../logic"
import { getTipsForRoute } from "./footerTips"
import Title from "../../Title"
import "./index.css"

export default function Footer({ children }) {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const location = useLocation()
  const userRole = logic.isUserLoggedIn() ? logic.getInfo()?.role : null

  // Obtener los tips correspondientes a la ruta y rol actual
  const tips = getTipsForRoute(location.pathname, userRole)
  const [tipIndex, setTipIndex] = useState(0)
  const [isFading, setIsFading] = useState(false)
  const timerRef = useRef(null)

  // Reiniciar índice al cambiar de ruta
  useEffect(() => {
    setTipIndex(0)
    setIsFading(false)
  }, [location.pathname])

  const handleNextTip = () => {
    if (tips.length <= 1) return
    setIsFading(true)
    setTimeout(() => {
      setTipIndex((prev) => (prev + 1) % tips.length)
      setIsFading(false)
    }, 180)
  }

  // Rotación automática cada 5.5 segundos
  useEffect(() => {
    if (tips.length <= 1) return

    timerRef.current = setInterval(() => {
      handleNextTip()
    }, 5500)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [tips, tipIndex])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY && currentScrollY > 40) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  const visibilityClass = isVisible
    ? "translate-y-0 opacity-100"
    : "translate-y-full opacity-0 pointer-events-none"

  // Si se pasa un children personalizado explícito (que no sea el genérico), respetarlo
  const hasCustomChildren =
    children &&
    children !== "FactuClient" &&
    children !== "FactuClient Driver" &&
    children !== "Facturación • Albaranes • DeCA"

  return (
    <>
      <div className={`ContainerFooter ${visibilityClass} transition-all duration-300 ease-in-out z-30`}>
        <footer
          className="Footer cursor-pointer select-none transition-transform active:scale-98"
          onClick={handleNextTip}
          title="Toca para ver el siguiente consejo"
        >
          {hasCustomChildren ? (
            <Title level={3} className={"FactuClient-Footer"}>
              {children}
            </Title>
          ) : (
            <div className="FooterGuideContent">
              <span
                className={`FooterGuideText transition-all duration-200 ${
                  isFading ? "opacity-0 -translate-y-1" : "opacity-100 translate-y-0"
                }`}
              >
                {tips[tipIndex]}
              </span>
              {tips.length > 1 && (
                <div className="FooterGuideDots">
                  {tips.map((_, i) => (
                    <span
                      key={i}
                      className={`FooterDot ${i === tipIndex ? "FooterDotActive" : ""}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </footer>
      </div>
    </>
  )
}

