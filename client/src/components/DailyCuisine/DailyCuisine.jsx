import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";
import "./DailyCuisine.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

const DailyCuisine = () => {
  const [info, setInfo] = useState(null);
  const { addToCart, cartItems, removeFromCart } = useContext(StoreContext);

  useEffect(() => {
    axios.get(`${API}/api/features/daily-cuisine`).then(({ data }) => {
      if (data.success) setInfo(data);
    });
  }, []);

  if (!info) return null;

  return (
    <section className="daily-cuisine">
      <div className="daily-cuisine-banner">
        <div>
          <p className="daily-label">Today's Food Discovery</p>
          <h2>{info.tagline}</h2>
          <p className="daily-sub">Explore {info.cuisine} cuisine today — {info.day} special</p>
        </div>
        <span className="daily-day-badge">{info.day}</span>
      </div>
      <div className="daily-cuisine-grid">
        {info.data.map((item) => (
          <FoodItem key={item._id} id={item._id} name={item.name}
            description={item.description} price={item.price}
            image={item.image} category={item.category} />
        ))}
      </div>
    </section>
  );
};

export default DailyCuisine;
