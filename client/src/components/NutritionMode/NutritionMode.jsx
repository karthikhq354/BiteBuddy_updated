import React, { useState, useContext, useEffect } from "react";
import "./NutritionMode.css";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../../components/FoodItem/FoodItem";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_SERVER_URL || "http://localhost:4000";

const DIET_OPTIONS = [
  { key: "veg",          label: "🥦 Vegetarian",   desc: "No meat" },
  { key: "vegan",        label: "🌱 Vegan",         desc: "No animal products" },
  { key: "non-veg",      label: "🍗 Non-Veg",       desc: "Includes meat" },
  { key: "high-protein", label: "💪 High Protein",  desc: "Muscle building" },
  { key: "low-calorie",  label: "🔥 Low Calorie",   desc: "Weight loss" },
];

const ALLERGY_CHIPS = ["nuts", "dairy", "gluten", "eggs", "soy", "shellfish"];

const NutritionMode = () => {
  const { token, url } = useContext(StoreContext);
  const navigate = useNavigate();

  const [prefs, setPrefs] = useState({
    dietType:    [],
    maxCalories: "",
    minProtein:  "",
    allergies:   [],
  });

  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [message,  setMessage]  = useState("");
  const [userId,   setUserId]   = useState(null);

  // Decode userId from token
  useEffect(() => {
    if (!token) return;
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      setUserId(decoded.id);
    } catch { }
  }, [token]);

  // Load existing preferences if user has them
  useEffect(() => {
    if (!userId || !token) return;
    axios.get(`${API}/api/features/nutrition-recommendation/${userId}`, { headers: { token } })
      .then(({ data }) => {
        if (data.success) {
          if (data.preferences?.dietType?.length) {
            setPrefs({
              dietType:    data.preferences.dietType || [],
              maxCalories: data.preferences.maxCalories || "",
              minProtein:  data.preferences.minProtein  || "",
              allergies:   data.preferences.allergies   || [],
            });
            setSaved(true);
          }
          if (data.data?.length > 0) setResults(data.data);
        }
      }).catch(() => {});
  }, [userId, token]);

  const toggleDiet = (key) => {
    setSaved(false);
    setPrefs((p) => ({
      ...p,
      dietType: p.dietType.includes(key)
        ? p.dietType.filter((d) => d !== key)
        : [...p.dietType, key],
    }));
  };

  const toggleAllergy = (a) => {
    setSaved(false);
    setPrefs((p) => ({
      ...p,
      allergies: p.allergies.includes(a)
        ? p.allergies.filter((x) => x !== a)
        : [...p.allergies, a],
    }));
  };

  const handleSave = async () => {
    if (!token) { navigate("/"); return; }
    if (prefs.dietType.length === 0) {
      setMessage("Please select at least one diet type.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      await axios.post(`${API}/api/features/nutrition-preferences`, {
        userId,
        dietType:    prefs.dietType,
        maxCalories: prefs.maxCalories ? Number(prefs.maxCalories) : null,
        minProtein:  prefs.minProtein  ? Number(prefs.minProtein)  : null,
        allergies:   prefs.allergies,
      }, { headers: { token } });

      const { data } = await axios.get(
        `${API}/api/features/nutrition-recommendation/${userId}`,
        { headers: { token } }
      );

      if (data.success) {
        setResults(data.data);
        setSaved(true);
        setMessage(data.data.length > 0
          ? `✅ Found ${data.data.length} meals matching your diet!`
          : "No exact matches found. Try adjusting your preferences."
        );
      }
    } catch (e) {
      setMessage("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="nutrition-page">

      {/* ── HERO ──────────────────────────────── */}
      <div className="nutrition-hero">
        <span className="nutrition-hero-icon">🥗</span>
        <div>
          <h1>Nutrition Mode</h1>
          <p>Tell us your dietary preferences and we'll recommend the perfect meals for you</p>
        </div>
      </div>

      {/* ── LOGIN GATE ────────────────────────── */}
      {!token ? (
        <div className="nutrition-login-gate">
          <span>🔒</span>
          <h3>Sign in to use Nutrition Mode</h3>
          <p>Your preferences are saved to your account so we can personalise your experience.</p>
          <button onClick={() => navigate("/")}>Sign In</button>
        </div>
      ) : (
        <div className="nutrition-layout">

          {/* ── PREFERENCES FORM ──────────────── */}
          <div className="nutrition-form-card">
            <h2>Your Preferences</h2>
            <div className="nutrition-form-scroll">

            {/* Diet Type */}
            <div className="nutrition-section">
              <label>Diet Type *</label>
              <p className="nutrition-hint">Select all that apply</p>
              <div className="diet-options">
                {DIET_OPTIONS.map((d) => (
                  <button
                    key={d.key}
                    className={`diet-option ${prefs.dietType.includes(d.key) ? "active" : ""}`}
                    onClick={() => toggleDiet(d.key)}
                  >
                    <span className="diet-option-label">{d.label}</span>
                    <span className="diet-option-desc">{d.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Calorie & Protein */}
            <div className="nutrition-section">
              <label>Nutritional Goals</label>
              <div className="nutrition-inputs-row">
                <div className="nutrition-input-wrap">
                  <span>🔥</span>
                  <div>
                    <p>Max Calories</p>
                    <input
                      type="number"
                      placeholder="e.g. 500"
                      value={prefs.maxCalories}
                      onChange={(e) => { setSaved(false); setPrefs({ ...prefs, maxCalories: e.target.value }); }}
                    />
                  </div>
                  <span className="nutrition-unit">kcal</span>
                </div>
                <div className="nutrition-input-wrap">
                  <span>💪</span>
                  <div>
                    <p>Min Protein</p>
                    <input
                      type="number"
                      placeholder="e.g. 20"
                      value={prefs.minProtein}
                      onChange={(e) => { setSaved(false); setPrefs({ ...prefs, minProtein: e.target.value }); }}
                    />
                  </div>
                  <span className="nutrition-unit">g</span>
                </div>
              </div>
            </div>

            {/* Allergies */}
            <div className="nutrition-section">
              <label>Avoid Allergens</label>
              <p className="nutrition-hint">We'll exclude items containing these</p>
              <div className="allergy-chips">
                {ALLERGY_CHIPS.map((a) => (
                  <button
                    key={a}
                    className={`allergy-chip ${prefs.allergies.includes(a) ? "active" : ""}`}
                    onClick={() => toggleAllergy(a)}
                  >
                    {prefs.allergies.includes(a) ? "✕ " : ""}{a}
                  </button>
                ))}
              </div>
            </div>

            {message && (
              <p className={`nutrition-message ${saved ? "success" : "info"}`}>{message}</p>
            )}

            <button
              className="nutrition-save-btn"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Finding meals..." : saved ? "🔄 Update Preferences" : "🥗 Get Recommendations"}
            </button>
            </div> {/* close nutrition-form-scroll */}
          </div> {/* close nutrition-form-card */}
          <div className="nutrition-results-col">
            {!saved && results.length === 0 ? (
              <div className="nutrition-placeholder">
                <span>🥦</span>
                <h3>Your personalised meal plan</h3>
                <p>Set your preferences on the left and we'll show meals that match your diet goals</p>
                <div className="nutrition-example-tags">
                  <span>Low Calorie</span>
                  <span>High Protein</span>
                  <span>Vegan</span>
                  <span>Gluten Free</span>
                </div>
              </div>
            ) : (
              <div>
                <div className="nutrition-results-header">
                  <h2>Recommended for You</h2>
                  <span className="nutrition-count">{results.length} meals found</span>
                </div>
                {results.length === 0 ? (
                  <div className="nutrition-no-results">
                    <span>🤔</span>
                    <p>No exact matches. Try relaxing your filters — remove some allergens or increase calorie limit.</p>
                  </div>
                ) : (
                  <div className="nutrition-grid">
                    {results.map((item) => (
                      <FoodItem
                        key={item._id} id={item._id} name={item.name}
                        description={item.description} price={item.price}
                        image={item.image} category={item.category}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default NutritionMode;