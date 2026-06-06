import React, { useContext, useState, useRef, useEffect } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";

const Navbar = ({ setShowLogin, darkMode, setDarkMode, openCart }) => {
  const [menu, setMenu] = useState("home");
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const { getTotalCartAmount, token, setToken, buttonRef } =
    useContext(StoreContext);

  const navigate = useNavigate();
  const profileRef = useRef();

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    navigate("/");
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="navbar">
      {/* Logo */}
      <Link to="/">
        <img className="logo" src={assets.logo} alt="BiteBuddy" />
      </Link>

      {/* ✅ Menu (back to original position) */}
      <ul className="navbar-menu">
        <Link to="/" onClick={() => setMenu("home")} className={menu === "home" ? "active" : ""}>Home</Link>
        <Link to="/menu" onClick={() => setMenu("menu")} className={menu === "menu" ? "active" : ""}>Menu</Link>
        <Link to="/about" onClick={() => setMenu("about")} className={menu === "about" ? "active" : ""}>About Us</Link>
        <Link to="/contact" onClick={() => setMenu("contact")} className={menu === "contact" ? "active" : ""}>Contact Us</Link>
      </ul>

      {/* Hamburger */}
      <div className="hamburger" onClick={() => setMobileMenu(!mobileMenu)}>
        ☰
      </div>

      {/* Right Section */}
      <div className={`navbar-right ${mobileMenu ? "active" : ""}`}>
        {/* Search */}
        <Link to="/search">
          <img src={assets.search_icon} alt="search" />
        </Link>

        {/* Cart */}
        <div className="navbar-search-icon" onClick={openCart}>
          <img src={assets.basket_icon} alt="cart" />
          <div className={getTotalCartAmount() === 0 ? "" : "dot"}></div>
        </div>

        {/* Dark Mode */}
        <button className="dark-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "☀️" : "🌙"}
        </button>

        {/* Auth Section */}
        {!token ? (
          <button ref={buttonRef} onClick={() => setShowLogin(true)}>
            Sign In
          </button>
        ) : (
          <div
            className="navbar-profile"
            ref={profileRef}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <img src={assets.profile_icon} alt="" />

            {/* Dropdown */}
            <ul className={`nav-profile-dropdown ${showDropdown ? "show" : ""}`}>
              <li onClick={() => navigate("/profile")}>
                <img src={assets.profile_icon} alt="" /><p>Profile</p>
              </li>
              <hr />
              <li onClick={() => navigate("/myorders")}>
                <img src={assets.bag_icon} alt="" /><p>Orders</p>
              </li>
              <hr />
              <li onClick={() => navigate("/nutrition")}>
                <p>🥗 Nutrition Mode</p>
              </li>
              <hr />
              <li onClick={() => navigate("/group-order")}>
                <p>👥 Group Order</p>
              </li>
              <hr />
              <li onClick={logout}>
                <img src={assets.logout_icon} alt="" /><p>Logout</p>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;