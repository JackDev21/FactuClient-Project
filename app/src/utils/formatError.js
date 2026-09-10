/**
 * Traduce y enriquece mensajes de error técnicos a explicaciones
 * claras, comprensibles y accionables en español para usuarios no técnicos.
 */
export function formatErrorMessage(rawMessage) {
  if (!rawMessage) return "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo."

  // Si se pasa un objeto Error, extraer su mensaje
  const msg = typeof rawMessage === "object" && rawMessage.message ? rawMessage.message : String(rawMessage)
  const trimmed = msg.trim()
  const lower = trimmed.toLowerCase()

  // 1. Errores de validación de campos (com/validate.js)
  if (lower.includes("username is not valid")) {
    return "El nombre de usuario no es válido. Solo puede contener letras, números, puntos o guiones bajos (sin espacios ni acentos)."
  }
  if (lower.includes("password is not valid")) {
    return "La contraseña no es válida. Debe tener al menos 4 caracteres (letras, números o símbolos)."
  }
  if (lower.includes("passwords don't match") || lower.includes("passwords dont match") || lower.includes("passwords do not match")) {
    return "Las contraseñas no coinciden. Asegúrate de escribir exactamente la misma contraseña en ambos campos."
  }
  if (lower.includes("fullname is not valid") || lower.includes("name is not valid")) {
    return "El nombre completo introducido no es válido. Por favor, revísalo y asegúrate de que esté bien escrito."
  }
  if (lower.includes("companyname is not valid") || lower.includes("company name is not valid")) {
    return "El nombre de la empresa o razón social no es válido. Por favor, revísalo."
  }
  if (lower.includes("email is not valid")) {
    return "El correo electrónico no tiene un formato válido (ejemplo: usuario@empresa.es)."
  }
  if (lower.includes("phone is not valid")) {
    return "El número de teléfono no es válido. Debe tener 9 dígitos y empezar por 6, 7, 8 o 9."
  }
  if (lower.includes("taxid is not valid") || lower.includes("nif/cif") || lower.includes("cif is not valid")) {
    return "El NIF o CIF no tiene un formato válido. Debe ser un DNI (8 números y letra) o CIF de empresa (letra y números)."
  }
  if (lower.includes("address is not valid")) {
    return "La dirección no es válida. Por favor, escribe una dirección postal correcta."
  }
  if (lower.includes("bankaccount is not valid") || lower.includes("iban is not valid")) {
    return "El número de cuenta bancaria o código IBAN no es válido. Por favor, revísalo."
  }
  if (lower.includes("concept is not valid")) {
    return "Debes indicar una descripción o concepto válido para el porte o trabajo realizado."
  }
  if (lower.includes("quantity is not valid")) {
    return "La cantidad introducida no es válida. Debe ser un número mayor que 0."
  }
  if (lower.includes("price is not valid")) {
    return "El precio introducido no es válido. Debe ser un número igual o superior a 0."
  }
  if (lower.includes("irpf is not valid")) {
    return "El porcentaje de IRPF no es válido. Debe ser un número entre 0 y 100."
  }
  if (lower.includes("date is not valid")) {
    return "La fecha seleccionada no es válida."
  }

  // 2. Errores de duplicidad y existencia en base de datos
  if (lower.includes("username or email already in use")) {
    return "El nombre de usuario o el correo electrónico ya están registrados por otra cuenta. Por favor, utiliza uno diferente."
  }
  if (lower.includes("username already in use")) {
    return "Este nombre de usuario ya está registrado. Por favor, elige un nombre de usuario diferente."
  }
  if (lower.includes("email already in use")) {
    return "Este correo electrónico ya pertenece a una cuenta registrada. Puedes iniciar sesión o solicitar recordar contraseña."
  }
  if (lower.includes("user not found")) {
    return "No se ha encontrado el usuario en el sistema."
  }
  if (lower.includes("customer not found")) {
    return "No se ha encontrado el cliente seleccionado."
  }
  if (lower.includes("delivery note not found") || lower.includes("delivery-note not found")) {
    return "No se ha encontrado el albarán solicitado."
  }
  if (lower.includes("invoice not found")) {
    return "No se ha encontrado la factura solicitada."
  }
  if (lower.includes("driver not found")) {
    return "No se ha encontrado el chofer seleccionado."
  }
  if (lower.includes("delivery note is already invoiced") || lower.includes("already invoiced")) {
    return "Este albarán ya ha sido facturado, por lo que no se puede editar ni eliminar."
  }
  if (lower.includes("driver does not belong to this company")) {
    return "Este chofer no pertenece a tu empresa."
  }
  if (lower.includes("only company owners can register drivers") || lower.includes("only company owners can update drivers")) {
    return "Solo el titular o autónomo de la empresa tiene permisos para gestionar chóferes."
  }

  // 3. Autenticación, tokens y sesiones
  if (lower.includes("invalid username or password")) {
    return "Usuario o contraseña incorrectos. Por favor, comprueba tus datos de acceso."
  }
  if (lower.includes("invalid token") || lower.includes("jwt expired") || lower.includes("jwt malformed") || lower.includes("tokenexpirederror")) {
    return "Tu sesión o el enlace de seguridad ha caducado. Por favor, inicia sesión de nuevo."
  }
  if (lower.includes("tiempo de reseteo de contraseña expirado")) {
    return "El enlace para restablecer la contraseña ha caducado. Por favor, solicita uno nuevo."
  }

  // 4. Conexión y red
  if (lower.includes("connection error") || lower.includes("failed to fetch") || lower.includes("networkerror")) {
    return "Error de comunicación con el servidor. Por favor, comprueba tu conexión a internet o inténtalo en unos instantes."
  }

  // 5. Documentos DeCA
  if (lower.includes("already exists a deca for this delivery note")) {
    return "Ya existe un documento DeCA emitido para este albarán."
  }
  if (lower.includes("deca not found")) {
    return "No se ha encontrado el documento DeCA solicitado."
  }
  if (lower.includes("deca is already completed")) {
    return "Este servicio de transporte DeCA ya ha sido finalizado."
  }
  if (lower.includes("deca missing required fields")) {
    return "Faltan datos obligatorios para emitir el DeCA según la normativa de transportes. Revisa matrículas y direcciones."
  }

  // Si ya es un mensaje en español entendible o personalizado, devolverlo tal cual
  return trimmed
}

export default formatErrorMessage
