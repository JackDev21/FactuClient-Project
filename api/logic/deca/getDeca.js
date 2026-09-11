import validate from "com/validate.js"
import { NotFoundError, SystemError } from "com/errors.js"
import { Deca, User } from "../../model/index.js"
import getBaseUrl from "../../utils/getBaseUrl.js"

const getDeca = async (userId, decaId, customBaseUrl) => {
  validate.id(userId, "userId")
  validate.id(decaId, "decaId")

  const user = await User.findById(userId).lean().catch((err) => {
    throw new SystemError(err.message)
  })
  if (!user) throw new NotFoundError("Usuario no encontrado")

  const isDriver = user.role === "driver"
  const companyId = isDriver && user.manager ? user.manager.toString() : userId

  const deca = await Deca.findOne({ _id: decaId, company: companyId })
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

  const baseUrl = getBaseUrl(null, customBaseUrl)
  deca.publicDownloadUrl = `${baseUrl}/deca/public/${deca.publicToken}/download`

  return deca
}

export default getDeca
