import React, { useState, useEffect } from "react";
import "./Header.css";
import { useNavigate } from "react-router-dom";

const slides = [
  {
    title: "Order your favourite food here",
    subtitle: "Fresh ingredients, delivered fast to your door.",
    cta: "Explore Menu",
    link: "/menu",
    tag: "🔥 Most Ordered Today",
    accent: "#ff6b35",
    image: "/header_img.png",
  },
  {
    title: "Up to 30% off on first order",
    subtitle: "Use code WELCOME30 at checkout.",
    cta: "Order Now",
    link: "/menu",
    tag: "🎉 Limited Time Offer",
    accent: "#f0a500",
    image: "/banner2.jpg",
  },
  {
    title: "Fresh Salads & Healthy Bites",
    subtitle: "Eat well, feel great. Every single day.",
    cta: "View Salads",
    link: "/menu",
    tag: "🥗 New Category",
    accent: "#52b788",
    image: "/banner4.jpg",
  },
];

const Header = () => {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
        setAnimating(false);
      }, 400);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const goTo = (index) => {
    setAnimating(true);
    setTimeout(() => { setCurrent(index); setAnimating(false); }, 300);
  };

  const slide = slides[current];

  return (
    <div className="header">
      {slides.map((s, i) => (
        <div
          key={i}
          className={`header-bg-slide ${i === current ? "active" : ""}`}
          style={{ backgroundImage: `url(${s.image})` }}
        />
      ))}

      <div className="header-overlay" />

      <div className={`header-contents ${animating ? "fade-out" : "fade-in"}`}>
        <span
          className="header-tag"
          style={{ background: slide.accent + "33", color: slide.accent, border: `1px solid ${slide.accent}66` }}>
          {slide.tag}
        </span>
        <h2>{slide.title}</h2>
        <p>{slide.subtitle}</p>
        <button
          className="header-cta"
          style={{ background: slide.accent }}
          onClick={() => navigate(slide.link)}>
          {slide.cta} →
        </button>
      </div>

      <div className="header-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`dot-btn ${i === current ? "active" : ""}`}
            style={{ background: i === current ? slide.accent : "#ffffff66" }}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  );
};

export default Header;