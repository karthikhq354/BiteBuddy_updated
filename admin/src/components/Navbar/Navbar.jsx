import React from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";

const Navbar = ({ onLogout }) => {
  return (
    <div className="navbar">
      <div className="navbar-left">
        <img className="logo" src={assets.logo} alt="BiteBuddy" />
        <span className="navbar-brand-tag">Admin Panel</span>
      </div>
      <div className="navbar-right">
        {onLogout && (
          <button className="admin-logout-btn" onClick={onLogout}>
            🚪 Logout
          </button>
        )}
        <div className="admin-avatar">A</div>
      </div>
    </div>
  );
};

export default Navbar;