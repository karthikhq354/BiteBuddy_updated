import React, { useState } from "react";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import { Route, Routes, Navigate } from "react-router-dom";
import Add from "./pages/Add/Add";
import List from "./pages/List/List";
import Orders from "./pages/Orders/Orders";
import Edit from "./pages/Edit/Edit";
import Categories from "./pages/Categories/Categories";
import Dashboard from "./pages/Dashboard/Dashboard";
import Customers from "./pages/Customers/Customers";
import PromoManager from "./pages/PromoManager/PromoManager";
import Login from "./pages/Login/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const url = import.meta.env.VITE_SERVER_URL || "http://localhost:4000";
  const [token, setToken] = useState(localStorage.getItem("adminToken") || "");

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setToken("");
  };

  if (!token) return <Login onLogin={(t) => setToken(t)} />;

  return (
    <>
      <ToastContainer />
      <Navbar onLogout={handleLogout} />
      <hr />
      <div className="app-content">
        <Sidebar />
        <Routes>
          <Route path="/"           element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard"  element={<Dashboard url={url} />} />
          <Route path="/add"        element={<Add url={url} />} />
          <Route path="/list"       element={<List url={url} />} />
          <Route path="/orders"     element={<Orders url={url} />} />
          <Route path="/edit"       element={<Edit url={url} />} />
          <Route path="/categories" element={<Categories url={url} />} />
          <Route path="/customers"  element={<Customers url={url} />} />
          <Route path="/promos"     element={<PromoManager url={url} />} />
        </Routes>
      </div>
    </>
  );
};

export default App;