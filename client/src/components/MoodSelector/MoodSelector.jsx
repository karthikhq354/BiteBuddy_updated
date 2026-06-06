import React, { useState } from "react";
import axios from "axios";
import FoodItem from "../FoodItem/FoodItem";
import "./MoodSelector.css";

const API = import.meta.env.VITE_SERVER_URL || "http://localhost:4000";

const MOODS = [
  { key: "happy",     label: "Happy",     emoji: "😄", color: "#f59e0b", bg: "#fffbeb", desc: "Celebratory & sweet" },
  { key: "tired",     label: "Tired",     emoji: "😴", color: "#6366f1", bg: "#eef2ff", desc: "Comforting & filling" },
  { key: "stressed",  label: "Stressed",  emoji: "😰", color: "#ec4899", bg: "#fdf2f8", desc: "Relaxing & familiar" },
  { key: "sick",      label: "Sick",      emoji: "🤒", color: "#14b8a6", bg: "#f0fdfa", desc: "Light & soothing" },
  { key: "energetic", label: "Energetic", emoji: "⚡", color: "#22c55e", bg: "#f0fdf4", desc: "Fresh & healthy" },
];

const MoodSelector = () => {
  const [selected, setSelected] = useState(null);
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(false);

  const handleMood = async (mood) => {
    if (selected === mood.key) {
      setSelected(null);
      setResults([]);
      return;
    }
    setSelected(mood.key);
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/features/mood/${mood.key}`);
      if (data.success) setResults(data.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const activeMood = MOODS.find((m) => m.key === selected);

  return (
    <section className="mood-selector">
      <div className="mood-selector-header">
        <div>
          <h2>😄 What's your mood today?</h2>
          <p>Pick how you're feeling and we'll suggest the perfect food</p>
        </div>
        {selected && (
          <button className="mood-clear" onClick={() => { setSelected(null); setResults([]); }}>
            Clear ✕
          </button>
        )}
      </div>

      {/* Mood buttons */}
      <div className="mood-buttons">
        {MOODS.map((mood) => (
          <button
            key={mood.key}
            className={`mood-pill ${selected === mood.key ? "active" : ""}`}
            style={selected === mood.key
              ? { background: mood.bg, borderColor: mood.color, color: mood.color }
              : {}
            }
            onClick={() => handleMood(mood)}
          >
            <span className="mood-pill-emoji">{mood.emoji}</span>
            <span className="mood-pill-label">{mood.label}</span>
            <span className="mood-pill-desc">{mood.desc}</span>
          </button>
        ))}
      </div>

      {/* Results */}
      {loading && (
        <div className="mood-loading">
          <div className="mood-spinner" />
          <p>Finding {activeMood?.label.toLowerCase()} mood food...</p>
        </div>
      )}

      {!loading && selected && results.length > 0 && (
        <div className="mood-results">
          <div className="mood-results-label">
            <span>{activeMood?.emoji}</span>
            <p>Perfect for when you're feeling <strong>{activeMood?.label}</strong></p>
          </div>
          <div className="mood-results-grid">
            {results.map((item) => (
              <FoodItem
                key={item._id} id={item._id} name={item.name}
                description={item.description} price={item.price}
                image={item.image} category={item.category}
              />
            ))}
          </div>
        </div>
      )}

      {!loading && selected && results.length === 0 && (
        <div className="mood-empty">
          <p>No items found for this mood. Try another!</p>
        </div>
      )}
    </section>
  );
};

export default MoodSelector;