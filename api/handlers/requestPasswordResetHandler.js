import logic from "../logic/index.js"

export default ((req, res, next) => {

  try {
    const { email } = req.body

    logic.requestPasswordReset(email)
      .then(() => res.status(200).send())
      .catch(error => next(error))
  } catch (error) {
    next(error)
  }

})