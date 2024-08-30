import "./index.css"

export default function Main({ className, children }) {
  return (
    <>
      <main className={`Main ${className ? className : ""}`}>{children}</main>
    </>
  )
}
