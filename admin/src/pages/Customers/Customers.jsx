import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./Customers.css";

const Customers = ({ url }) => {
  const [customers, setCustomers] = useState([]);
  const [search,    setSearch]    = useState("");
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    axios.get(`${url}/api/admin/customers`).then(({ data }) => {
      if (data.success) setCustomers(data.data);
      setLoading(false);
    });
  }, []);

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="customers-page">
      <div className="cust-header">
        <h1>👥 Customers</h1>
        <div className="cust-search">
          <span>🔍</span>
          <input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)}/>
        </div>
      </div>
      <div className="cust-stats">
        <div className="cust-stat"><h3>{customers.length}</h3><p>Total Customers</p></div>
        <div className="cust-stat"><h3>{customers.filter(c=>c.totalOrders>0).length}</h3><p>Active Buyers</p></div>
        <div className="cust-stat"><h3>₹{customers.reduce((s,c)=>s+(c.totalSpent||0),0).toLocaleString()}</h3><p>Total Revenue</p></div>
        <div className="cust-stat"><h3>{customers.filter(c=>c.totalOrders>=5).length}</h3><p>Loyal Customers</p></div>
      </div>
      {loading ? <p style={{padding:40,textAlign:"center"}}>Loading...</p> : (
        <div className="cust-table-wrap">
          <table className="cust-table">
            <thead><tr><th>Customer</th><th>Email</th><th>Orders</th><th>Spent</th><th>Last Order</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c._id}>
                  <td className="cust-name-cell">
                    <div className="cust-avatar">{c.name[0].toUpperCase()}</div><span>{c.name}</span>
                  </td>
                  <td className="cust-email">{c.email}</td>
                  <td><strong>{c.totalOrders}</strong></td>
                  <td className="cust-spent">₹{(c.totalSpent||0).toLocaleString()}</td>
                  <td className="cust-date">{c.lastOrder ? new Date(c.lastOrder).toLocaleDateString("en-IN") : "—"}</td>
                  <td>
                    <span className={`cust-badge ${c.totalOrders>=5?"loyal":c.totalOrders>0?"active":"new"}`}>
                      {c.totalOrders>=5?"⭐ Loyal":c.totalOrders>0?"✅ Active":"🆕 New"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length===0 && <p className="cust-empty">No customers found.</p>}
        </div>
      )}
    </div>
  );
};

export default Customers;