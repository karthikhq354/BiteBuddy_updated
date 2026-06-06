import React, { useContext, useEffect, useState, useRef } from "react";
import "./Track.css";
import { useParams, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { io } from "socket.io-client";

const STEPS = [
  { key: "Order Placed",     icon: "📋", desc: "Your order has been received." },
  { key: "Food Processing",  icon: "🍳", desc: "Our kitchen is preparing your food." },
  { key: "Out for Delivery", icon: "🛵", desc: "Your order is on its way!" },
  { key: "Delivered",        icon: "✅", desc: "Order delivered. Enjoy your meal!" },
];

const getStepIndex = (status) => {
  if (status === "Food Processing")  return 1;
  if (status === "Out for Delivery") return 2;
  if (status === "Delivered")        return 3;
  return 0;
};

// Simulated delivery coordinates (Chennai area)
const RESTAURANT_COORDS = { lat: 13.0827, lng: 80.2707 };
const getDeliveryCoords = (address) => {
  const base = { lat: 13.0827 + (Math.random() - 0.5) * 0.05, lng: 80.2707 + (Math.random() - 0.5) * 0.05 };
  return base;
};

const LiveMap = ({ status, address }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Load Leaflet dynamically
    const loadMap = async () => {
      if (window.L) { initMap(); return; }
      const link = document.createElement("link");
      link.rel  = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = initMap;
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (mapInstanceRef.current) return;
      const L = window.L;
      const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false }).setView(
        [RESTAURANT_COORDS.lat, RESTAURANT_COORDS.lng], 13
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap"
      }).addTo(map);

      // Restaurant marker
      const restIcon = L.divIcon({ className: "", html: `<div style="font-size:24px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">🍔</div>`, iconSize: [30, 30] });
      L.marker([RESTAURANT_COORDS.lat, RESTAURANT_COORDS.lng], { icon: restIcon })
        .addTo(map).bindPopup("BiteBuddy Kitchen").openPopup();

      // Delivery location marker
      const destCoords = getDeliveryCoords(address);
      const destIcon = L.divIcon({ className: "", html: `<div style="font-size:24px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">📍</div>`, iconSize: [30, 30] });
      L.marker([destCoords.lat, destCoords.lng], { icon: destIcon }).addTo(map).bindPopup("Delivery Location");

      // Draw route line
      L.polyline([[RESTAURANT_COORDS.lat, RESTAURANT_COORDS.lng], [destCoords.lat, destCoords.lng]], {
        color: "tomato", weight: 3, dashArray: "8 6"
      }).addTo(map);

      // Rider marker (animated)
      if (status === "Out for Delivery") {
        const riderIcon = L.divIcon({ className: "", html: `<div style="font-size:24px;animation:bounce 1s infinite;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">🛵</div>`, iconSize: [30, 30] });
        const midLat = (RESTAURANT_COORDS.lat + destCoords.lat) / 2 + 0.005;
        const midLng = (RESTAURANT_COORDS.lng + destCoords.lng) / 2;
        markerRef.current = L.marker([midLat, midLng], { icon: riderIcon }).addTo(map).bindPopup("Your Rider");
      }

      mapInstanceRef.current = map;
    };

    loadMap();
    return () => {
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    };
  }, [status]);

  if (status === "Order Placed" || status === "Food Processing") {
    return (
      <div className="map-placeholder">
        <span>🍳</span>
        <p>Map will appear when your order is out for delivery</p>
      </div>
    );
  }

  if (status === "Delivered") {
    return (
      <div className="map-placeholder delivered">
        <span>✅</span>
        <p>Your order has been delivered!</p>
      </div>
    );
  }

  return <div ref={mapRef} className="track-map" />;
};

const Track = () => {
  const { orderId } = useParams();
  const { token, url } = useContext(StoreContext);
  const navigate = useNavigate();
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { navigate("/"); return; }

    axios.post(`${url}/api/order/userorders`, {}, { headers: { token } }).then((res) => {
      if (res.data.success) {
        const found = res.data.data.find((o) => o._id === orderId);
        setOrder(found || null);
      }
      setLoading(false);
    });

    let userId = null;
    try { userId = JSON.parse(atob(token.split(".")[1])).id; } catch { return; }

    const socket = io(url);
    socket.on("connect", () => socket.emit("joinRoom", userId));
    socket.on("orderStatusUpdated", (data) => {
      if (data.orderId === orderId) {
        setOrder((prev) => prev ? { ...prev, status: data.newStatus } : prev);
      }
    });
    return () => socket.disconnect();
  }, [token, url, orderId]);

  if (loading) return (
    <div className="track-loading">
      <div className="track-spinner" />
      <p>Loading order details...</p>
    </div>
  );
  if (!order) return <div className="track-loading">Order not found.</div>;

  const currentStep = getStepIndex(order.status);

  return (
    <div className="track-page">
      <button className="track-back" onClick={() => navigate("/myorders")}>
        ← Back to Orders
      </button>

      <div className="track-layout">

        {/* ── LEFT COLUMN ─────────────────────── */}
        <div className="track-left">

          {/* Header */}
          <div className="track-card">
            <div className="track-header">
              <div>
                <h2>Order #{order._id.toString().slice(-6).toUpperCase()}</h2>
                <p className="track-date">
                  Placed on {new Date(order.date).toLocaleDateString("en-IN", {
                    day: "numeric", month: "long", year: "numeric"
                  })}
                </p>
              </div>
              <div className="track-amount">
                <p>Total</p>
                <strong>₹{order.amount}</strong>
              </div>
            </div>

            {/* Timeline */}
            <div className="track-timeline">
              {STEPS.map((step, i) => (
                <div key={step.key}
                  className={`track-step ${i <= currentStep ? "done" : ""} ${i === currentStep ? "current" : ""}`}>
                  <div className="track-step-left">
                    <div className="track-icon">{step.icon}</div>
                    {i < STEPS.length - 1 && (
                      <div className={`track-line ${i < currentStep ? "filled" : ""}`} />
                    )}
                  </div>
                  <div className="track-step-content">
                    <p className="track-step-label">{step.key}</p>
                    <p className="track-step-desc">{step.desc}</p>
                    {i === currentStep && order.status !== "Delivered" && (
                      <span className="track-live-badge">● Live</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Items */}
          <div className="track-card track-items-card">
            <h3>Items Ordered</h3>
            {order.items.map((item, i) => (
              <div key={i} className="track-item-row">
                <span>{item.name}</span>
                <span>x {item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div className="track-item-row muted">
              <span>Delivery Fee</span><span></span><span>₹99</span>
            </div>
            <hr className="track-divider" />
            <div className="track-item-row bold">
              <strong>Total</strong><span></span><strong>₹{order.amount}</strong>
            </div>
          </div>

          {/* Address */}
          <div className="track-card track-address-card">
            <h3>📍 Delivery Address</h3>
            <p className="track-addr-name">{order.address.firstName} {order.address.lastName}</p>
            <p>{order.address.street}, {order.address.city}</p>
            <p>{order.address.state} — {order.address.pincode}</p>
            <p>📞 {order.address.phone}</p>
          </div>

        </div>

        {/* ── RIGHT COLUMN — MAP ───────────────── */}
        <div className="track-right">
          <div className="track-card track-map-card">
            <div className="track-map-header">
              <h3>🗺️ Live Tracking</h3>
              {order.status === "Out for Delivery" && (
                <span className="track-map-live">● Live</span>
              )}
            </div>
            <LiveMap status={order.status} address={order.address} />
            <div className="track-map-legend">
              <span>🍔 Kitchen</span>
              <span>🛵 Rider</span>
              <span>📍 Your Location</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Track;