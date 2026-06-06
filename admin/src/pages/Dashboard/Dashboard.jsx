import React, { useState, useEffect } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import "./Dashboard.css";

const COLORS = ["#ff6347","#ffa500","#4caf50","#2196f3","#9c27b0"];

const Dashboard = ({ url }) => {
  const [stats,       setStats]       = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [topFoods,    setTopFoods]    = useState([]);
  const [catData,     setCatData]     = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    axios.get(`${url}/api/admin/dashboard`).then(({ data }) => {
      if (data.success) {
        setStats(data.stats); setRevenueData(data.revenueData);
        setTopFoods(data.topFoods); setCatData(data.categoryData);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="dash-loading"><div className="dash-spinner"/><p>Loading...</p></div>;

  return (
    <div className="dashboard">
      <h1 className="dash-title">📊 Dashboard</h1>
      <div className="dash-cards">
        {[
          { icon:"📦", label:"Total Orders",     value: stats?.totalOrders,                  color:"red"    },
          { icon:"💰", label:"Total Revenue",    value:`₹${stats?.totalRevenue?.toLocaleString()}`, color:"orange" },
          { icon:"👥", label:"Total Customers",  value: stats?.totalCustomers,               color:"green"  },
          { icon:"🍔", label:"Menu Items",       value: stats?.totalFoods,                   color:"blue"   },
          { icon:"⏳", label:"Pending Orders",   value: stats?.pendingOrders,                color:"purple" },
          { icon:"✅", label:"Today's Orders",   value: stats?.todayOrders,                  color:"teal"   },
        ].map((c, i) => (
          <div key={i} className={`dash-card ${c.color}`}>
            <div className="dash-card-icon">{c.icon}</div>
            <div><p className="dash-card-label">{c.label}</p><h2>{c.value || 0}</h2></div>
          </div>
        ))}
      </div>

      <div className="dash-charts">
        <div className="dash-chart-card wide">
          <h3>Revenue Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="day" tick={{ fontSize:12 }}/>
              <YAxis tick={{ fontSize:12 }}/>
              <Tooltip formatter={(v) => [`₹${v}`, "Revenue"]}/>
              <Line type="monotone" dataKey="revenue" stroke="tomato" strokeWidth={3} dot={{ fill:"tomato", r:5 }}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="dash-chart-card">
          <h3>Orders by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={catData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
              </Pie>
              <Tooltip/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="dash-bottom">
        <div className="dash-table-card">
          <h3>🔥 Top Selling Items</h3>
          <table className="dash-table">
            <thead><tr><th>#</th><th>Item</th><th>Category</th><th>Orders</th><th>Revenue</th></tr></thead>
            <tbody>
              {topFoods.map((f, i) => (
                <tr key={i}>
                  <td><span className="dash-rank">{i+1}</span></td>
                  <td className="dash-food-name">{f.name}</td>
                  <td><span className="dash-cat-tag">{f.category}</span></td>
                  <td><strong>{f.totalOrders}</strong></td>
                  <td className="dash-revenue">₹{f.totalRevenue?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="dash-table-card">
          <h3>📋 Order Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats?.statusBreakdown || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="status" tick={{ fontSize:11 }}/>
              <YAxis tick={{ fontSize:11 }}/>
              <Tooltip/>
              <Bar dataKey="count" fill="tomato" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;