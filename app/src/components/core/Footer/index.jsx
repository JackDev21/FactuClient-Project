import Title from "../../Title"
import "./index.css"

export default function Footer({ children }) {
  return (
    <>
      <div className="ContainerFooter">
        <footer className="Footer">
          <Title level={3} className={"FactuClient-Footer"}>
            {children}
          </Title>
        </footer>
      </div>
    </>
  )
}
