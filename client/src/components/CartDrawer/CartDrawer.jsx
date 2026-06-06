import React, { useContext } from "react";
import "./CartDrawer.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";

const CartDrawer = ({ isOpen, onClose }) => {
  const { cartItems, food_list, removeFromCart, addToCart, getTotalCartAmount, getFinalAmount, discount, promoCode, url } = useContext(StoreContext);
  const navigate = useNavigate();
  const safeFoodList = Array.isArray(food_list) ? food_list : [];
const safeCartItems = cartItems || {};
const cartFoods = safeFoodList.filter((item) => safeCartItems[item._id] > 0);
  const subtotal = getTotalCartAmount();

  return (
    <>
      <div className={`cart-drawer-overlay ${isOpen ? "open" : ""}`} onClick={onClose} />
      <div className={`cart-drawer ${isOpen ? "open" : ""}`}>
        <div className="cart-drawer-header">
          <h3>Your Cart ({cartFoods.length})</h3>
          <button className="cart-drawer-close" onClick={onClose}>✕</button>
        </div>
        {cartFoods.length === 0 ? (
          <div className="cart-drawer-empty">
            <p style={{fontSize:"48px"}}>🛒</p>
            <p>Your cart is empty</p>
            <button onClick={() => { onClose(); navigate("/menu"); }}>Browse Menu</button>
          </div>
        ) : (
          <>
            <div className="cart-drawer-items">
              {cartFoods.map((item) => (
                <div key={item._id} className="cart-drawer-item">
                  <img src={url + "/images/" + item.image} alt={item.name} />
                  <div className="cart-drawer-item-info">
                    <p className="cart-drawer-item-name">{item.name}</p>
                    <p className="cart-drawer-item-price">₹{item.price}</p>
                  </div>
                  <div className="cart-drawer-counter">
                    <button onClick={() => removeFromCart(item._id)}>−</button>
                    <span>{cartItems[item._id]}</span>
                    <button onClick={() => addToCart(item._id)}>+</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-drawer-footer">
              <div className="cart-drawer-summary">
                <div className="cart-drawer-row"><span>Subtotal</span><span>₹{subtotal}</span></div>
                {discount > 0 && <div className="cart-drawer-row discount"><span>Discount ({promoCode})</span><span>- ₹{discount}</span></div>}
                <div className="cart-drawer-row"><span>Delivery</span><span>₹{subtotal > 0 ? 99 : 0}</span></div>
                <hr />
                <div className="cart-drawer-row total"><strong>Total</strong><strong>₹{getFinalAmount()}</strong></div>
              </div>
              <button className="cart-drawer-checkout" onClick={() => { onClose(); navigate("/order"); }}>Proceed to Checkout →</button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CartDrawer;