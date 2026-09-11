import { matchPath } from "react-router-dom"

export const DEFAULT_TIPS = [
  "💡 Facturación, Albaranes y Control DeCA",
  "🛡️ Trazabilidad y transporte conforme a normativa",
  "📱 Accede a tus datos desde cualquier dispositivo"
]

export const ROUTE_TIPS_CONFIG = [
  // 1. Dashboard / Inicio
  {
    matches: (path) => path === "/",
    getTips: (role) =>
      role === "driver"
        ? [
            "🚚 Pulsa en 'Crear Albarán' al iniciar tu ruta",
            "📋 Revisa tus albaranes y entregas del año",
            "🛡️ Genera tu documento DeCA antes del viaje"
          ]
        : [
            "💡 Pulsa en 'Editar perfil' arriba para tu logo y CIF",
            "📋 Crea albaranes rápidos con el botón naranja",
            "📑 Consulta tus facturas y clientes desde las tarjetas",
            "🛡️ Gestiona documentos DeCA desde el menú central"
          ]
  },

  // 2. Albaranes
  {
    matches: (path) => path === "/delivery-notes",
    getTips: () => [
      "💡 Toca cualquier albarán para ver sus detalles y portes",
      "📅 Usa los filtros de meses arriba para buscar entregas",
      "🛡️ Abre un albarán para emitir su documento DeCA",
      "⏳ Filtra por 'Pendientes' para ver qué falta facturar"
    ]
  },
  {
    matches: (path) => matchPath("/delivery-notes/:id", path),
    getTips: () => [
      "🛡️ Pulsa 'Emitir DeCA Oficial' para el control en carretera",
      "✏️ Añade conceptos o bultos con el botón inferior",
      "📄 Si ya está facturado, verás el número de factura vinculado"
    ]
  },
  {
    matches: (path) => matchPath("/create/delivery-notes*", path),
    getTips: () => [
      "🔍 Selecciona el cliente para cargar sus datos fiscales",
      "📦 Añade los conceptos, cantidades y precios del servicio",
      "💾 Guarda para generar el número de albarán correlativo"
    ]
  },

  // 3. Facturas
  {
    matches: (path) => path === "/invoices",
    getTips: () => [
      "📄 Pulsa en una factura para ver su desglose y PDF",
      "📅 Filtra por mes arriba para ver el ejercicio por partes",
      "🔍 Busca rápidamente por número de factura o cliente",
      "➕ Crea una nueva factura agrupando albaranes pendientes"
    ]
  },
  {
    matches: (path) => matchPath("/invoices/:id", path),
    getTips: () => [
      "📥 Descarga o imprime la factura en PDF para tu cliente",
      "📊 Los importes de IVA e IRPF se calculan automáticamente",
      "💼 Los datos fiscales provienen de tu ficha de empresa"
    ]
  },
  {
    matches: (path) => matchPath("/create/invoices*", path),
    getTips: () => [
      "👤 Selecciona el cliente para ver sus albaranes pendientes",
      "☑️ Marca los albaranes que desees incluir en la factura",
      "📄 Al crear la factura, los albaranes quedarán vinculados"
    ]
  },

  // 4. DeCA
  {
    matches: (path) => path === "/deca",
    getTips: () => [
      "📲 Toca un DeCA para abrir su PDF con código QR oficial",
      "👮 Muestra el QR a la Guardia Civil en caso de inspección",
      "🏁 Marca 'Finalizar Porte' al terminar la descarga en destino",
      "📅 Los documentos se conservan durante 1 año por normativa"
    ]
  },
  {
    matches: (path) => matchPath("/deca/new/:id", path),
    getTips: () => [
      "📝 Revisa matrícula, origen y destino antes de emitir",
      "🚚 Los datos del cargador se autocompletan desde el albarán",
      "✅ Al confirmar obtendrás el PDF oficial con QR descargable"
    ]
  },
  {
    matches: (path) => matchPath("/deca/:id", path),
    getTips: () => [
      "📲 Muestra este código QR si te solicitan el documento",
      "🔗 Puedes compartir el enlace público por WhatsApp al chófer",
      "🏁 No olvides pulsar 'Finalizar Porte' al llegar al destino"
    ]
  },

  // 5. Clientes
  {
    matches: (path) => path === "/customers",
    getTips: () => [
      "👤 Toca un cliente para ver sus albaranes y facturas",
      "➕ Pulsa '+ Cliente' arriba a la izquierda para añadir uno",
      "📞 Tienes acceso directo a su teléfono y dirección fiscal"
    ]
  },
  {
    matches: (path) => matchPath("/customers/profile/:id", path) || matchPath("/customer/:id/info", path),
    getTips: () => [
      "📑 Cambia entre 'Facturas' y 'Albaranes' para ver su histórico",
      "📅 Filtra por año y mes para consultar ejercicios pasados",
      "✏️ Modifica su CIF o datos fiscales en cualquier momento"
    ]
  },

  // 6. Perfil de Empresa
  {
    matches: (path) => path === "/users/profile",
    getTips: () => [
      "🏢 Mantén tu CIF y dirección fiscal siempre actualizados",
      "💳 Introduce tu IBAN para que aparezca en tus facturas",
      "📊 Ajusta tu porcentaje de IRPF para cálculos automáticos",
      "🖼️ Sube el logo de tu empresa para facturas y DeCA"
    ]
  },

  // 7. Chóferes
  {
    matches: (path) => path === "/drivers",
    getTips: () => [
      "🚚 Registra a tus chóferes con su propio usuario y clave",
      "📋 Los chóferes pueden crear albaranes y DeCA en ruta",
      "🔒 Cada chófer accede únicamente a los datos de su servicio"
    ]
  },

  // 8. Auth
  {
    matches: (path) => path === "/login" || path === "/request-password-reset" || matchPath("/reset-password/*", path),
    getTips: () => [
      "🔒 Introduce tus credenciales para acceder a tu panel",
      "🔑 Si olvidaste tu clave, pulsa en '¿Has olvidado tu contraseña?'",
      "📱 FactuClient funciona en tu móvil, tablet o portátil"
    ]
  }
]

export function getTipsForRoute(pathname, userRole) {
  for (const config of ROUTE_TIPS_CONFIG) {
    if (config.matches(pathname)) {
      return config.getTips(userRole)
    }
  }
  return DEFAULT_TIPS
}
