import React, { useContext } from "react";
import "./FoodModal.css";
import { StoreContext } from "../../context/StoreContext";
import { assets } from "../../assets/assets";

const FoodModal = ({ item, onClose }) => {
  const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext);
  if (!item) return null;

  return (
    <div className="food-modal-overlay" onClick={onClose}>
      <div className="food-modal" onClick={(e) => e.stopPropagation()}>
        <button className="food-modal-close" onClick={onClose}>✕</button>
        <div className="food-modal-img-wrap">
          <img src={url + "/images/" + item.image} alt={item.name} />
        </div>
        <div className="food-modal-body">
          <div className="food-modal-top">
            <h2>{item.name}</h2>
            <img src={assets.rating_starts} alt="rating" className="food-modal-rating" />
          </div>
          <span className="food-modal-category">{item.category}</span>
          <p className="food-modal-desc">{item.description}</p>
          <div className="food-modal-footer">
            <p className="food-modal-price">₹{item.price}</p>
            {!cartItems[item._id] ? (
              <button className="food-modal-add" onClick={() => addToCart(item._id)}>
                Add to Cart
              </button>
            ) : (
              <div className="food-modal-counter">
                <button onClick={() => removeFromCart(item._id)}>−</button>
                <span>{cartItems[item._id]}</span>
                <button onClick={() => addToCart(item._id)}>+</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodModal;