import { useState } from "react"
import { MdVisibility, MdVisibilityOff } from "react-icons/md"
import Field from "../core/Field"

const PasswordField = ({ id, placeholder }) => {
  const [showPassword, setShowPassword] = useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="relative">
      <Field id={id} type={showPassword ? "text" : "password"} placeholder={placeholder} />
      <span className="absolute left-[15.5rem] top-[2.1rem] cursor-pointer text-3xl" onClick={togglePasswordVisibility}>
        {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
      </span>
    </div>
  )
}

export default PasswordField
