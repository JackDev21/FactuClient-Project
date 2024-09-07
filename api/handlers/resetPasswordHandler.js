import logic from "../logic/index.js";

export default (req, res, next) => {
  try {

    const { password, passwordRepeat } = req.body

    const { userId, token } = req.params

    logic.resetPassword(userId, password, passwordRepeat, token)
      .then(() => res.status(200).send())
      .catch(error => next(error))

  } catch (error) {
    next(error)
  }
}