import React, { useState } from "react";
import "./ContactUs.css";

const faqs = [
  { q: "How long does delivery take?", a: "Most orders are delivered within 30 minutes. During peak hours it may take up to 45 minutes." },
  { q: "Can I change my order after placing it?", a: "Orders can be modified within 2 minutes of placing. After that the kitchen starts preparing your food." },
  { q: "What if my food arrives cold or wrong?", a: "We'll make it right immediately — either a free replacement or a full refund, no questions asked." },
  { q: "Do you offer vegetarian options?", a: "Yes! We have a dedicated Pure Veg section with 30+ items clearly marked on our menu." },
  { q: "How do promo codes work?", a: "Enter your promo code at checkout in the cart page. Valid codes are applied automatically to your total." },
];

const ContactUs = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const toggleFaq = (i) => setOpenFaq(openFaq === i ? null : i);

  return (
    <div className="contact-page">

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="contact-hero">
        <div className="contact-hero-inner">
          <span className="contact-hero-tag">💬 We're here for you</span>
          <h1>Get in <span className="contact-accent">Touch</span></h1>
          <p>Have a question, complaint, or just want to say hi? We read every message and respond within 24 hours.</p>
        </div>
        <div className="contact-hero-cards">
          <div className="contact-info-card">
            <div className="contact-info-icon">📞</div>
            <h3>Call Us</h3>
            <p>Mon–Sat, 9am–9pm</p>
            <a href="tel:+919170602005">+91 91706 02005</a>
          </div>
          <div className="contact-info-card highlight">
            <div className="contact-info-icon">📧</div>
            <h3>Email Us</h3>
            <p>We reply within 24 hours</p>
            <a href="mailto:contact@tomato.com">contact@bitebuddy.com</a>
          </div>
          <div className="contact-info-card">
            <div className="contact-info-icon">📍</div>
            <h3>Visit Us</h3>
            <p>Our cloud kitchen</p>
            <a href="#">Anna Nagar, Chennai</a>
          </div>
        </div>
      </section>

      {/* ── FORM + FAQ ────────────────────────────────── */}
      <section className="contact-main">

        {/* Form */}
        <div className="contact-form-wrap">
          <h2>Send us a message</h2>
          <p className="contact-form-sub">Fill in the form and we'll get back to you shortly.</p>

          {submitted ? (
            <div className="contact-success">
              <span>✅</span>
              <h3>Message sent!</h3>
              <p>Thanks for reaching out, <b>{form.name}</b>. We'll reply to <b>{form.email}</b> within 24 hours.</p>
              <button onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}>
                Send another
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="contact-form-row">
                <div className="contact-field">
                  <label>Your Name</label>
                  <input
                    required
                    name="name"
                    placeholder="Arjun Mehta"
                    value={form.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="contact-field">
                  <label>Email Address</label>
                  <input
                    required
                    type="email"
                    name="email"
                    placeholder="arjun@email.com"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="contact-field">
                <label>Subject</label>
                <select name="subject" value={form.subject} onChange={handleChange} required>
                  <option value="">Select a topic...</option>
                  <option value="Order Issue">Order Issue</option>
                  <option value="Wrong Item">Wrong Item Delivered</option>
                  <option value="Refund">Refund Request</option>
                  <option value="Feedback">Feedback / Suggestion</option>
                  <option value="Partnership">Business Partnership</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="contact-field">
                <label>Message</label>
                <textarea
                  required
                  name="message"
                  placeholder="Tell us what's on your mind..."
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                />
              </div>
              <button type="submit" className="contact-submit">
                Send Message →
              </button>
            </form>
          )}
        </div>

        {/* FAQ */}
        <div className="contact-faq">
          <h2>Frequently Asked</h2>
          <p className="contact-form-sub">Quick answers to common questions.</p>
          <div className="faq-list">
            {faqs.map((item, i) => (
              <div
                key={i}
                className={`faq-item ${openFaq === i ? "open" : ""}`}
                onClick={() => toggleFaq(i)}
              >
                <div className="faq-question">
                  <span>{item.q}</span>
                  <span className="faq-arrow">{openFaq === i ? "−" : "+"}</span>
                </div>
                {openFaq === i && (
                  <div className="faq-answer">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Hours */}
          <div className="contact-hours">
            <h3>⏰ Support Hours</h3>
            <div className="hours-row"><span>Monday – Friday</span><span>9:00 AM – 9:00 PM</span></div>
            <div className="hours-row"><span>Saturday</span><span>10:00 AM – 7:00 PM</span></div>
            <div className="hours-row muted"><span>Sunday</span><span>Closed</span></div>
          </div>
        </div>

      </section>
    </div>
  );
};

export default ContactUs;