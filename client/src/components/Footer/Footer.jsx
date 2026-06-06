import React, { useState } from "react";
import "./Footer.css";
import { assets } from "../../assets/assets";
import { Link } from "react-router-dom";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(""); }
  };

  return (
    <div id="footer" className="footer">
      <div className="footer-top">

        {/* Brand */}
        <div className="footer-brand">
          <img src={assets.logo} alt="Tomato" className="footer-logo" />
          <p className="footer-desc">
            Fresh food, delivered fast. We bring restaurant-quality meals straight to your door — made with love, every single order.
          </p>
          <div className="footer-socials">
            <a href="#" className="footer-social-btn" aria-label="Facebook">
              <img src={assets.facebook_icon} alt="Facebook" />
            </a>
            <a href="#" className="footer-social-btn" aria-label="Twitter">
              <img src={assets.twitter_icon} alt="Twitter" />
            </a>
            <a href="#" className="footer-social-btn" aria-label="LinkedIn">
              <img src={assets.linkedin_icon} alt="LinkedIn" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/menu">Menu</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>

        {/* Account */}
        <div className="footer-col">
          <h3>Account</h3>
          <ul>
            <li><Link to="/profile">My Profile</Link></li>
            <li><Link to="/myorders">My Orders</Link></li>
            <li><Link to="/cart">Cart</Link></li>
            <li><Link to="/order">Checkout</Link></li>
          </ul>
        </div>

        {/* Contact + Newsletter */}
        <div className="footer-col footer-col-wide">
          <h3>Get in Touch</h3>
          <ul className="footer-contact-list">
            <li><span>📞</span><a href="tel:+919170602005">+91 91706 02005</a></li>
            <li><span>📧</span><a href="mailto:contact@tomato.com">contact@bitebuddy.com</a></li>
            <li><span>📍</span><span>Anna Nagar, Chennai, TN</span></li>
            <li><span>⏰</span><span>Mon–Sat, 9am – 9pm</span></li>
          </ul>

          <div className="footer-newsletter">
            <p>Get offers straight to your inbox</p>
            {subscribed ? (
              <p className="footer-subscribed">✅ You're subscribed!</p>
            ) : (
              <form className="footer-newsletter-form" onSubmit={handleSubscribe}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit">Subscribe</button>
              </form>
            )}
          </div>
        </div>

      </div>

      <div className="footer-divider" />

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} BiteBuddy — All Rights Reserved.</p>
        <div className="footer-bottom-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Refund Policy</a>
        </div>
      </div>
    </div>
  );
};

export default Footer;