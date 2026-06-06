import React, { useState, useContext } from "react";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";
import "./SurpriseMe.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

const SurpriseMe = () => {
  const [loading, setLoading] = useState(false);
  const [food, setFood] = useState(null);
  const { addToCart } = useContext(StoreContext);

  const handleSurprise = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/features/surprise-food`);
      if (data.success) setFood(data.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="surprise-wrap">
      <button className="surprise-btn" onClick={handleSurprise} disabled={loading}>
        {loading ? "✨ Finding..." : "🎲 Surprise Me!"}
      </button>
      {food && (
        <div className="surprise-result">
          <img src={`${API}/images/${food.image}`} alt={food.name} />
          <div className="surprise-info">
            <span className="surprise-tag">Today's Pick 🎉</span>
            <h3>{food.name}</h3>
            <p>{food.description?.slice(0, 80)}...</p>
            <div className="surprise-footer">
              <span>₹{food.price}</span>
              <button onClick={() => addToCart(food._id)}>Add to Cart</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurpriseMe;
