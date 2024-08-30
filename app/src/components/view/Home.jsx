import { useState, useEffect } from "react"
import { Link, Navigate } from "react-router-dom"

import logic from "../../logic/index"

import { FaUserEdit } from "react-icons/fa"
import { IoListOutline } from "react-icons/io5"
import { LiaFileInvoiceSolid } from "react-icons/lia"
import { GoNote } from "react-icons/go"
import { GiPapers } from "react-icons/gi"
import { AiOutlineUnorderedList } from "react-icons/ai"

import Header from "../Header"
import Button from "../core/Button"
import Main from "../core/Main"
import Footer from "../core/Footer"

import "./Home.css"

export default function Home() {
  const [userName, setUserName] = useState("")

  useEffect(() => {
    try {
      //prettier-ignore
      logic.getUserName()
        .then((userName) => {
          setUserName(userName)
        })
        .catch((error) => alert(error.message))
    } catch (error) {
      alert(error.message)
    }
  }, [])

  const { role, userId } = logic.getInfo()
  if (role === "customer") {
    return <Navigate to={`/customer/${userId}/info`} />
  }

  return (
    <>
      <Header iconUser={<FaUserEdit />}>{userName}</Header>

      <Main className="MainHome">
        <Link to="/customers">
          <Button>
            <span className="Icon">
              <IoListOutline />
            </span>
            Listado Clientes
          </Button>
        </Link>

        <Link to="invoices">
          <Button>
            <span className="Icon">
              <GiPapers />
            </span>
            Ultimas Facturas
          </Button>
        </Link>

        <Link to="delivery-notes">
          <Button>
            <span className="Icon">{<GoNote />}</span>
            Ultimos Albaranes
          </Button>
        </Link>

        <Link to="create/delivery-notes">
          <Button>
            <span className="Icon">
              <AiOutlineUnorderedList />
            </span>
            Crear Albarán
          </Button>
        </Link>

        <Link to="create/invoices">
          <Button>
            <span className="Icon">
              <LiaFileInvoiceSolid />
            </span>
            Crear Factura
          </Button>
        </Link>
      </Main>

      <Footer>FactuClient</Footer>
    </>
  )
}
