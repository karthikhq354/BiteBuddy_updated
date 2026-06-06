import React, { useState, useEffect } from "react";
import "./Order.css";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../../assets/assets";

const STATUS_COLORS = {
  "Food Processing": { bg: "#fff7ed", color: "#c2410c" },
  "Out for Delivery": { bg: "#eff6ff", color: "#1d4ed8" },
  "Delivered":        { bg: "#f0fdf4", color: "#15803d" },
  "Order Placed":     { bg: "#faf5ff", color: "#7e22ce" },
};

const Orders = ({ url }) => {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("All");

  const fetchAllOrders = async () => {
    try {
      const response = await axios.get(`${url}/api/order/list`);
      if (response.data.success) setOrders(response.data.data.reverse());
      else toast.error("Error fetching orders");
    } catch { toast.error("Server Error"); }
    setLoading(false);
  };

  const statusHandler = async (e, orderId) => {
    try {
      const response = await axios.post(`${url}/api/order/status`, {
        orderId, status: e.target.value,
      });
      if (response.data.success) { toast.success("Status updated"); await fetchAllOrders(); }
    } catch { toast.error("Error updating status"); }
  };

  useEffect(() => { fetchAllOrders(); }, []);

  const STATUSES = ["All", "Order Placed", "Food Processing", "Out for Delivery", "Delivered"];

  const filtered = filter === "All" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="orders-page">

      {/* ── HEADER ─────────────────────── */}
      <div className="orders-header">
        <div>
          <h1>Orders</h1>
          <p>{orders.length} total orders</p>
        </div>
        <button className="orders-refresh-btn" onClick={fetchAllOrders}>🔄 Refresh</button>
      </div>

      {/* ── FILTER TABS ────────────────── */}
      <div className="orders-tabs">
        {STATUSES.map((s) => (
          <button key={s} className={`orders-tab ${filter === s ? "active" : ""}`}
            onClick={() => setFilter(s)}>
            {s}
            <span className="orders-tab-count">
              {s === "All" ? orders.length : orders.filter((o) => o.status === s).length}
            </span>
          </button>
        ))}
      </div>

      {/* ── ORDERS LIST ────────────────── */}
      {loading ? (
        <div className="orders-loading"><div className="orders-spinner"/><p>Loading orders...</p></div>
      ) : filtered.length === 0 ? (
        <div className="orders-empty"><p>No orders found.</p></div>
      ) : (
        <div className="orders-list">
          {filtered.map((order) => (
            <div key={order._id} className="order-card">

              <div className="order-card-left">
                <img src={assets.parcel_icon} alt="" className="order-icon" />
                <div className="order-items">
                  {order.items.map((item, i) => (
                    <span key={i} className="order-item-tag">
                      {item.name} × {item.quantity}
                    </span>
                  ))}
                </div>
              </div>

              <div className="order-card-mid">
                <p className="order-customer">
                  {order.address.firstName} {order.address.lastName}
                </p>
                <p className="order-address">
                  {order.address.street}, {order.address.city}
                </p>
                <p className="order-phone">{order.address.phone}</p>
              </div>

              <div className="order-card-right">
                <p className="order-amount">₹{order.amount}</p>
                <p className="order-count">{order.items.length} item{order.items.length > 1 ? "s" : ""}</p>
                <span className="order-payment" style={order.payment
                  ? { background: "#f0fdf4", color: "#15803d" }
                  : { background: "#fef2f2", color: "#dc2626" }}>
                  {order.payment ? "✅ Paid" : "⏳ Pending"}
                </span>
              </div>

              <div className="order-card-status">
                <select
                  value={order.status}
                  onChange={(e) => statusHandler(e, order._id)}
                  style={{
                    background: STATUS_COLORS[order.status]?.bg || "#f9fafb",
                    color:      STATUS_COLORS[order.status]?.color || "#374151",
                  }}
                >
                  <option value="Order Placed">Order Placed</option>
                  <option value="Food Processing">Food Processing</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;