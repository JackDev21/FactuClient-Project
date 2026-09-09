import extractPayloadJwt from "../../../utils/extractPayloadJwt.js"

const getInfo = () => {

  const { sub: userId, role, manager } = extractPayloadJwt(sessionStorage.token)

  return { userId, role, manager }
}

export default getInfo