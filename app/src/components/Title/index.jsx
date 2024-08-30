import "./index.css"

import Heading from "../core/Heading"

export default function Title({ children, className, level }) {
  return (
    <>
      <Heading level={level} className={`Title ${className ? className : ""}`}>
        {children}
      </Heading>
    </>
  )
}
