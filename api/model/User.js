import { Schema, model } from "mongoose"
const { ObjectId } = Schema.Types

const user = new Schema({
  username: {
    type: String,
    unique: true
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
  fullName: {
    type: String,
  },
  companyName: {
    type: String,
  },
  address: {
    type: String,
  },
  taxId: {
    type: String,
  },
  phone: {
    type: String,
  },
  bankAccount: {
    type: String,
  },
  companyLogo: {
    type: String
  },
  role: {
    type: String,
  },
  manager: {
    type: ObjectId,
    ref: "User"
  },
  active: {
    type: Boolean,
    default: true
  },
  irpf: {
    type: Number,
  },

})

const User = model("User", user)

export default User