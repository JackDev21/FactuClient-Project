const SearchFilter = ({ searchTerm, setSearchTerm, placeholder }) => {
  return (
    <input
      className="-mb-9 -mt-5 w-[21rem] rounded-md border border-gray-500 p-2"
      type="text"
      placeholder={placeholder}
      value={searchTerm}
      onChange={(event) => setSearchTerm(event.target.value)}
    />
  )
}

export default SearchFilter
