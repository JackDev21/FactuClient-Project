import { useRef, useState, useLayoutEffect } from "react"

/**
 * AutoFitText: Ajusta dinámicamente el tamaño de la fuente según el ancho disponible
 * del contenedor. Si el texto cabe normalmente se mantiene en maxFontSize (por defecto 12px),
 * y si es muy largo reduce automáticamente su tamaño hasta minFontSize (por defecto 9px)
 * para evitar saltos de línea y desbordamientos.
 */
export default function AutoFitText({
  children,
  text,
  minFontSize = 9,
  maxFontSize = 12,
  className = "",
  as: Component = "span",
  ...props
}) {
  const content = text ?? children
  const containerRef = useRef(null)
  const [fontSize, setFontSize] = useState(maxFontSize)

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el || !content) return

    const adjustFontSize = () => {
      // 1. Probar primero con el tamaño máximo para medir el desbordamiento real
      el.style.fontSize = `${maxFontSize}px`
      const clientWidth = el.clientWidth
      const scrollWidth = el.scrollWidth

      if (clientWidth > 0 && scrollWidth > clientWidth) {
        // 2. Reducir proporcionalmente con un margen de seguridad
        const ratio = clientWidth / scrollWidth
        const calculated = Math.floor(maxFontSize * ratio * 0.97 * 10) / 10
        const finalSize = Math.max(minFontSize, calculated)
        el.style.fontSize = `${finalSize}px`
        setFontSize(finalSize)
      } else {
        setFontSize(maxFontSize)
      }
    }

    adjustFontSize()

    let observer = null
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => {
        adjustFontSize()
      })
      observer.observe(el)
    }

    return () => {
      if (observer) observer.disconnect()
    }
  }, [content, minFontSize, maxFontSize])

  if (!content) return null

  return (
    <Component
      ref={containerRef}
      style={{ fontSize: `${fontSize}px` }}
      className={`block w-full overflow-hidden text-ellipsis whitespace-nowrap ${className}`}
      title={typeof content === "string" ? content : undefined}
      {...props}
    >
      {content}
    </Component>
  )
}
