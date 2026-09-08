/**
 * Resuelve la URL base pública de la API en cualquier entorno.
 * 
 * Prioridad de resolución:
 * 1. customBaseUrl: URL pasada explícitamente desde el controlador
 * 2. API_BASE_URL: Variable de entorno configurada en el panel de hosting (Render, Railway, etc.)
 * 3. RENDER_EXTERNAL_URL: Variable inyectada automáticamente por Render en todos sus servicios web
 * 4. Cabeceras del request HTTP entrante (x-forwarded-proto / x-forwarded-host)
 * 5. Fallback a http://localhost:${PORT || 7070} para desarrollo local
 */
export default function getBaseUrl(req, customBaseUrl) {
  if (customBaseUrl) return customBaseUrl.replace(/\/+$/, "")
  if (process.env.API_BASE_URL) return process.env.API_BASE_URL.replace(/\/+$/, "")
  if (process.env.RENDER_EXTERNAL_URL) return process.env.RENDER_EXTERNAL_URL.replace(/\/+$/, "")

  if (req) {
    const proto = req.headers?.["x-forwarded-proto"] || req.protocol || "https"
    const host = req.headers?.["x-forwarded-host"] || req.get?.("host")
    if (host && !host.includes("localhost")) {
      return `${proto}://${host}`
    }
  }

  const port = process.env.PORT || 7070
  return `http://localhost:${port}`
}
