import React, { useState } from "react";
import axios from "axios";
import "./VoiceSearch.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

const VoiceSearch = ({ onResults }) => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setError("Voice search not supported in this browser. Try Chrome."); return; }
    const recognition = new SR();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.onstart  = () => { setListening(true); setError(""); };
    recognition.onend    = () => setListening(false);
    recognition.onerror  = () => { setListening(false); setError("Could not hear you. Try again."); };
    recognition.onresult = async (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      const { data } = await axios.get(`${API}/api/features/search-food`, { params: { query: text } });
      if (data.success) onResults(data.data, text);
    };
    recognition.start();
  };

  return (
    <div className="voice-search">
      <button className={`voice-btn ${listening ? "listening" : ""}`} onClick={startListening} disabled={listening}>
        <span className="voice-icon">{listening ? "🎙️" : "🎤"}</span>
        {listening ? "Listening..." : "Search by Voice"}
      </button>
      {transcript && <p className="voice-transcript">You said: <b>"{transcript}"</b></p>}
      {error && <p className="voice-error">{error}</p>}
    </div>
  );
};

export default VoiceSearch;
