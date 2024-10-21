import { ContentError, MatchError } from "./errors.js";

export const NAME_REGEX = /^[a-zA-Z=\[\]\{\}\<\>\(\) ]{1,}$/
export const USERNAME_REGEX = /^[\w-]+$/
export const PASSWORD_REGEX = /^[a-zA-Z0-9-_$%&=\[\]\{\}\<\>\(\)]{4,}$/
export const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
export const ID_REGEX = /^[0-9a-z-_]+$/i
export const NIF_CIF_REGEX = /^[0-9]{8}[A-Z]|^[A-HJ-NP-SUVW][0-9]{7}[0-9A-J]?$/
export const PHONE_REGEX = /^(6|7|8|9)\d{8}$/
export const COMPANY_NAME_REGEX = /^[a-zA-Z0-9 ,.&áéíóúÁÉÍÓÚñÑ]+$/
export const ADDRESS_REGEX = /^[\w\s,.áéíóúÁÉÍÓÚñÑ/ºª\-]+$/u
export const IBANREGEX = /^[A-Z]{2}\d{2}\s?\d{4}\s?\d{4}\s?\d{2}\s?\d{10}$/i
export const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/

function validateName(name, explain = "name") {
  if (typeof name !== "string" || !NAME_REGEX.test(name)) {
    throw new ContentError(`${explain} is not valid`)
  }
}

function validateUsername(username, explain = "username") {
  if (typeof username !== "string" || !USERNAME_REGEX.test(username)) {
    throw new ContentError(`${explain} is not valid`)
  }
}

function validatePassword(password) {
  if (typeof password !== "string" || !PASSWORD_REGEX.test(password)) {
    throw new ContentError("Password is not valid")
  }
}

function validatePasswordsMatch(password, passwordRepeat) {
  if (password !== passwordRepeat) {
    throw new MatchError('passwords don\'t match')
  }
}

function validateEmail(email) {
  if (typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    throw new ContentError('email is not valid')
  }
}

function validateText(text, explain = 'text', maxLength = Infinity) {
  if (typeof text !== 'string' || !text.length || text.length > maxLength) {
    throw new ContentError(`${explain} is not valid`)
  }
}

function validateUrl(url, explain = 'url') {
  if (typeof url !== 'string' || !url.startsWith('http')) {
    throw new ContentError(`${explain} is not valid`)
  }
}
function validateId(id, explain = 'id') {
  if (typeof id !== "string" || !ID_REGEX.test(id)) {
    throw new ContentError(`${explain} is not valid`)
  }
}
function validateTaxId(taxId, explain = "NIF/CIF") {
  if (typeof taxId !== "string" || !NIF_CIF_REGEX.test(taxId)) {
    throw new ContentError(`${explain} is not valid`)
  }
}

function validatePhoneNumber(phone, explain = "phone number") {
  if (typeof phone !== "string" || !PHONE_REGEX.test(phone)) {
    throw new ContentError(`${explain} is not valid`)
  }
}

function validateCompanyName(companyName, explain = "company name") {
  if (typeof companyName !== "string" || !COMPANY_NAME_REGEX.test(companyName)) {
    throw new ContentError(`${explain} is not valid`)
  }
}
function validateAddress(address, explain = "address") {
  if (typeof address !== "string" || !ADDRESS_REGEX.test(address)) {
    throw new ContentError(`${explain} is not valid`)
  }
}

function validateIban(iban, explain = "IBAN") {
  if (typeof iban !== "string" || !IBANREGEX.test(iban.replace(/\s+/g, ''))) {
    throw new ContentError(`${explain} is not valid`);
  }
}

function validateNumber(number, explain = "Number") {
  if (typeof number !== "number" || isNaN(number)) {
    throw new ContentError(`${explain} is not valid`);
  }
}
export function validateDate(date, explain = "date") {
  if (typeof date !== "string" || !dateRegex.test(date)) {
    throw new ContentError(`${explain} is not valid`);
  }

  const [day, month, year] = date.split('/').map(Number);
  const parsedDate = new Date(year, month - 1, day);
  if (parsedDate.getFullYear() !== year || parsedDate.getMonth() !== month - 1 || parsedDate.getDate() !== day) {
    throw new ContentError(`${explain} is not a valid date`);
  }
}

const validate = {
  name: validateName,
  username: validateUsername,
  password: validatePassword,
  passwordsMatch: validatePasswordsMatch,
  email: validateEmail,
  text: validateText,
  url: validateUrl,
  id: validateId,
  taxId: validateTaxId,
  phone: validatePhoneNumber,
  companyName: validateCompanyName,
  address: validateAddress,
  iban: validateIban,
  number: validateNumber,
  date: validateDate
}

export default validate