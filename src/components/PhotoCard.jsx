import { useState } from "react";

export function PhotoCard({ photo, isFavourited, onToggle, index, onSelect }) {
  const [animateHeart, setAnimateHeart] = useState(false);

  const handleToggle = (id) => {
    setAnimateHeart(true);
    setTimeout(() => setAnimateHeart(false), 300); // Reset animation state after it completes
    onToggle(id);
  };

  return (
    <div 
      className="group relative rounded-3xl overflow-hidden bg-black/20 border border-white/10 shadow-lg cursor-pointer transition-all duration-500 hover:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.6)] hover:border-white/30 hover:-translate-y-2 animate-fade-in"
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
      onClick={() => onSelect && onSelect(photo)}
    >
      {/* Image container with aspect ratio and zoom effect */}
      <div className="relative overflow-hidden aspect-[4/3] bg-black/40">
        {/* Soft vignette/gradient overlay for better text readability and moody feel */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent z-10 opacity-70 group-hover:opacity-90 transition-opacity duration-500"></div>
        
        <img
          src={`https://picsum.photos/id/${photo.id}/400/300`}
          alt={photo.author}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-110"
        />
        
        {/* Animated Heart button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggle(photo.id);
          }}
          className={`absolute top-4 right-4 z-20 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 focus:outline-none ${
            isFavourited 
              ? 'bg-white/20 shadow-[0_0_20px_rgba(255,255,255,0.3)] border border-white/30' 
              : 'bg-black/30 hover:bg-white/20 border border-white/10 hover:border-white/30'
          }`}
          aria-label={isFavourited ? "Remove from favourites" : "Add to favourites"}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            strokeWidth={isFavourited ? 0 : 2}
            className={`w-5 h-5 transition-all duration-300 ${
              isFavourited ? 'fill-white stroke-none scale-110' : 'fill-transparent stroke-white/90 scale-100'
            } ${animateHeart ? 'animate-pop' : ''}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-5 z-20 transform transition-transform duration-500 translate-y-2 group-hover:translate-y-0">
          <p className="text-white/90 font-semibold text-[15px] drop-shadow-md truncate">
            {photo.author}
          </p>
        </div>
      </div>
    </div>
  );
}
