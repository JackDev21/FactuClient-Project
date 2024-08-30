import extractPayloadJwt from "../../utils/extractPayloadJwt.js"

const getInfo = () => {

  const { sub: userId, role } = extractPayloadJwt(sessionStorage.token)

  return { userId, role }
}

export default getInfo