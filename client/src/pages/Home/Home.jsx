import React, { useState, useContext, useEffect } from "react";
import "./Home.css";
import Header from "../../components/Header/Header";
import FoodDisplay from "../../components/FoodDisplay/FoodDisplay";
import Testimonials from "../../components/Testimonials/Testimonials";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../../components/FoodItem/FoodItem";
import ClosingDeals from "../../components/ClosingDeals/ClosingDeals";
import DailyCuisine from "../../components/DailyCuisine/DailyCuisine";
import SurpriseMe from "../../components/SurpriseMe/SurpriseMe";
import MoodSelector from "../../components/MoodSelector/MoodSelector";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_SERVER_URL || "http://localhost:4000";

const PROMOS = [
  { code: "WELCOME30", label: "30% off your first order",           color: "#ff6b35", bg: "#fff4f0" },
  { code: "FREESHIP",  label: "Free delivery on orders above ₹299", color: "#3b82f6", bg: "#eff6ff" },
  { code: "SAVE50",    label: "Flat ₹50 off — no minimum!",         color: "#10b981", bg: "#f0fdf4" },
];

const Home = () => {
  const { food_list, token } = useContext(StoreContext);
  const [trending,       setTrending]       = useState([]);
  const [topPicks,       setTopPicks]       = useState([]);
  const [isPersonalised, setIsPersonalised] = useState(false);
  const navigate = useNavigate();

  const safeFoodList = Array.isArray(food_list) ? food_list : [];

  useEffect(() => {
    axios.get(`${API}/api/trending?limit=4`)
      .then(({ data }) => {
        if (data.success && data.data.length > 0) setTrending(data.data);
        else setTrending(safeFoodList.slice(0, 4));
      })
      .catch(() => setTrending(safeFoodList.slice(0, 4)));
  }, []);

  useEffect(() => {
    const headers = token ? { token } : {};
    axios.post(`${API}/api/trending/top-picks?limit=4`, {}, { headers })
      .then(({ data }) => {
        if (data.success && data.data.length > 0) {
          setTopPicks(data.data);
          setIsPersonalised(data.isPersonalised);
        } else {
          setTopPicks(safeFoodList.slice(4, 8));
        }
      })
      .catch(() => setTopPicks(safeFoodList.slice(4, 8)));
  }, [token]);

  useEffect(() => {
    if (safeFoodList.length > 0) {
      if (trending.length === 0) setTrending(safeFoodList.slice(0, 4));
      if (topPicks.length === 0) setTopPicks(safeFoodList.slice(4, 8));
    }
  }, [food_list]);

  return (
    <div>
      <Header />

      {/* ── Promo offers ─────────────────────── */}
      <div className="home-offers">
        {PROMOS.map((p) => (
          <div key={p.code} className="offer-card"
            style={{ background: p.bg, borderColor: p.color + "44" }}>
            <span className="offer-code" style={{ color: p.color }}>{p.code}</span>
            <p>{p.label}</p>
          </div>
        ))}
      </div>

      {/* ── Daily Cuisine Discovery ──────────── */}
      <DailyCuisine />

      {/* ── Surprise Me ──────────────────────── */}
      <section className="home-section home-surprise">
        <div className="home-section-header">
          <h2>🎲 Feeling Adventurous?</h2>
        </div>
        <SurpriseMe />
      </section>

      {/* ── Closing Soon Deals ───────────────── */}
      <ClosingDeals />

      {/* ── Trending Now ─────────────────────── */}
      {trending.length > 0 && (
        <section className="home-section">
          <div className="home-section-header">
            <div className="home-section-title-wrap">
              <h2>🔥 Trending Now</h2>
              <span className="home-section-badge">Last 7 days</span>
            </div>
            <button onClick={() => navigate("/menu")}>See All →</button>
          </div>
          <div className="home-section-grid">
            {trending.map((item) => (
              <FoodItem key={item._id} id={item._id} name={item.name}
                description={item.description} price={item.price}
                image={item.image} category={item.category} />
            ))}
          </div>
        </section>
      )}

      {/* ── Search CTA ───────────────────────── */}
      <div className="search-cta-banner" onClick={() => navigate("/search")}>
        <div className="search-cta-left">
          <span className="search-cta-icon">🔍</span>
          <div>
            <h3>Search & Voice Order</h3>
            <p>Type or speak to find your favourite food instantly</p>
          </div>
        </div>
        <div className="search-cta-right">
          <span className="search-cta-mic">🎤</span>
          <span>Try it →</span>
        </div>
      </div>

      {/* ── Mood Selector (replaces ExploreMenu) */}
      <MoodSelector />

      {/* ── Food Display (all items) ─────────── */}
      <FoodDisplay category="All" limit={5} />

      

      {/* ── Top Picks ────────────────────────── */}
      {topPicks.length > 0 && (
        <section className="home-section">
          <div className="home-section-header">
            <div className="home-section-title-wrap">
              <h2>⭐ Top Picks For You</h2>
              {isPersonalised && (
                <span className="home-section-badge personalised">Based on your orders</span>
              )}
            </div>
            <button onClick={() => navigate("/menu")}>See All →</button>
          </div>
          <div className="home-section-grid">
            {topPicks.map((item) => (
              <FoodItem key={item._id} id={item._id} name={item.name}
                description={item.description} price={item.price}
                image={item.image} category={item.category} />
            ))}
          </div>
        </section>
      )}

      <Testimonials />
    </div>
  );
};

export default Home;