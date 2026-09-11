import validate from "com/validate.js"
import { SystemError, NotFoundError } from "com/errors.js"
import { Deca, User } from "../../model/index.js"
import getBaseUrl from "../../utils/getBaseUrl.js"

const getAllDecas = async (userId, customBaseUrl) => {
  validate.id(userId, "userId")

  const user = await User.findById(userId).lean().catch((err) => {
    throw new SystemError(err.message)
  })
  if (!user) throw new NotFoundError("Usuario no encontrado")

  const isDriver = user.role === "driver"
  const companyId = isDriver && user.manager ? user.manager.toString() : userId

  const decas = await Deca.find({ company: companyId })
    .populate("deliveryNote", "number date isInvoiced")
    .populate("customer", "companyName fullName taxId email")
    .sort({ generatedAt: -1 })
    .select("-__v")
    .lean()
    .catch((err) => {
      throw new SystemError(err.message)
    })

  const baseUrl = getBaseUrl(null, customBaseUrl)

  return decas.map((deca) => {
    deca.id = deca._id.toString()
    delete deca._id
    deca.publicDownloadUrl = `${baseUrl}/deca/public/${deca.publicToken}/download`
    return deca
  })
}

export default getAllDecas
