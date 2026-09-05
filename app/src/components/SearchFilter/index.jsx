const SearchFilter = ({ searchTerm, setSearchTerm, placeholder }) => {
  return (
    <div className="w-full">
      <input
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-base text-slate-800 placeholder-slate-400 shadow-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
      />
    </div>
  )
}

export default SearchFilter

