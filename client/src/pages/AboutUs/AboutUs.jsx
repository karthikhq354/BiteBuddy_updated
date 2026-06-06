import React, { useEffect, useRef } from "react";
import "./AboutUs.css";
import { useNavigate } from "react-router-dom";

const stats = [
  { value: "50K+", label: "Happy Customers" },
  { value: "200+", label: "Menu Items" },
  { value: "30min", label: "Avg Delivery" },
  { value: "4.9★", label: "App Rating" },
];

const values = [
  { icon: "🌿", title: "Fresh Always", desc: "Every ingredient is sourced fresh daily from local farms and trusted suppliers. No frozen shortcuts — ever." },
  { icon: "⚡", title: "Lightning Fast", desc: "Our delivery network is built for speed. Most orders reach you in under 30 minutes, hot and intact." },
  { icon: "❤️", title: "Made with Love", desc: "Our chefs treat every order like it's going to family. Quality and care go into every single dish we prepare." },
  { icon: "🔒", title: "Safe & Hygienic", desc: "FSSAI certified kitchen with daily deep cleaning, temperature-controlled packaging, and gloves-only handling." },
];

const team = [
  { name: "Arjun Mehta", role: "Founder & Head Chef", emoji: "👨‍🍳", since: "Since 2018" },
  { name: "Priya Sharma", role: "Operations Director", emoji: "👩‍💼", since: "Since 2019" },
  { name: "Rohan Das", role: "Head of Delivery", emoji: "🛵", since: "Since 2020" },
  { name: "Sneha Iyer", role: "Customer Experience", emoji: "🌟", since: "Since 2021" },
];

const timeline = [
  { year: "2018", event: "BiteBuddy started as a small cloud kitchen in Chennai with just 5 menu items." },
  { year: "2019", event: "Expanded to 50+ items and launched our first delivery partnership." },
  { year: "2021", event: "Hit 10,000 orders milestone. Opened our second kitchen location." },
  { year: "2023", event: "Launched the BiteBuddy app. Reached 50,000 happy customers across the city." },
  { year: "2024", event: "Introduced real-time order tracking and saved address features." },
];

const AboutUs = () => {
  const navigate = useNavigate();
  const sectionsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.15 }
    );

    sectionsRef.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const addRef = (el) => {
    if (el && !sectionsRef.current.includes(el)) sectionsRef.current.push(el);
  };

  return (
    <div className="about-page">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="about-hero">
        <div className="about-hero-text">
          <span className="about-hero-tag">🍅 Our Story</span>
          <h1>Food made with <span className="about-accent">passion</span>,<br />delivered with <span className="about-accent">pride</span></h1>
          <p>We started BiteBuddy because we believed great food shouldn't be complicated to get. Today we serve thousands of happy customers every day — and we're just getting started.</p>
          <button className="about-cta" onClick={() => navigate("/menu")}>Explore Our Menu →</button>
        </div>
        <div className="about-hero-visual">
          <div className="about-hero-img-wrap">
            <img src="https://media.istockphoto.com/id/1158191245/photo/chef-serving-food.webp?a=1&b=1&s=612x612&w=0&k=20&c=GXaA3xbCc46Ro7-njxfcNsaySPxIexVc-WtwBKAFxuw=" alt="Our kitchen" />
            <div className="about-hero-badge">
              <span>🏆</span>
              <p>Best Cloud Kitchen<br /><b>Chennai 2023</b></p>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────── */}
      <section className="about-stats" ref={addRef}>
        {stats.map((s, i) => (
          <div className="stat-card" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
            <h2>{s.value}</h2>
            <p>{s.label}</p>
          </div>
        ))}
      </section>

      {/* ── VALUES ───────────────────────────────────────────── */}
      <section className="about-section" ref={addRef}>
        <div className="about-section-label">What We Stand For</div>
        <h2 className="about-section-title">Our Core Values</h2>
        <div className="values-grid">
          {values.map((v, i) => (
            <div className="value-card" key={i} style={{ animationDelay: `${i * 0.12}s` }}>
              <div className="value-icon">{v.icon}</div>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── STORY TIMELINE ───────────────────────────────────── */}
      <section className="about-section about-timeline-section" ref={addRef}>
        <div className="about-section-label">How We Got Here</div>
        <h2 className="about-section-title">Our Journey</h2>
        <div className="timeline">
          {timeline.map((t, i) => (
            <div key={i} className={`timeline-item ${i % 2 === 0 ? "left" : "right"}`} style={{ animationDelay: `${i * 0.15}s` }}>
              <div className="timeline-year">{t.year}</div>
              <div className="timeline-dot" />
              <div className="timeline-content">
                <p>{t.event}</p>
              </div>
            </div>
          ))}
          <div className="timeline-axis" />
        </div>
      </section>

      {/* ── TEAM ─────────────────────────────────────────────── */}
      <section className="about-section" ref={addRef}>
        <div className="about-section-label">The People</div>
        <h2 className="about-section-title">Meet the Team</h2>
        <div className="team-grid">
          {team.map((m, i) => (
            <div className="team-card" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="team-avatar">{m.emoji}</div>
              <h3>{m.name}</h3>
              <p className="team-role">{m.role}</p>
              <span className="team-since">{m.since}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────── */}
      <section className="about-cta-banner" ref={addRef}>
        <div className="about-cta-content">
          <h2>Hungry already?</h2>
          <p>Browse our full menu and get fresh food delivered to your door.</p>
          <button onClick={() => navigate("/menu")}>Order Now →</button>
        </div>
      </section>

    </div>
  );
};

export default AboutUs;