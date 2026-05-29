import { useState, useCallback, useMemo, useEffect } from "react";
import { useFetchPhotos } from "../hooks/useFetchPhotos";
import { SearchBar } from "./SearchBar";
import { PhotoCard } from "./PhotoCard";

export function Gallery({ favourites, dispatch }) {
  const { photos, loading, error, refresh } = useFetchPhotos();
  const [query, setQuery] = useState("");
  const [showFavourites, setShowFavourites] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Cache photo objects to show favourites across refreshes
  const [photoCache, setPhotoCache] = useState(() => {
    const cached = localStorage.getItem("photo_cache");
    return cached ? JSON.parse(cached) : {};
  });

  useEffect(() => {
    if (photos && photos.length > 0) {
      setPhotoCache(prev => {
        const next = { ...prev };
        let changed = false;
        photos.forEach(p => {
          if (!next[p.id]) {
            next[p.id] = p;
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem("photo_cache", JSON.stringify(next));
        }
        return next;
      });
    }
  }, [photos]);

  useEffect(() => {
    if (selectedPhoto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedPhoto]);


  const handleSelectPhoto = useCallback((photo) => {
    setSelectedPhoto(photo);
    setImageLoaded(false);
  }, []);

  const handleSearch = useCallback((e) => {
    setQuery(e.target.value);
  }, []);

  const filteredPhotos = useMemo(() => {
    let result = photos;
    if (showFavourites) {
      // Reconstruct photo objects from cache using the IDs from the favourites array
      result = favourites.map(id => photoCache[id] || { id, author: "Unknown Photographer" });
    }
    
    if (query.trim() === "") return result;
    
    return result.filter((p) =>
      p.author.toLowerCase().includes(query.toLowerCase())
    );
  }, [photos, query, showFavourites, favourites, photoCache]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-t-2 border-white/80 border-r-2 border-transparent animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-b-2 border-white/30 border-l-2 border-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 rounded-[2rem] p-8 max-w-md text-center shadow-2xl">
          <div className="text-red-400 text-5xl mb-4">⚠️</div>
          <p className="text-white/90 font-medium text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center animate-slide-up">
      {/* Controls Container: Tabs and Search */}
      <div className="w-full max-w-2xl mb-10 sticky top-6 z-30 flex flex-col gap-4 items-center">
        {/* Toggle & Refresh */}
        <div className="flex gap-4 items-center justify-center w-full">
          <div className="flex bg-black/40 p-1 rounded-full backdrop-blur-xl border border-white/10 shadow-lg">
            <button
              className={`px-6 py-2 rounded-full transition-all text-sm font-medium ${!showFavourites ? 'bg-white/20 text-white shadow-sm' : 'text-white/60 hover:text-white'}`}
              onClick={() => setShowFavourites(false)}
            >
              All photos
            </button>
            <button
              className={`px-6 py-2 rounded-full transition-all text-sm font-medium ${showFavourites ? 'bg-white/20 text-white shadow-sm' : 'text-white/60 hover:text-white'}`}
              onClick={() => setShowFavourites(true)}
            >
              My Favourites
            </button>
          </div>
          <button
            onClick={refresh}
            className="bg-black/40 hover:bg-white/10 px-4 py-2 rounded-full backdrop-blur-xl border border-white/10 text-white transition-all flex items-center justify-center shadow-lg group"
            title="Refresh Photos"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/80 group-hover:text-white transition-all duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Floating Glassmorphic Search Bar */}
        <div className="w-full">
          <SearchBar value={query} onSearch={handleSearch} onClear={() => setQuery("")} />
        </div>
      </div>

      {/* Main Glassmorphic Gallery Container */}
      <div className="w-full bg-white/5 backdrop-blur-[24px] border border-white/10 rounded-[2.5rem] p-6 sm:p-8 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-20 text-white/50 text-lg flex flex-col items-center gap-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {query.trim() === "" 
              ? (showFavourites ? "You haven't liked any photos yet." : "No photos available.") 
              : `No photos found for "${query}"`}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {filteredPhotos.map((photo, index) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                isFavourited={favourites.includes(photo.id)}
                onToggle={(id) => dispatch({ type: "TOGGLE_FAVOURITE", payload: id })}
                index={index}
                onSelect={handleSelectPhoto}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 animate-fade-in">
          {/* Dynamic Resonating Background */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110 transition-opacity duration-1000"
            style={{ backgroundImage: `url(https://picsum.photos/id/${selectedPhoto.id}/400/300)`, filter: 'blur(80px) brightness(0.4)' }} 
          />
          {/* Overlay to add deep darkness */}
          <div className="absolute inset-0 bg-black/60"></div>
          {/* Film Grain/Noise Texture */}
          <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>
          
          <div className="absolute inset-0" onClick={() => setSelectedPhoto(null)}></div>
          
          <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.7)]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 px-6 border-b border-white/10 bg-black/20">
              <button onClick={() => setSelectedPhoto(null)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm transition-all flex items-center gap-2 backdrop-blur-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <h2 className="text-white font-semibold text-lg drop-shadow-md tracking-wide">{selectedPhoto.author}</h2>
              <button
                onClick={() => dispatch({ type: "TOGGLE_FAVOURITE", payload: selectedPhoto.id })}
                className={`p-2.5 rounded-full transition-all backdrop-blur-md ${favourites.includes(selectedPhoto.id) ? 'bg-white/20 shadow-[0_0_20px_rgba(255,255,255,0.3)] border border-white/30' : 'bg-white/5 hover:bg-white/20 border border-white/10'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth={favourites.includes(selectedPhoto.id) ? 0 : 2} className={`w-5 h-5 ${favourites.includes(selectedPhoto.id) ? 'fill-white stroke-none' : 'fill-transparent stroke-white/90'}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </button>
            </div>
            {/* Body */}
            <div className="flex-1 overflow-auto p-5 sm:p-8 flex flex-col">
              <div className="relative w-full rounded-2xl overflow-hidden bg-black/40 border border-white/5 shadow-2xl flex items-center justify-center min-h-[300px] sm:min-h-[500px]">
                {/* Loader */}
                {!imageLoaded && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/5 backdrop-blur-sm animate-pulse">
                     <div className="w-12 h-12 border-4 border-white/20 border-t-white/80 rounded-full animate-spin"></div>
                     <span className="text-white/50 text-sm font-medium tracking-widest uppercase">Loading High-Res</span>
                  </div>
                )}
                <img 
                  src={`https://picsum.photos/id/${selectedPhoto.id}/1200/800`} 
                  alt={selectedPhoto.author} 
                  onLoad={() => setImageLoaded(true)}
                  className={`w-full h-auto max-h-[65vh] object-cover transition-all duration-1000 ease-out ${imageLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-95 blur-md'}`} 
                />
              </div>
              <div className="mt-8 flex flex-col gap-2">
                <p className="text-white/80 text-base sm:text-lg leading-relaxed max-w-4xl font-light">
                  In the dynamic chronicle of life, there exists a picture that encapsulates a truly memorable chapter. A tale of adventure, light, and the great outdoors, this photograph by <span className="text-white font-medium">{selectedPhoto.author}</span> paints more than a thousand words.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
