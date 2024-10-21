import { useEffect, useState } from "react"

import Header from "../Header"
import Main from "../core/Main"
import Footer from "../core/Footer"
import ProfileInfoItem from "../ProfileItemInfo"

import { LiaUserEditSolid } from "react-icons/lia"

import logic from "../../logic"
import extractPayloadJwt from "../../../utils/extractPayloadJwt"

import "./UserProfile.css"

export default function UserProfile() {
  const [user, setUser] = useState(null)

  const { sub: userId } = extractPayloadJwt(sessionStorage.token)

  useEffect(() => {
    try {
      //prettier-ignore
      logic.getProfileUser(userId)
        .then((user) => {
          setUser(user)
        })
        .catch((error) => {
          alert(error.message)
        })
    } catch (error) {
      alert(error.message)
    }
  }, [userId])

  return (
    <>
      <Header className="HeaderProfile z-10" iconLeftHeader={<LiaUserEditSolid />}>
        {user?.companyLogo ? (
          <img className="CompanyLogo" src={user.companyLogo} alt="Company Logo" />
        ) : (
          user?.username && <h1>{user.username}</h1>
        )}
      </Header>

      <Main className="MainProfile">
        <div className="ProfileInfoContainer">
          <ProfileInfoItem label="Nombre de usuario" value={user?.username} />
          <ProfileInfoItem label="Nombre y Apellidos" value={user?.fullName} />
          <ProfileInfoItem label="Empresa" value={user?.companyName} />
          <ProfileInfoItem label="Dirección" value={user?.address} />
          <ProfileInfoItem label="CIF/NIF" value={user?.taxId} />
          <ProfileInfoItem label="Nº Móvil" value={user?.phone} />
          <ProfileInfoItem label="Email" value={user?.email} />
          <ProfileInfoItem label="IBAN" value={user?.bankAccount} />
          <ProfileInfoItem label="IRPF" value={`${user?.irpf} %` || 0} />
        </div>
      </Main>
      <Footer>FactuClient</Footer>
    </>
  )
}
