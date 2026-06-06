import React, { useState, useRef, useEffect } from "react";
import "./Chatbot.css";
import axios from "axios";

const API = import.meta.env.VITE_SERVER_URL || "http://localhost:4000";

const QUICK_SUGGESTIONS = [
  { label: "🍕 Recommend food",   message: "Can you recommend some popular food items?" },
  { label: "🥗 Healthy meals",    message: "What healthy meals do you have?" },
  { label: "📦 Track my order",   message: "How do I track my order?" },
  { label: "🎭 Mood food",        message: "What is the Mood Food feature?" },
  { label: "💪 High protein",     message: "Suggest high protein meals for muscle building" },
  { label: "🎟️ Promo codes",      message: "Do you have any promo codes or discounts?" },
];

const BOT_INTRO = {
  role: "bot",
  text: "👋 Hi! I'm **BiteBuddy AI** — your personal food assistant!\n\nI can help you with food recommendations, order queries, nutrition advice, and anything about the app. What can I help you with today?",
  time: new Date(),
};

const formatText = (text) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br/>");
};

const Chatbot = () => {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState([BOT_INTRO]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showSugg, setShowSugg] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    setInput("");
    setShowSugg(false);

    // Add user message
    const userMsg = { role: "user", text: msg, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Build history for context (exclude intro bot message)
      const history = messages
        .filter((m) => m !== BOT_INTRO)
        .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));

      const { data } = await axios.post(`${API}/api/chatbot`, { message: msg, history });

      const botMsg = {
        role: "bot",
        text: data.success ? data.reply : "Sorry, I couldn't process that. Please try again! 😅",
        time: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      setMessages((prev) => [...prev, {
        role: "bot",
        text: "Oops! I'm having trouble connecting. Please check your connection and try again 🔌",
        time: new Date(),
      }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => {
    setMessages([BOT_INTRO]);
    setShowSugg(true);
  };

  const formatTime = (date) =>
    date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      {/* ── FLOATING BUTTON ─────────────────── */}
      <button
        className={`chatbot-fab ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
        aria-label="Open chat"
      >
        {open ? (
          <span className="chatbot-fab-icon">✕</span>
        ) : (
          <>
            <span className="chatbot-fab-icon">🤖</span>
            <span className="chatbot-fab-pulse" />
          </>
        )}
      </button>

      {/* ── CHAT WINDOW ─────────────────────── */}
      <div className={`chatbot-window ${open ? "visible" : ""}`}>

        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-left">
            <div className="chatbot-avatar">🤖</div>
            <div>
              <h3>BiteBuddy AI</h3>
              <span className="chatbot-status">
                <span className="chatbot-online-dot" /> Online
              </span>
            </div>
          </div>
          <div className="chatbot-header-actions">
            <button onClick={clearChat} title="Clear chat" className="chatbot-clear-btn">🗑️</button>
            <button onClick={() => setOpen(false)} className="chatbot-close-btn">✕</button>
          </div>
        </div>

        {/* Messages */}
        <div className="chatbot-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chatbot-msg-wrap ${msg.role}`}>
              {msg.role === "bot" && (
                <div className="chatbot-bot-avatar">🤖</div>
              )}
              <div className="chatbot-bubble-wrap">
                <div
                  className={`chatbot-bubble ${msg.role}`}
                  dangerouslySetInnerHTML={{ __html: formatText(msg.text) }}
                />
                <span className="chatbot-time">{formatTime(msg.time)}</span>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="chatbot-msg-wrap bot">
              <div className="chatbot-bot-avatar">🤖</div>
              <div className="chatbot-typing">
                <span /><span /><span />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        {showSugg && (
          <div className="chatbot-suggestions">
            {QUICK_SUGGESTIONS.map((s) => (
              <button key={s.label} className="chatbot-suggestion-btn"
                onClick={() => sendMessage(s.message)}>
                {s.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="chatbot-input-row">
          <textarea
            ref={inputRef}
            className="chatbot-input"
            placeholder="Ask me anything about food..."
            value={input}
            rows={1}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            className="chatbot-send-btn"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            {loading ? "⏳" : "➤"}
          </button>
        </div>

      </div>
    </>
  );
};

export default Chatbot;