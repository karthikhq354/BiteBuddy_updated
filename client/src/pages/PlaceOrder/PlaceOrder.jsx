import React, { useContext, useEffect, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PlaceOrder = () => {
  const { getTotalCartAmount, getFinalAmount, token, url,
    food_list, cartItems, discount, promoCode, buttonRef } = useContext(StoreContext);

  const navigate = useNavigate();
  const [savedAddresses,    setSavedAddresses]    = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [saveNewAddress,    setSaveNewAddress]    = useState(false);
  const [addressLabel,      setAddressLabel]      = useState("Home");
  const [loading,           setLoading]           = useState(false);
  const [data, setData] = useState({
    firstName: "", lastName: "", email: "",
    street: "", city: "", state: "",
    pincode: "", country: "", phone: "",
  });

  useEffect(() => {
    if (!token) {
      navigate("/cart");
      setTimeout(() => buttonRef.current?.click(), 100);
    } else if (getTotalCartAmount() === 0) {
      navigate("/cart");
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      axios.get(`${url}/api/address/list`, { headers: { token } }).then((res) => {
        if (res.data.success) {
          setSavedAddresses(res.data.data);
          const defaultAddr = res.data.data.find((a) => a.isDefault);
          if (defaultAddr) selectSavedAddress(defaultAddr);
        }
      });
    }
  }, [token]);

  const selectSavedAddress = (address) => {
    setSelectedAddressId(address._id);
    setData({
      firstName: address.firstName, lastName: address.lastName,
      email: address.email, street: address.street,
      city: address.city, state: address.state,
      pincode: address.pincode, country: address.country,
      phone: address.phone,
    });
  };

  const useNewAddress = () => {
    setSelectedAddressId(null);
    setData({ firstName: "", lastName: "", email: "", street: "",
      city: "", state: "", pincode: "", country: "", phone: "" });
  };

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
    if (selectedAddressId) setSelectedAddressId(null);
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    let orderItems = [];
    food_list.forEach((item) => {
      if (cartItems[item._id]) orderItems.push({ ...item, quantity: cartItems[item._id] });
    });
    if (saveNewAddress && !selectedAddressId) {
      await axios.post(`${url}/api/address/add`, { ...data, label: addressLabel }, { headers: { token } });
    }
    const response = await axios.post(
      `${url}/api/order/place`,
      { address: data, items: orderItems, amount: getFinalAmount(), promoCode: promoCode || null },
      { headers: { token } }
    );
    setLoading(false);
    if (response.data.success) {
      window.location.replace(response.data.session_url);
    } else {
      alert("Error placing order. Please try again.");
    }
  };

  const subtotal = getTotalCartAmount();
  const delivery = subtotal === 0 ? 0 : 99;
  const final    = getFinalAmount();

  return (
    <form onSubmit={placeOrder} className="place-order">

      {/* ── LEFT — DELIVERY INFO ─────────────────── */}
      <div className="place-order-left">
        <h1 className="place-order-title">📦 Delivery Information</h1>

        {/* Saved Addresses */}
        {savedAddresses.length > 0 && (
          <div className="saved-addresses">
            <p className="saved-label">Your saved addresses</p>
            <div className="saved-list">
              {savedAddresses.map((addr) => (
                <div key={addr._id}
                  className={`saved-card ${selectedAddressId === addr._id ? "active" : ""}`}
                  onClick={() => selectSavedAddress(addr)}>
                  <div className="saved-card-top">
                    <span className="label-badge">{addr.label}</span>
                    {addr.isDefault && <span className="default-badge">Default</span>}
                  </div>
                  <p className="saved-card-name">{addr.firstName} {addr.lastName}</p>
                  <p className="saved-card-detail">{addr.street}, {addr.city}</p>
                  <p className="saved-card-detail">{addr.state} — {addr.pincode}</p>
                </div>
              ))}
              <div className={`saved-card new-card ${!selectedAddressId ? "active" : ""}`}
                onClick={useNewAddress}>
                <span>➕</span>
                <p>Use a new address</p>
              </div>
            </div>
          </div>
        )}

        {/* Address Form */}
        <div className="place-order-form">
          <div className="form-row">
            <div className="form-field">
              <label>First Name *</label>
              <input required name="firstName" value={data.firstName}
                placeholder="Arjun" onChange={onChangeHandler} />
            </div>
            <div className="form-field">
              <label>Last Name *</label>
              <input required name="lastName" value={data.lastName}
                placeholder="Mehta" onChange={onChangeHandler} />
            </div>
          </div>
          <div className="form-field">
            <label>Email Address *</label>
            <input required name="email" type="email" value={data.email}
              placeholder="arjun@email.com" onChange={onChangeHandler} />
          </div>
          <div className="form-field">
            <label>Street Address *</label>
            <input required name="street" value={data.street}
              placeholder="123 Main Street" onChange={onChangeHandler} />
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>City *</label>
              <input required name="city" value={data.city}
                placeholder="Chennai" onChange={onChangeHandler} />
            </div>
            <div className="form-field">
              <label>State *</label>
              <input required name="state" value={data.state}
                placeholder="Tamil Nadu" onChange={onChangeHandler} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>Pin Code *</label>
              <input required name="pincode" value={data.pincode}
                placeholder="600001" onChange={onChangeHandler} />
            </div>
            <div className="form-field">
              <label>Country *</label>
              <input required name="country" value={data.country}
                placeholder="India" onChange={onChangeHandler} />
            </div>
          </div>
          <div className="form-field">
            <label>Phone Number *</label>
            <input required name="phone" value={data.phone}
              placeholder="+91 98765 43210" onChange={onChangeHandler} />
          </div>

          {/* Save address checkbox */}
          {!selectedAddressId && token && (
            <div className="save-address-row">
              <label className="save-address-label">
                <input type="checkbox" checked={saveNewAddress}
                  onChange={(e) => setSaveNewAddress(e.target.checked)} />
                <span>Save this address for future orders</span>
              </label>
              {saveNewAddress && (
                <select value={addressLabel}
                  onChange={(e) => setAddressLabel(e.target.value)}
                  className="label-select">
                  <option value="Home">🏠 Home</option>
                  <option value="Work">💼 Work</option>
                  <option value="Other">📍 Other</option>
                </select>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT — ORDER SUMMARY ────────────────── */}
      <div className="place-order-right">
        <div className="order-summary-card">
          <h2>Order Summary</h2>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>
          <hr />

          {discount > 0 && (
            <>
              <div className="summary-row discount">
                <span>Discount ({promoCode})</span>
                <span>− ₹{discount}</span>
              </div>
              <hr />
            </>
          )}

          <div className="summary-row">
            <span>Delivery Fee</span>
            <span>₹{delivery}</span>
          </div>
          <hr />

          <div className="summary-row total">
            <strong>Total</strong>
            <strong>₹{final}</strong>
          </div>

          <button type="submit" className="place-order-btn" disabled={loading}>
            {loading ? "Processing..." : "🔒 Proceed to Payment"}
          </button>

          <p className="place-order-secure">
            🔐 Secured by Stripe — your payment is safe
          </p>
        </div>
      </div>

    </form>
  );
};

export default PlaceOrder;