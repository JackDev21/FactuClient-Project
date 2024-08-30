import "./index.css"

export default function Button({ className, type, children, onClick }) {
  return (
    <>
      <button className={`Button ${className ? className : ""}`} type={type} onClick={onClick}>
        {children}
      </button>
    </>
  )
}
