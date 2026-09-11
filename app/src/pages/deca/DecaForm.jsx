import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { FaTruck, FaFileShield, FaArrowLeft, FaTriangleExclamation, FaCheck, FaBuilding, FaLocationDot } from "react-icons/fa6"
import { FaSpinner } from "react-icons/fa"

import useContext from "../../useContext"
import Header from "../../components/Header"
import Main from "../../components/core/Main"
import logic from "../../logic/index"

export default function DecaForm() {
  const { alert: showAlert } = useContext()
  const { deliveryNoteId } = useParams()
  const navigate = useNavigate()

  const [deliveryNote, setDeliveryNote] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Selector de transportista: "own" (propia empresa) o "external" (empresa externa)
  const [carrierType, setCarrierType] = useState("own")

  // Formulario
  const [shipperName, setShipperName] = useState("")
  const [shipperTaxId, setShipperTaxId] = useState("")
  const [shipperAddress, setShipperAddress] = useState("")

  const [carrierName, setCarrierName] = useState("")
  const [carrierTaxId, setCarrierTaxId] = useState("")
  const [carrierAddress, setCarrierAddress] = useState("")

  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [cargoDescription, setCargoDescription] = useState("")
  const [cargoWeight, setCargoWeight] = useState("")

  const [vehiclePlate, setVehiclePlate] = useState("")
  const [trailerPlate, setTrailerPlate] = useState("")
  const [driverName, setDriverName] = useState("")
  const [transportDate, setTransportDate] = useState(new Date().toISOString().split("T")[0])
  const [loadingTime, setLoadingTime] = useState("")
  const [unloadingTime, setUnloadingTime] = useState("")
  const [observations, setObservations] = useState("")

  useEffect(() => {
    let currentUserId
    try {
      const info = logic.getInfo()
      currentUserId = info?.userId
    } catch {
      // Ignorar error al leer info si no hay sesión
    }

    Promise.all([
      logic.getDeliveryNote(deliveryNoteId),
      currentUserId ? logic.getProfileUser(currentUserId).catch(() => null) : Promise.resolve(null),
    ])
      .then(([dn, prof]) => {
        setDeliveryNote(dn)
        const companyInfo = prof || dn?.company
        setProfile(companyInfo)

        // Pre-rellenar Cargador
        const sName = companyInfo?.companyName || companyInfo?.fullName || ""
        const sTaxId = companyInfo?.taxId || ""
        const sAddress = companyInfo?.address || ""
        setShipperName(sName)
        setShipperTaxId(sTaxId)
        setShipperAddress(sAddress)

        // Pre-rellenar Transportista por defecto (propia empresa)
        setCarrierName(sName)
        setCarrierTaxId(sTaxId)
        setCarrierAddress(sAddress)

        // Pre-rellenar Origen y Destino
        setOrigin(sAddress)
        setDestination(dn?.customer?.address || "")

        // Pre-rellenar Naturaleza de la Mercancía desde conceptos del albarán
        if (dn?.works && dn.works.length > 0) {
          const concepts = dn.works.map((w) => w.concept).filter(Boolean).join("; ")
          setCargoDescription(concepts.slice(0, 150))
        } else {
          setCargoDescription("Mercancía general paletizada")
        }

        setCargoWeight("1000 kg")
        setLoading(false)
      })
      .catch((err) => {
        setLoading(false)
        showAlert(err.message)
      })
  }, [deliveryNoteId])

  // Cambio de tipo de transportista
  const handleCarrierTypeChange = (type) => {
    setCarrierType(type)
    if (type === "own" && profile) {
      setCarrierName(profile.companyName || profile.fullName || "")
      setCarrierTaxId(profile.taxId || "")
      setCarrierAddress(profile.address || "")
    } else if (type === "external") {
      setCarrierName("")
      setCarrierTaxId("")
      setCarrierAddress("")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return

    if (!origin.trim() || !destination.trim()) {
      showAlert("El origen y el destino del transporte son obligatorios por ley.")
      return
    }

    if (!carrierName.trim() || !carrierTaxId.trim()) {
      showAlert("Los datos del transportista efectivo (Nombre y NIF) son obligatorios.")
      return
    }

    if (!cargoDescription.trim() || !cargoWeight.trim()) {
      showAlert("La naturaleza y el peso/cantidad de la carga son obligatorios.")
      return
    }

    setSubmitting(true)

    const payload = {
      shipper: {
        name: shipperName.trim(),
        taxId: shipperTaxId.trim(),
        address: shipperAddress.trim(),
      },
      carrier: {
        name: carrierName.trim(),
        taxId: carrierTaxId.trim(),
        address: carrierAddress.trim(),
      },
      origin: origin.trim(),
      destination: destination.trim(),
      cargoDescription: cargoDescription.trim(),
      cargoWeight: cargoWeight.trim(),
      vehiclePlate: vehiclePlate.trim(),
      trailerPlate: trailerPlate.trim(),
      driverName: driverName.trim(),
      transportDate,
      loadingTime: loadingTime.trim(),
      unloadingTime: unloadingTime.trim(),
      observations: observations.trim(),
    }

    try {
      const deca = await logic.createDeca(deliveryNoteId, payload)
      setSubmitting(false)
      navigate(`/deca/${deca.id}`)
    } catch (err) {
      setSubmitting(false)
      showAlert(err.message)
    }
  }

  if (loading) {
    return (
      <>
        <Header>
          <span className="text-sm font-bold text-white drop-shadow-sm">Emisión de DeCA</span>
        </Header>
        <Main>
          <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-3">
            <FaSpinner className="animate-spin text-3xl text-amber-500" />
            <span className="text-xs font-semibold">Cargando datos del albarán...</span>
          </div>
        </Main>
      </>
    )
  }

  return (
    <>
      <Header
        iconUser={<FaFileShield />}
      >
        Albarán Nº {deliveryNote?.number}
      </Header>

      <Main>
        <div className="w-full max-w-2xl flex flex-col gap-4 px-2 sm:px-4 py-2 pb-16 text-left">
          {/* Banner normativo */}
          <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-4 shadow-xs flex items-start gap-3">
            <FaTriangleExclamation className="text-amber-600 text-lg shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1 text-xs text-amber-950">
              <span className="font-extrabold">Documento Electrónico de Control Administrativo (DeCA)</span>
              <p className="leading-relaxed text-amber-900">
                Conforme a la <strong>Resolución de 5 de junio de 2026</strong> y <strong>Orden FOM/2861/2012</strong>, este documento digital debe generarse de forma obligatoria antes del inicio de la ruta para transportes públicos de mercancías. Se generará un PDF nativo con código QR para descarga directa sin contraseñas por los agentes de tráfico.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* 1. CARGADOR CONTRACTUAL */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <FaBuilding className="text-amber-600" /> 1. Cargador Contractual (Expedidor)
                </span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Auto-rellenado
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Razón Social / Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={shipperName}
                    onChange={(e) => setShipperName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    NIF / CIF *
                  </label>
                  <input
                    type="text"
                    required
                    value={shipperTaxId}
                    onChange={(e) => setShipperTaxId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Domicilio Fiscal / Operativo *
                  </label>
                  <input
                    type="text"
                    required
                    value={shipperAddress}
                    onChange={(e) => setShipperAddress(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* 2. TRANSPORTISTA EFECTIVO */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <FaTruck className="text-amber-600" /> 2. Transportista Efectivo
                </span>

                {/* Selector rápido: Mi empresa vs Externo */}
                <div className="flex rounded-xl bg-slate-100 p-0.5 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => handleCarrierTypeChange("own")}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      carrierType === "own"
                        ? "bg-white text-amber-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Mi Empresa
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCarrierTypeChange("external")}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      carrierType === "external"
                        ? "bg-white text-amber-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Transportista Externo
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Nombre o Razón Social del Transportista *
                  </label>
                  <input
                    type="text"
                    required
                    value={carrierName}
                    onChange={(e) => setCarrierName(e.target.value)}
                    placeholder="Ej. Transportes Rápidos SA"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    NIF / CIF del Transportista *
                  </label>
                  <input
                    type="text"
                    required
                    value={carrierTaxId}
                    onChange={(e) => setCarrierTaxId(e.target.value)}
                    placeholder="Ej. B12345678"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Domicilio / Base Operativa (Opcional)
                  </label>
                  <input
                    type="text"
                    value={carrierAddress}
                    onChange={(e) => setCarrierAddress(e.target.value)}
                    placeholder="Dirección o ciudad del transportista"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* 3. DATOS DE LA RUTA Y TRANSPORTE */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col gap-3">
              <div className="border-b border-slate-100 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <FaLocationDot className="text-amber-600" /> 3. Ruta y Operación
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Lugar de Origen (Carga) *
                  </label>
                  <input
                    type="text"
                    required
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="Dirección o localidad de carga"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Lugar de Destino (Descarga) *
                  </label>
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Dirección o localidad de entrega"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Fecha del Transporte *
                  </label>
                  <input
                    type="date"
                    required
                    value={transportDate}
                    onChange={(e) => setTransportDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Nombre del Conductor (Opcional)
                  </label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="Ej. Manuel Fernández"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Matrícula Vehículo / Tractor
                  </label>
                  <input
                    type="text"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                    placeholder="Ej. 1234-XYZ"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Matrícula Semirremolque (Opcional)
                  </label>
                  <input
                    type="text"
                    value={trailerPlate}
                    onChange={(e) => setTrailerPlate(e.target.value.toUpperCase())}
                    placeholder="Ej. R-5678-ABC"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center justify-between">
                    <span>Hora Llegada / Carga</span>
                    <span className="text-[10px] font-bold text-amber-600">Opcional (Ley 15/2009)</span>
                  </label>
                  <input
                    type="time"
                    value={loadingTime}
                    onChange={(e) => setLoadingTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center justify-between">
                    <span>Hora Salida / Descarga</span>
                    <span className="text-[10px] font-bold text-amber-600">Opcional (Ley 15/2009)</span>
                  </label>
                  <input
                    type="time"
                    value={unloadingTime}
                    onChange={(e) => setUnloadingTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* 4. MERCANCÍA */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col gap-3">
              <div className="border-b border-slate-100 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  4. Mercancía Transportada (Art. 6 FOM/2861)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Naturaleza / Descripción de la Carga *
                  </label>
                  <input
                    type="text"
                    required
                    value={cargoDescription}
                    onChange={(e) => setCargoDescription(e.target.value)}
                    placeholder="Ej. Material de construcción, repuestos, paquetería"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Peso Declarado o Cantidad *
                  </label>
                  <input
                    type="text"
                    required
                    value={cargoWeight}
                    onChange={(e) => setCargoWeight(e.target.value)}
                    placeholder="Ej. 1.200 kg o 2 pallets"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Observaciones y Reservas (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Instrucciones especiales de entrega, muelles, horarios..."
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>
            </div>

            {/* BOTÓN SUBMIT */}
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 py-3.5 px-6 text-sm font-bold text-white shadow-md active:scale-95 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin text-base" />
                  <span>Generando DeCA oficial y estampando código QR...</span>
                </>
              ) : (
                <>
                  <FaCheck className="text-base" />
                  <span>Emitir DeCA Oficial (con QR y enlace para carretera)</span>
                </>
              )}
            </button>
          </form>
        </div>
      </Main>
    </>
  )
}
