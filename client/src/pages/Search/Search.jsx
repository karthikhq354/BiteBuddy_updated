import React, { useContext, useState, useEffect } from "react";
import "./Search.css";
import { StoreContext } from "../../context/StoreContext";
import { useSearchParams } from "react-router-dom";
import FoodItem from "../../components/FoodItem/FoodItem";
import axios from "axios";

const API = import.meta.env.VITE_SERVER_URL || "http://localhost:4000";

const POPULAR_CATEGORIES = ["Salad", "Rolls", "Pasta", "Cake", "Noodles", "Biryani", "Burgers"];

const Search = () => {
  const { food_list } = useContext(StoreContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [query,          setQuery]          = useState(searchParams.get("q") || "");
  const [listening,      setListening]      = useState(false);
  const [voiceError,     setVoiceError]     = useState("");
  const [voiceTranscript,setVoiceTranscript]= useState("");
  const [categories,     setCategories]     = useState(POPULAR_CATEGORIES);
  const [recentSearches, setRecentSearches] = useState(
    () => JSON.parse(localStorage.getItem("recentSearches") || "[]")
  );

  useEffect(() => {
    setSearchParams(query ? { q: query } : {});
  }, [query]);

  useEffect(() => {
    axios.get(`${API}/api/category/list`).then(({ data }) => {
      if (data.success) setCategories(data.data.map((c) => c.name).slice(0, 8));
    }).catch(() => {});
  }, []);

  const saveSearch = (q) => {
    if (!q.trim()) return;
    const updated = [q, ...recentSearches.filter((r) => r !== q)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const handleSearch = (e) => {
    if (e.key === "Enter") saveSearch(query);
  };

  const handleQuerySet = (q) => {
    setQuery(q);
    saveSearch(q);
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  // ── VOICE SEARCH ──────────────────────────────────────
  const startVoiceSearch = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setVoiceError("Voice search not supported. Try Chrome or Edge.");
      return;
    }
    const recognition = new SR();
    recognition.lang = "en-IN";
    recognition.interimResults = false;

    recognition.onstart  = () => { setListening(true); setVoiceError(""); setVoiceTranscript(""); };
    recognition.onend    = () => setListening(false);
    recognition.onerror  = () => { setListening(false); setVoiceError("Could not hear you. Try again."); };
    recognition.onresult = (event) => {
  const raw  = event.results[0][0].transcript;
  const text = raw.replace(/[.,!?;:]+$/g, "").trim();
  setVoiceTranscript(text);
  handleQuerySet(text);
};
    recognition.start();
  };

  const results = food_list.filter((item) => {
    const q = query.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="search-page">

      {/* ── HERO SEARCH BAR ───────────────────── */}
      <div className="search-hero">
        <h1>What are you craving? 🍽️</h1>
        <p>Search from our wide variety of delicious food items</p>

        <div className="search-bar-wrap">
          <div className={`search-bar ${listening ? "listening" : ""}`}>
            <span className="search-bar-icon">🔍</span>
            <input
              autoFocus
              type="text"
              placeholder={listening ? "Listening..." : "Search for food, categories..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
            {query && (
              <button className="search-clear" onClick={() => setQuery("")}>✕</button>
            )}
            <div className="search-divider" />
            <button
              className={`voice-btn ${listening ? "active" : ""}`}
              onClick={startVoiceSearch}
              title="Search by voice"
            >
              {listening ? (
                <span className="voice-waves">
                  <span /><span /><span /><span />
                </span>
              ) : (
                <span className="voice-mic">🎤</span>
              )}
              <span className="voice-label">{listening ? "Listening..." : "Voice"}</span>
            </button>
          </div>

          {/* Voice feedback */}
          {voiceTranscript && !listening && (
            <div className="voice-transcript">
              🎤 You said: <strong>"{voiceTranscript}"</strong>
            </div>
          )}
          {voiceError && (
            <div className="voice-error">⚠️ {voiceError}</div>
          )}
          {listening && (
            <div className="voice-listening-hint">
              <div className="voice-pulse" />
              Speak now — say a food name or category
            </div>
          )}
        </div>
      </div>

      {/* ── NO QUERY — SUGGESTIONS ────────────── */}
      {!query ? (
        <div className="search-suggestions">

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="search-section">
              <div className="search-section-header">
                <h3>🕐 Recent Searches</h3>
                <button onClick={clearRecent}>Clear all</button>
              </div>
              <div className="recent-list">
                {recentSearches.map((s) => (
                  <button key={s} className="recent-chip" onClick={() => handleQuerySet(s)}>
                    <span>🕐</span> {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Categories */}
          <div className="search-section">
            <div className="search-section-header">
              <h3>🔥 Popular Categories</h3>
            </div>
            <div className="popular-grid">
              {categories.map((c, i) => {
                const emojis = ["🥗","🌯","🍝","🎂","🍜","🍛","🍔","🥙"];
                return (
                  <button key={c} className="popular-card" onClick={() => handleQuerySet(c)}>
                    <span className="popular-emoji">{emojis[i % emojis.length]}</span>
                    <span>{c}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Voice Search CTA */}
          <div className="voice-cta">
            <div className="voice-cta-left">
              <h3>Try Voice Search</h3>
              <p>Say "Biryani" or "Pasta" and we'll find it instantly</p>
            </div>
            <button
              className={`voice-cta-btn ${listening ? "active" : ""}`}
              onClick={startVoiceSearch}
            >
              {listening ? "🎙️ Listening..." : "🎤 Speak Now"}
            </button>
          </div>

        </div>
      ) : (
        /* ── RESULTS ──────────────────────────── */
        <div className="search-results">
          <div className="search-results-header">
            <p className="search-count">
              {results.length > 0
                ? `${results.length} result${results.length > 1 ? "s" : ""} for `
                : `No results for `}
              <strong>"{query}"</strong>
            </p>
            <button className="search-clear-query" onClick={() => setQuery("")}>
              Clear search
            </button>
          </div>

          {results.length === 0 ? (
            <div className="search-empty">
              <span>😕</span>
              <h3>Nothing found</h3>
              <p>Try different keywords or use voice search</p>
              <button className="voice-empty-btn" onClick={startVoiceSearch}>
                🎤 Try Voice Search
              </button>
            </div>
          ) : (
            <div className="search-grid">
              {results.map((item) => (
                <FoodItem
                  key={item._id}
                  id={item._id}
                  name={item.name}
                  description={item.description}
                  price={item.price}
                  image={item.image}
                  category={item.category}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;