export default function Heading({ level, className, children }) {
  const Tag = `h${level}`
  return (
    <>
      <Tag className={className}>{children}</Tag>
    </>
  )
}
