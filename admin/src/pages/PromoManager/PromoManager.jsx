import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./PromoManager.css";

const EMPTY = { code:"", discountType:"percent", discountValue:"", minOrder:"", maxUses:1, expiresAt:"" };

const PromoManager = ({ url }) => {
  const [promos,  setPromos]  = useState([]);
  const [form,    setForm]    = useState(EMPTY);
  const [editId,  setEditId]  = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchPromos(); }, []);

  const fetchPromos = async () => {
    const { data } = await axios.get(`${url}/api/promo/list`);
    if (data.success) setPromos(data.data);
  };

  const handleSubmit = async (e) => {
  e.preventDefault(); setLoading(true);
  try {
    const payload = {
      code:          form.code,
      discountType:  form.discountType === "percent" ? "percentage" : "flat",
      discountValue: Number(form.discountValue),
      minOrderAmount: Number(form.minOrder) || 0,
      maxUses:       Number(form.maxUses) || null,
      expiresAt:     form.expiresAt || null,
    };

    if (editId) {
      const { data } = await axios.put(`${url}/api/promo/update/${editId}`, payload);
      data.success ? toast.success("Updated!") : toast.error(data.message);
    } else {
      const { data } = await axios.post(`${url}/api/promo/add`, payload);
      data.success ? toast.success("Created!") : toast.error(data.message);
    }
    setForm(EMPTY); setEditId(null); fetchPromos();
  } catch { toast.error("Something went wrong"); }
  setLoading(false);
};

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this promo?")) return;
    const { data } = await axios.delete(`${url}/api/promo/delete/${id}`);
    data.success ? toast.success("Deleted") : toast.error(data.message);
    fetchPromos();
  };

  const handleEdit = (p) => {
    setEditId(p._id);
    setForm({ code:p.code, discountType:p.discountType, discountValue:p.discountValue,
      minOrder:p.minOrder, maxUses:p.maxUses, expiresAt:p.expiresAt?.slice(0,10)||"" });
    window.scrollTo({ top:0, behavior:"smooth" });
  };

  return (
    <div className="promo-page">
      <h1>🎟️ Promo Code Manager</h1>
      <div className="promo-form-card">
        <h2>{editId ? "✏️ Edit Promo" : "➕ Create Promo Code"}</h2>
        <form onSubmit={handleSubmit} className="promo-form">
          <div className="promo-row">
            <div className="promo-field"><label>Code *</label>
              <input required placeholder="e.g. SAVE20" value={form.code} onChange={(e)=>setForm({...form,code:e.target.value.toUpperCase()})}/></div>
            <div className="promo-field"><label>Type</label>
              <select value={form.discountType} onChange={(e)=>setForm({...form,discountType:e.target.value})}>
                <option value="percent">Percentage (%)</option><option value="flat">Flat (₹)</option></select></div>
            <div className="promo-field"><label>Value *</label>
              <input required type="number" placeholder="e.g. 20" value={form.discountValue} onChange={(e)=>setForm({...form,discountValue:e.target.value})}/></div>
          </div>
          <div className="promo-row">
            <div className="promo-field"><label>Min Order (₹)</label>
              <input type="number" placeholder="0 = no min" value={form.minOrder} onChange={(e)=>setForm({...form,minOrder:e.target.value})}/></div>
            <div className="promo-field"><label>Max Uses</label>
              <input type="number" value={form.maxUses} onChange={(e)=>setForm({...form,maxUses:e.target.value})}/></div>
            <div className="promo-field"><label>Expiry Date</label>
              <input type="date" value={form.expiresAt} onChange={(e)=>setForm({...form,expiresAt:e.target.value})}/></div>
          </div>
          <div className="promo-actions">
            <button type="submit" className="promo-btn-save" disabled={loading}>{loading?"Saving...":editId?"Update":"Create Promo"}</button>
            {editId && <button type="button" className="promo-btn-cancel" onClick={()=>{setForm(EMPTY);setEditId(null)}}>Cancel</button>}
          </div>
        </form>
      </div>
      <div className="promo-list-card">
        <h2>All Promo Codes</h2>
        <div className="promo-table-wrap">
          <table className="promo-table">
            <thead><tr><th>Code</th><th>Discount</th><th>Min Order</th><th>Uses</th><th>Expiry</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {promos.map((p) => {
                const expired = p.expiresAt && new Date(p.expiresAt) < new Date();
                const full    = p.maxUses && p.usedCount >= p.maxUses;
                return (
                  <tr key={p._id}>
                    <td><span className="promo-code-tag">{p.code}</span></td>
                    <td><strong>{p.discountValue}{p.discountType==="percentage"?"%":"₹"} off</strong></td>
                    <td>{p.minOrder>0?`₹${p.minOrder}`:"No min"}</td>
                    <td>{p.usedCount||0} / {p.maxUses}</td>
                    <td className={expired?"promo-expired-date":""}>{p.expiresAt?new Date(p.expiresAt).toLocaleDateString("en-IN"):"No expiry"}</td>
                    <td><span className={`promo-status ${expired||full?"inactive":"active"}`}>{expired?"Expired":full?"Used up":"Active"}</span></td>
                    <td className="promo-actions-cell">
                      <button className="promo-edit-btn" onClick={()=>handleEdit(p)}>✏️</button>
                      <button className="promo-del-btn" onClick={()=>handleDelete(p._id)}>🗑️</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {promos.length===0 && <p className="promo-empty">No promo codes yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default PromoManager;