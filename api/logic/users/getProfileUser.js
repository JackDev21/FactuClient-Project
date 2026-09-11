import validate from "com/validate.js"
import { User } from "../../model/index.js"
import { NotFoundError, SystemError, MatchError } from "com/errors.js"

function getProfileUser(userId, targetUserId) {
  validate.id(userId, "userId")
  validate.id(targetUserId, "targetUserId")

  return User.findById(userId).lean()
    .catch(error => { throw new SystemError(error.message) })
    .then(user => {
      if (!user) {
        throw new NotFoundError("User not found")
      }

      return User.findById(targetUserId).select("-__v -password").lean()
        .catch(error => { throw new SystemError(error.message) })
        .then(targetUser => {
          if (!targetUser) {
            throw new NotFoundError("TargetUser not found")
          }

          const isSelf = userId === targetUserId
          const isManager = targetUser.manager && targetUser.manager.toString() === userId
          const isDriverOfCompany = user.role === "driver" && user.manager && user.manager.toString() === targetUserId

          if (!isSelf && !isManager && !isDriverOfCompany) {
            throw new MatchError("No permission to view this profile")
          }

          targetUser.id = targetUser._id.toString()
          delete targetUser._id

          if (targetUser.manager) {
            targetUser.manager = targetUser.manager.toString()
          }
          return targetUser
        })
    })
}

export default getProfileUser