import React, { useContext, useState } from "react";
import "./FoodItem.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import FoodModal from "../FoodModal/FoodModal";

const FoodItem = ({ id, name, price, description, image, category }) => {
  const { cartItems = {}, addToCart, removeFromCart, url } = useContext(StoreContext);
  const [showModal, setShowModal] = useState(false);
  const item = { _id: id, name, price, description, image, category };

  return (
    <>
      {showModal && <FoodModal item={item} onClose={() => setShowModal(false)} />}
      <div className="food-item">
        <div className="food-item-img-container" onClick={() => setShowModal(true)}>
          <img className="food-item-image" src={url + "/images/" + image} alt={name} />
          <div className="food-item-overlay"><span>View Details</span></div>
          {!cartItems[id] ? (
            <img
              className="add"
              onClick={(e) => { e.stopPropagation(); addToCart(id); }}
              src={assets.add_icon_white}
              alt=""
            />
          ) : (
            <div className="food-item-counter" onClick={(e) => e.stopPropagation()}>
              <img onClick={() => removeFromCart(id)} src={assets.remove_icon_red} alt="" />
              <p>{cartItems[id]}</p>
              <img onClick={() => addToCart(id)} src={assets.add_icon_green} alt="" />
            </div>
          )}
        </div>
        <div className="food-item-info">
          <div className="food-item-name-rating">
            <p>{name}</p>
            <img src={assets.rating_starts} alt="" />
          </div>
          <p className="food-item-desc">{description}</p>
          <p className="food-item-price">₹{price}</p>
        </div>
      </div>
    </>
  );
};

export default FoodItem;