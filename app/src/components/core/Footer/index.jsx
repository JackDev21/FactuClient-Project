import { useState, useEffect } from "react"
import Title from "../../Title"
import "./index.css"

export default function Footer({ children }) {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

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

  return (
    <>
      <div className={`ContainerFooter ${visibilityClass} transition-all duration-300 ease-in-out z-30`}>
        <footer className="Footer">
          <Title level={3} className={"FactuClient-Footer"}>
            {children}
          </Title>
        </footer>
      </div>
    </>
  )
}

