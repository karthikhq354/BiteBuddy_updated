import React, { useContext, useState, useEffect } from "react";
import "./Profile.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { token, url } = useContext(StoreContext);
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddr, setNewAddr] = useState({
    label: "Home", firstName: "", lastName: "", email: "",
    street: "", city: "", state: "", pincode: "", country: "", phone: "",
  });

  useEffect(() => {
    if (!token) { navigate("/"); return; }
    fetchAddresses();
  }, [token]);

  const fetchAddresses = async () => {
    try {
      const res = await axios.post(url + "/api/address/list", {}, { headers: { token } });
      if (res.data.success) {
        setAddresses(Array.isArray(res.data.data) ? res.data.data : []);
      } else {
        setAddresses([]);
      }
    } catch (err) {
      console.error(err);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(url + "/api/address/add", newAddr, { headers: { token } });
      if (res.data.success) {
        setShowAddForm(false);
        setNewAddr({ label: "Home", firstName: "", lastName: "", email: "", street: "", city: "", state: "", pincode: "", country: "", phone: "" });
        fetchAddresses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.post(url + "/api/address/delete", { addressId: id }, { headers: { token } });
      fetchAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await axios.post(url + "/api/address/setdefault", { addressId: id }, { headers: { token } });
      fetchAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  const onChangeAddr = (e) => setNewAddr((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  if (loading) return <div className="profile-loading">Loading profile...</div>;

  return (
    <div className="profile-page">
      <h2 className="profile-title">My Profile</h2>

      <div className="profile-section">
        <div className="profile-section-header">
          <h3>Saved Addresses</h3>
          {addresses.length < 5 && (
            <button className="profile-add-btn" onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? "Cancel" : "+ Add Address"}
            </button>
          )}
        </div>

        {showAddForm && (
          <form className="addr-form" onSubmit={handleAdd}>
            <select name="label" value={newAddr.label} onChange={onChangeAddr}>
              <option value="Home">🏠 Home</option>
              <option value="Work">💼 Work</option>
              <option value="Other">📍 Other</option>
            </select>
            <div className="addr-form-row">
              <input required name="firstName" placeholder="First Name" value={newAddr.firstName} onChange={onChangeAddr} />
              <input required name="lastName"  placeholder="Last Name"  value={newAddr.lastName}  onChange={onChangeAddr} />
            </div>
            <input required name="email"   type="email" placeholder="Email"   value={newAddr.email}   onChange={onChangeAddr} />
            <input required name="street"  placeholder="Street"               value={newAddr.street}  onChange={onChangeAddr} />
            <div className="addr-form-row">
              <input required name="city"    placeholder="City"    value={newAddr.city}    onChange={onChangeAddr} />
              <input required name="state"   placeholder="State"   value={newAddr.state}   onChange={onChangeAddr} />
            </div>
            <div className="addr-form-row">
              <input required name="pincode" placeholder="Pincode" value={newAddr.pincode} onChange={onChangeAddr} />
              <input required name="country" placeholder="Country" value={newAddr.country} onChange={onChangeAddr} />
            </div>
            <input required name="phone" placeholder="Phone" value={newAddr.phone} onChange={onChangeAddr} />
            <button type="submit" className="addr-save-btn">Save Address</button>
          </form>
        )}

        {addresses.length === 0 && !showAddForm ? (
          <p className="profile-empty">No saved addresses yet.</p>
        ) : (
          <div className="addr-list">
            {addresses.map((addr) => (
              <div key={addr._id} className={`addr-card ${addr.isDefault ? "default" : ""}`}>
                <div className="addr-card-top">
                  <span className="addr-label">{addr.label}</span>
                  {addr.isDefault && <span className="addr-default-badge">✓ Default</span>}
                </div>
                <p className="addr-name">{addr.firstName} {addr.lastName}</p>
                <p className="addr-detail">{addr.street}, {addr.city}</p>
                <p className="addr-detail">{addr.state} — {addr.pincode}, {addr.country}</p>
                <p className="addr-detail">📞 {addr.phone}</p>
                <div className="addr-actions">
                  {!addr.isDefault && (
                    <button className="addr-btn" onClick={() => handleSetDefault(addr._id)}>
                      Set as Default
                    </button>
                  )}
                  <button className="addr-btn delete" onClick={() => handleDelete(addr._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;