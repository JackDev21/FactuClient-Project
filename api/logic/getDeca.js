import validate from "com/validate.js"
import { NotFoundError, SystemError } from "com/errors.js"
import { Deca } from "../model/index.js"

const getDeca = async (userId, decaId) => {
  validate.id(userId, "userId")
  validate.id(decaId, "decaId")

  const deca = await Deca.findOne({ _id: decaId, company: userId })
    .populate({
      path: "deliveryNote",
      populate: { path: "works" },
    })
    .populate("customer")
    .populate("company")
    .select("-__v")
    .lean()
    .catch((err) => {
      throw new SystemError(err.message)
    })

  if (!deca) {
    throw new NotFoundError("DeCA no encontrado")
  }

  deca.id = deca._id.toString()
  delete deca._id

  const port = process.env.PORT || 7070
  const baseUrl = process.env.API_BASE_URL || `http://localhost:${port}`
  deca.publicDownloadUrl = `${baseUrl}/deca/public/${deca.publicToken}/download`

  return deca
}

export default getDeca
