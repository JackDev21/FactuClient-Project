import { FaUserTie } from "react-icons/fa"
import { RiLockPasswordLine } from "react-icons/ri"
import { MdOutlineEmail } from "react-icons/md"
import { MdOutlinePhoneAndroid } from "react-icons/md"
import { FaRegAddressCard } from "react-icons/fa"
import { HiOutlineIdentification } from "react-icons/hi"
import { MdWorkOutline } from "react-icons/md"
import { FaRegUser } from "react-icons/fa"
import { CiBank } from "react-icons/ci"
import { TiImage } from "react-icons/ti"
import { HiOutlineReceiptTax } from "react-icons/hi"

import "./index.css"

export default function Field({ className, id, type, placeholder, required = true }) {
  return (
    <>
      <div className={`Field ${className ? className : ""}`}>
        <div className="Container-icon">
          <span className="Icon">
            {id === "username" ? (
              <FaUserTie />
            ) : id === "password" || id === "confirmPassword" ? (
              <RiLockPasswordLine />
            ) : id === "email" ? (
              <MdOutlineEmail />
            ) : id === "phone" ? (
              <MdOutlinePhoneAndroid />
            ) : id === "address" ? (
              <FaRegAddressCard />
            ) : id === "taxId" ? (
              <HiOutlineIdentification />
            ) : id === "companyName" ? (
              <MdWorkOutline />
            ) : id === "fullName" ? (
              <FaRegUser />
            ) : id === "bankAccount" ? (
              <CiBank />
            ) : id === "companyLogo" ? (
              <TiImage />
            ) : id === "irpf" ? (
              <HiOutlineReceiptTax />
            ) : null}
          </span>
        </div>
        <input type={type} placeholder={placeholder} id={id} required={required}></input>
      </div>
    </>
  )
}
