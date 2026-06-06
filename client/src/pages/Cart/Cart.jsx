import React, { useContext, useState } from "react";
import "./Cart.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const {
    cartItems, food_list, removeFromCart,
    getTotalCartAmount, getFinalAmount, url,
    applyPromoCode, clearPromo, promoCode, discount,
  } = useContext(StoreContext);

  const navigate = useNavigate();
  const [promoInput,   setPromoInput]   = useState("");
  const [promoMessage, setPromoMessage] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoSuccess, setPromoSuccess] = useState(false);

  const handlePromoSubmit = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoMessage("");
    const result = await applyPromoCode(promoInput.trim());
    setPromoMessage(result.message);
    setPromoSuccess(result.success);
    setPromoLoading(false);
  };

  const handleRemovePromo = () => {
    clearPromo();
    setPromoInput("");
    setPromoMessage("");
    setPromoSuccess(false);
  };

  const subtotal = getTotalCartAmount();
  const delivery = subtotal === 0 ? 0 : 99;
  const final    = getFinalAmount();

  const cartList = food_list.filter((item) => cartItems[item._id] > 0);

  return (
    <div className="cart">

      {/* ── CART ITEMS TABLE ─────────────────────── */}
      <div className="cart-table">
        <div className="cart-table-head">
          <span>Item</span>
          <span>Name</span>
          <span>Price</span>
          <span>Qty</span>
          <span>Total</span>
          <span>Remove</span>
        </div>

        {cartList.length === 0 ? (
          <div className="cart-empty">
            <p>🛒</p>
            <h3>Your cart is empty</h3>
            <button onClick={() => navigate("/menu")}>Browse Menu</button>
          </div>
        ) : (
          cartList.map((item) => (
            <React.Fragment key={item._id}>
              <div className="cart-table-row">
                <img src={`${url}/images/${item.image}`} alt={item.name} />
                <p className="cart-item-name">{item.name}</p>
                <p>₹{item.price}</p>
                <p>{cartItems[item._id]}</p>
                <p className="cart-item-total">₹{item.price * cartItems[item._id]}</p>
                <button className="cart-remove-btn"
                  onClick={() => removeFromCart(item._id)}>✕</button>
              </div>
              <hr className="cart-divider" />
            </React.Fragment>
          ))
        )}
      </div>

      {/* ── BOTTOM ───────────────────────────────── */}
      {cartList.length > 0 && (
        <div className="cart-bottom">

          {/* ── CART TOTAL ───────────────────────── */}
          <div className="cart-total-card">
            <h2>Cart Total</h2>

            <div className="cart-total-row">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <hr />

            {discount > 0 && (
              <>
                <div className="cart-total-row discount">
                  <span>Discount ({promoCode})</span>
                  <span>− ₹{discount}</span>
                </div>
                <hr />
              </>
            )}

            <div className="cart-total-row">
              <span>Delivery Fee</span>
              <span>₹{delivery}</span>
            </div>
            <hr />

            <div className="cart-total-row total">
              <strong>Total</strong>
              <strong>₹{final}</strong>
            </div>

            <button className="cart-checkout-btn"
              onClick={() => subtotal > 0 && navigate("/order")}>
              Proceed to Checkout →
            </button>
          </div>

          {/* ── PROMO CODE ───────────────────────── */}
          <div className="cart-promo-card">
            <h2>🎟️ Promo Code</h2>
            <p>Have a discount code? Enter it below</p>

            {promoCode ? (
              <div className="cart-promo-applied">
                <div className="cart-promo-applied-left">
                  <span className="cart-promo-tick">✅</span>
                  <div>
                    <p className="cart-promo-code">{promoCode}</p>
                    <p className="cart-promo-saving">You're saving ₹{discount}!</p>
                  </div>
                </div>
                <button className="cart-promo-remove" onClick={handleRemovePromo}>
                  Remove
                </button>
              </div>
            ) : (
              <div className="cart-promo-input-wrap">
                <input
                  type="text"
                  placeholder="Enter promo code"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handlePromoSubmit()}
                />
                <button onClick={handlePromoSubmit} disabled={promoLoading}>
                  {promoLoading ? "..." : "Apply"}
                </button>
              </div>
            )}

            {promoMessage && (
              <p className={promoSuccess ? "promo-msg success" : "promo-msg error"}>
                {promoSuccess ? "✅" : "❌"} {promoMessage}
              </p>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default Cart;