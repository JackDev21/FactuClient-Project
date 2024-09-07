import { useState } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { Context } from "./useContext"

import Login from "./components/view/Login"
import Register from "./components/view/Register"
import Home from "./components/view/Home"
import CustomerList from "./components/view/CustomerList"
import CustomerProfile from "./components/view/CustomerProfile"
import UsersProfile from "./components/view/UserProfile"
import InvoiceList from "./components/view/InvoiceList"
import DeliveryNoteList from "./components/view/DeliveryNotesList"
import DeliveryInfo from "./components/view/DeliveryInfo"
import NewDeliveryNotes from "./components/view/NewDeliveryNotes"
import CreateDeliveryNotes from "./components/view/CreateDeliveryNotes"
import InvoiceInfo from "./components/view/InvoiceInfo"
import NewInvoice from "./components/view/NewInvoice"
import Alert from "./components/Alert"
import CustomerInfo from "./components/view/CustomerInfo"
import RequestPassword from "./components/view/RequestPassword"

import logic from "./logic/index"

import "./global.css"
import ResetPassword from "./components/view/ResetPassword"

function App() {
  const [message, setMessage] = useState(null)

  const handleMessage = (message) => setMessage(message)
  const handleAlertAccepted = () => setMessage(null)

  return (
    <>
      <Context.Provider value={{ alert: handleMessage }}>
        <Routes>
          <Route path="/" element={<RenderHome />} />
          <Route path="/login" element={<RenderLogin />} />
          <Route path="/register" element={<RenderRegister />} />

          <Route path="/customers" element={<CustomerList />} />
          <Route path="/customers/profile/:customerId" element={<CustomerProfile />} />

          <Route path="/customer/:customerId/info" element={<CustomerInfo />} />

          <Route path="/users/profile" element={<UsersProfile />} />

          <Route path="/invoices" element={<InvoiceList />} />
          <Route path="/invoices/:invoiceId" element={<InvoiceInfo />} />
          <Route path="/create/invoices" element={<NewInvoice />} />

          <Route path="/create/delivery-notes" element={<NewDeliveryNotes />} />
          <Route path="/create/delivery-notes/:customerId" element={<CreateDeliveryNotes />} />

          <Route path="/delivery-notes" element={<DeliveryNoteList />} />
          <Route path="/delivery-notes/:deliveryNoteId" element={<DeliveryInfo />} />

          <Route path="/request-password-reset" element={<RequestPassword />} />
          <Route path="/reset-password/:userId/:token" element={<ResetPassword />} />
        </Routes>

        {message && <Alert message={message} onAccept={handleAlertAccepted} />}
      </Context.Provider>
    </>
  )
}

export default App

const RenderHome = () => (logic.isUserLoggedIn() ? <Home /> : <Navigate to="/login" />)
const RenderLogin = () => (logic.isUserLoggedIn() ? <Navigate to="/" /> : <Login />)
const RenderRegister = () => (logic.isUserLoggedIn() ? <Navigate to="/" /> : <Register />)
