import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyOrders.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { assets } from "../../assets/assets";
import { io } from "socket.io-client";

const STATUS_CONFIG = {
  "Food Processing": { color: "#d97706", bg: "#fffbeb", icon: "🍳", step: 1 },
  "Out for Delivery": { color: "#2563eb", bg: "#eff6ff", icon: "🛵", step: 2 },
  "Delivered":        { color: "#16a34a", bg: "#f0fdf4", icon: "✅", step: 3 },
};

const StatusTimeline = ({ status }) => {
  const currentStep = STATUS_CONFIG[status]?.step || 1;
  const steps = [
    { step: 1, label: "Processing", icon: "🍳" },
    { step: 2, label: "On the way", icon: "🛵" },
    { step: 3, label: "Delivered",  icon: "✅" },
  ];
  return (
    <div className="status-timeline">
      {steps.map((s, i) => (
        <div key={s.step} className="timeline-item">
          <div className={`timeline-dot ${currentStep >= s.step ? "active" : ""}`}>
            {s.icon}
          </div>
          <span className={`timeline-label ${currentStep >= s.step ? "active" : ""}`}>
            {s.label}
          </span>
          {i < steps.length - 1 && (
            <div className={`timeline-line ${currentStep > s.step ? "done" : ""}`} />
          )}
        </div>
      ))}
    </div>
  );
};

const MyOrders = () => {
  const { url, token } = useContext(StoreContext);
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const response = await axios.post(
        `${url}/api/order/userorders`, {}, { headers: { token } }
      );
      setOrders(response.data.data.reverse());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    let userId = null;
    try { userId = JSON.parse(atob(token.split(".")[1])).id; }
    catch { return; }

    fetchOrders();

    const socket = io(url);
    socket.on("connect", () => socket.emit("joinRoom", userId));
    socket.on("orderStatusUpdated", (data) => {
      setOrders((prev) =>
        prev.map((order) =>
          order._id === data.orderId ? { ...order, status: data.newStatus } : order
        )
      );
    });
    return () => socket.disconnect();
  }, [token, url]);

  if (loading) return (
    <div className="myorders-loading">
      <div className="myorders-spinner" />
      <p>Loading your orders...</p>
    </div>
  );

  return (
    <div className="my-orders">
      <div className="myorders-header">
        <h1>My Orders</h1>
        <p>{orders.length} order{orders.length !== 1 ? "s" : ""} placed</p>
      </div>

      {orders.length === 0 ? (
        <div className="myorders-empty">
          <span>📦</span>
          <h3>No orders yet</h3>
          <p>You haven't placed any orders. Start exploring our menu!</p>
          <button onClick={() => navigate("/menu")}>Browse Menu</button>
        </div>
      ) : (
        <div className="myorders-list">
          {orders.map((order) => {
            const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG["Food Processing"];
            return (
              <div key={order._id} className="order-card">

                {/* ── TOP ROW ──────────────────── */}
                <div className="order-card-top">
                  <div className="order-card-left">
                    <img src={assets.parcel_icon} alt="" className="order-parcel-icon" />
                    <div>
                      <p className="order-id">
                        Order #{order._id.toString().slice(-6).toUpperCase()}
                      </p>
                      <p className="order-date">
                        {new Date(order.date).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="order-card-right">
                    <p className="order-amount">₹{order.amount}</p>
                    <p className="order-count">
                      {order.items.length} item{order.items.length > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* ── ITEMS ────────────────────── */}
                <div className="order-items-list">
                  {order.items.map((item, i) => (
                    <span key={i} className="order-item-chip">
                      {item.name} × {item.quantity}
                    </span>
                  ))}
                </div>

                {/* ── STATUS + TIMELINE ─────────── */}
                <div className="order-status-row">
                  <div className="order-status-badge"
                    style={{ color: statusInfo.color, background: statusInfo.bg }}>
                    <span>{statusInfo.icon}</span>
                    <span>{order.status}</span>
                    {order.status !== "Delivered" && <span className="live-dot" />}
                  </div>
                </div>

                <StatusTimeline status={order.status} />

                {/* ── TRACK BUTTON ─────────────── */}
                <button className="track-btn"
                  onClick={() => navigate(`/track/${order._id}`)}>
                  Track Order →
                </button>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;