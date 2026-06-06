import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";
import "./ClosingDeals.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

const ClosingDeals = () => {
  const [deals, setDeals] = useState([]);
  const { addToCart } = useContext(StoreContext);

  useEffect(() => {
    axios.get(`${API}/api/features/closing-discount-foods`).then(({ data }) => {
      if (data.success) setDeals(data.data);
    });
  }, []);

  if (deals.length === 0) return null;

  return (
    <section className="closing-deals">
      <div className="closing-deals-header">
        <h2>⏳ Closing Soon Deals</h2>
        <span className="closing-badge">Limited Time</span>
      </div>
      <div className="closing-deals-grid">
        {deals.map((item) => (
          <div key={item._id} className="closing-card">
            <div className="closing-discount-tag">{item.discountPercentage}% OFF</div>
            <img src={`${API}/images/${item.image}`} alt={item.name} />
            <div className="closing-card-body">
              <h3>{item.name}</h3>
              <p className="closing-timer">⏱ Closes in {item.minsUntilClose} mins</p>
              <div className="closing-prices">
                <span className="closing-new">₹{item.discountedPrice}</span>
                <span className="closing-old">₹{item.price}</span>
              </div>
              <button onClick={() => addToCart(item._id)}>Add to Cart</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ClosingDeals;
