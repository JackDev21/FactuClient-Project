import "./index.css"

export default function ProfileInfoItem({ label, value }) {
  return (
    <div className="ProfileInfo">
      <p className="SpanText">{label}</p>
      {value && <p className="ProfileInfo">{value}</p>}
    </div>
  )
}
