import React, { useState, useContext } from "react";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";
import "./GroupOrder.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

const GroupOrder = () => {
  const { token } = useContext(StoreContext);
  const [mode, setMode]         = useState(null);
  const [groupCode, setGroupCode] = useState("");
  const [joinCode, setJoinCode]  = useState("");
  const [group, setGroup]        = useState(null);
  const [split, setSplit]        = useState(null);
  const [loading, setLoading]    = useState(false);
  const [msg, setMsg]            = useState("");

  const headers = { headers: { token } };

  const createGroup = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/api/features/group/create`, {}, headers);
      if (data.success) { setGroupCode(data.groupCode); setMode("created"); }
    } catch (e) { setMsg("Error creating group"); }
    setLoading(false);
  };

  const joinGroup = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/api/features/group/join`, { groupCode: joinCode }, headers);
      if (data.success) { setGroup(data.group); setMode("joined"); }
      else setMsg(data.message);
    } catch (e) { setMsg("Error joining group"); }
    setLoading(false);
  };

  const fetchSplit = async () => {
    setLoading(true);
    try {
      const code = group?.groupCode || groupCode;
      const { data } = await axios.post(`${API}/api/features/group/split`, { groupCode: code, deliveryFee: 49 });
      if (data.success) setSplit(data);
    } catch (e) { setMsg("Error calculating split"); }
    setLoading(false);
  };

  return (
    <div className="group-order">
      <h2>🍽️ Group Order</h2>
      <p>Order together, split the bill automatically</p>
      {!mode && (
        <div className="group-actions">
          <button className="group-btn primary" onClick={createGroup} disabled={loading}>➕ Create Group</button>
          <button className="group-btn outline" onClick={() => setMode("joining")}>🔗 Join Group</button>
        </div>
      )}
      {mode === "joining" && (
        <div className="group-join-form">
          <input placeholder="Enter 6-digit group code" value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())} maxLength={6} />
          <button className="group-btn primary" onClick={joinGroup} disabled={loading}>Join</button>
        </div>
      )}
      {mode === "created" && (
        <div className="group-code-display">
          <p>Share this code with your friends:</p>
          <div className="group-code">{groupCode}</div>
          <p className="group-hint">They can join using this code</p>
          <button className="group-btn primary" style={{marginTop:12}} onClick={fetchSplit}>💳 Calculate Split</button>
        </div>
      )}
      {mode === "joined" && group && (
        <div className="group-members">
          <h3>👥 Participants ({group.participants.length})</h3>
          {group.participants.map((p, i) => (
            <div key={i} className="group-member">
              <span>{p.name}</span><span>₹{p.subtotal}</span><span>{p.items.length} items</span>
            </div>
          ))}
          <button className="group-btn primary" onClick={fetchSplit} disabled={loading}>💳 Calculate Split</button>
        </div>
      )}
      {split && (
        <div className="group-split">
          <h3>💰 Bill Split — Total: ₹{split.totalAmount}</h3>
          {split.split.map((s, i) => (
            <div key={i} className="split-row">
              <span>{s.name}</span><span>Items ₹{s.itemsSubtotal}</span>
              <span>Delivery ₹{s.deliveryShare}</span><strong>Total ₹{s.totalDue}</strong>
            </div>
          ))}
        </div>
      )}
      {msg && <p className="group-msg">{msg}</p>}
    </div>
  );
};

export default GroupOrder;
