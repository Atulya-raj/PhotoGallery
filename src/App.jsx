import { useReducer } from "react";
import { Gallery } from "./components/Gallery";

function reducer(state, action) {
  switch (action.type) {
    case "TOGGLE_FAVOURITE": {
      const exists = state.favourites.includes(action.payload);
      const updated = exists
        ? state.favourites.filter((id) => id !== action.payload)
        : [...state.favourites, action.payload];
      localStorage.setItem("favs", JSON.stringify(updated));
      return { ...state, favourites: updated };
    }
    default:
      return state;
  }
}

function init() {
  const stored = localStorage.getItem("favs");
  return { favourites: stored ? JSON.parse(stored) : [] };
}

function App() {
  const [state, dispatch] = useReducer(reducer, undefined, init);

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#0a0a0a] text-white">
      {/* Cozy room background like the screenshot */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-30 mix-blend-luminosity scale-105"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2000&auto=format&fit=crop)' }}
      />
      
      {/* Dark gradient overlay for contrast and focus */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-black/90 via-black/50 to-amber-900/30 pointer-events-none" />

      <div className="relative z-10 min-h-screen flex flex-col animate-fade-in">
        {/* Top-left Photo gallery */}
        <div className="absolute top-6 left-6 md:top-8 md:left-10">
          <p 
            className="text-2xl md:text-3xl text-white/95 drop-shadow-md"
            style={{ fontFamily: "'Great Vibes', cursive" }}
          >
            Photo gallery
          </p>
        </div>

        <header className="pt-20 md:pt-24 pb-8 text-center">
          <h1 
            className="text-6xl md:text-7xl font-normal tracking-normal text-white/95 drop-shadow-lg"
            style={{ fontFamily: "'Great Vibes', cursive" }}
          >
            Lumora
          </h1>
        </header>
        
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <Gallery favourites={state.favourites} dispatch={dispatch} />
        </main>
      </div>
    </div>
  );
}

export default App;
