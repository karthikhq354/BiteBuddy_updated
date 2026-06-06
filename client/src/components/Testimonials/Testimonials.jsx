import React, { useState, useEffect, useRef } from "react";
import "./Testimonials.css";

const TESTIMONIALS = [
  { name: "Arjun Mehta",    location: "Chennai",   rating: 5, avatar: "A", color: "#ff6b35", text: "BiteBuddy has completely changed how I order food. The delivery is always on time and the food arrives piping hot. Best food app in Chennai!" },
  { name: "Priya Sharma",   location: "Bangalore", rating: 5, avatar: "P", color: "#3b82f6", text: "I love the Mood Food feature! It actually recommends food based on how I'm feeling. Ordered the stress mood pack and it was exactly what I needed 😄" },
  { name: "Rohan Das",      location: "Mumbai",    rating: 4, avatar: "R", color: "#10b981", text: "The nutrition mode is a game changer. As someone who tracks macros, being able to filter by protein and calories is incredible. Highly recommend!" },
  { name: "Sneha Iyer",     location: "Chennai",   rating: 5, avatar: "S", color: "#a855f7", text: "Ordered for a group of 8 using the Group Order feature. The bill split worked perfectly. No more awkward money calculations!" },
  { name: "Karthik Rajan",  location: "Hyderabad", rating: 5, avatar: "K", color: "#f59e0b", text: "Voice search is so convenient! I just say 'biryani' and it finds everything. The food quality is consistently amazing every single time." },
  { name: "Divya Nair",     location: "Kochi",     rating: 4, avatar: "D", color: "#ec4899", text: "The closing deals section saved me so much money. Got 30% off on cakes that were closing soon. Fresh food at discount prices — brilliant idea!" },
];

const StarRating = ({ rating }) => (
  <div className="testi-stars">
    {[1,2,3,4,5].map((s) => (
      <span key={s} className={s <= rating ? "star filled" : "star"}>★</span>
    ))}
  </div>
);

const Testimonials = () => {
  const [current,   setCurrent]   = useState(0);
  const [paused,    setPaused]    = useState(false);
  const [animating, setAnimating] = useState(false);
  const intervalRef = useRef(null);

  const goTo = (index) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 300);
  };

  const next = () => goTo((current + 1) % TESTIMONIALS.length);
  const prev = () => goTo((current - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  useEffect(() => {
    if (!paused) {
      intervalRef.current = setInterval(next, 4000);
    }
    return () => clearInterval(intervalRef.current);
  }, [current, paused]);

  // Show 3 cards at once — center + sides
  const getVisible = () => {
    const len = TESTIMONIALS.length;
    return [
      TESTIMONIALS[(current - 1 + len) % len],
      TESTIMONIALS[current],
      TESTIMONIALS[(current + 1) % len],
    ];
  };

  const visible = getVisible();

  return (
    <section className="testimonials"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="testi-header">
        <span className="testi-label">💬 What our customers say</span>
        <h2>Loved by thousands across India</h2>
        <p>Real reviews from real BiteBuddy customers</p>
      </div>

      <div className="testi-carousel">

        {/* Prev button */}
        <button className="testi-arrow left" onClick={prev}>‹</button>

        {/* Cards */}
        <div className={`testi-cards ${animating ? "fade-out" : "fade-in"}`}>
          {visible.map((t, i) => (
            <div key={t.name}
              className={`testi-card ${i === 1 ? "center" : "side"}`}
              onClick={() => i === 0 ? prev() : i === 2 ? next() : null}
            >
              <StarRating rating={t.rating} />
              <p className="testi-text">"{t.text}"</p>
              <div className="testi-author">
                <div className="testi-avatar" style={{ background: t.color }}>
                  {t.avatar}
                </div>
                <div>
                  <p className="testi-name">{t.name}</p>
                  <p className="testi-location">📍 {t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Next button */}
        <button className="testi-arrow right" onClick={next}>›</button>

      </div>

      {/* Dots */}
      <div className="testi-dots">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            className={`testi-dot ${i === current ? "active" : ""}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

      {/* Stats bar */}
      <div className="testi-stats">
        <div className="testi-stat">
          <h3>50,000+</h3>
          <p>Happy Customers</p>
        </div>
        <div className="testi-stat-divider" />
        <div className="testi-stat">
          <h3>4.9 ★</h3>
          <p>Average Rating</p>
        </div>
        <div className="testi-stat-divider" />
        <div className="testi-stat">
          <h3>200+</h3>
          <p>Menu Items</p>
        </div>
        <div className="testi-stat-divider" />
        <div className="testi-stat">
          <h3>30 min</h3>
          <p>Avg Delivery</p>
        </div>
      </div>

    </section>
  );
};

export default Testimonials;