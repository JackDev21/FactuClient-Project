import { useState } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { Context } from "./useContext"

import Login from "./pages/auth/Login"
// import Register from "./pages/auth/Register"
import Home from "./pages/dashboard/Home"
import CustomerList from "./pages/customers/CustomerList"
import CustomerProfile from "./pages/customers/CustomerProfile"
import UsersProfile from "./pages/profile/UserProfile"
import InvoiceList from "./pages/invoices/InvoiceList"
import DeliveryNoteList from "./pages/deliveryNotes/DeliveryNotesList"
import DeliveryInfo from "./pages/deliveryNotes/DeliveryInfo"
import NewDeliveryNotes from "./pages/deliveryNotes/NewDeliveryNotes"
import CreateDeliveryNotes from "./pages/deliveryNotes/CreateDeliveryNotes"
import InvoiceInfo from "./pages/invoices/InvoiceInfo"
import NewInvoice from "./pages/invoices/NewInvoice"
import Alert from "./components/Alert"
import CustomerInfo from "./pages/customers/CustomerInfo"
import RequestPassword from "./pages/auth/RequestPassword"
import ResetPassword from "./pages/auth/ResetPassword"
import DecaList from "./pages/deca/DecaList"
import DecaForm from "./pages/deca/DecaForm"
import DecaInfo from "./pages/deca/DecaInfo"
import logic from "./logic/index"
import "./global.css"

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
          {/* <Route path="/register" element={<RenderRegister />} /> */}

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

          <Route path="/deca" element={<DecaList />} />
          <Route path="/deca/new/:deliveryNoteId" element={<DecaForm />} />
          <Route path="/deca/:decaId" element={<DecaInfo />} />

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
// const RenderRegister = () => (logic.isUserLoggedIn() ? <Navigate to="/" /> : <Register />)
