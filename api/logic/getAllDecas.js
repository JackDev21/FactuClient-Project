import validate from "com/validate.js"
import { SystemError } from "com/errors.js"
import { Deca } from "../model/index.js"

const getAllDecas = async (userId) => {
  validate.id(userId, "userId")

  const decas = await Deca.find({ company: userId })
    .populate("deliveryNote", "number date isInvoiced")
    .populate("customer", "companyName fullName taxId email")
    .sort({ generatedAt: -1 })
    .select("-__v")
    .lean()
    .catch((err) => {
      throw new SystemError(err.message)
    })

  const port = process.env.PORT || 7070
  const baseUrl = process.env.API_BASE_URL || `http://localhost:${port}`

  return decas.map((deca) => {
    deca.id = deca._id.toString()
    delete deca._id
    deca.publicDownloadUrl = `${baseUrl}/deca/public/${deca.publicToken}/download`
    return deca
  })
}

export default getAllDecas
