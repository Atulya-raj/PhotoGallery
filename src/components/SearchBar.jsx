export function SearchBar({ value, onSearch, onClear }) {
  return (
    <div className="relative group mx-auto w-full max-w-md">
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-white/20 rounded-full blur-xl group-hover:bg-white/30 transition duration-500 opacity-50"></div>
      
      {/* Pill-shaped glassmorphic input */}
      <div className="relative flex items-center bg-black/40 backdrop-blur-2xl border border-white/20 rounded-full overflow-hidden shadow-2xl transition-all duration-300 focus-within:border-white/40 focus-within:bg-black/50 focus-within:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
        <div className="pl-6 text-white/60">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={value}
          onChange={onSearch}
          placeholder="Search authors..."
          className="w-full px-4 py-3.5 bg-transparent text-white placeholder-white/50 focus:outline-none focus:ring-0 text-[15px] font-medium tracking-wide"
        />
        {value && (
          <button
            onClick={onClear}
            className="pr-6 pl-2 text-white/50 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
