import { useContext } from "react";
import { StoreContext } from "../../context/StoreContext";
import "./SearchBar.css";

// ── SEARCHBAR COMPONENT ────────────────────────────────────
// Reads/writes `searchQuery` from StoreContext.
// Place this anywhere in the layout (e.g. below ExploreMenu in Home.jsx).
// FoodDisplay.jsx reads the same `searchQuery` to filter the food grid.

const SearchBar = () => {
  const { searchQuery, setSearchQuery } = useContext(StoreContext);

  return (
    <div className="search-bar-container">
      <div className="search-bar">
        {/* Search icon (inline SVG — no extra asset needed) */}
        <svg
          className="search-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          type="text"
          placeholder="Search for food, categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Clear button — only shows when there is a query */}
        {searchQuery && (
          <button className="search-clear" onClick={() => setSearchQuery("")}>
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;