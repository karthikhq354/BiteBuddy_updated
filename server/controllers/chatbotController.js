import fetch from "node-fetch";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// ✅ FIXED MODEL (IMPORTANT)
const GROQ_MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are BiteBuddy AI — a friendly and helpful food delivery assistant for BiteBuddy app.

You help users with:
- Food recommendations based on mood, diet, or preference
- Nutrition advice (calories, protein, vegan, etc.)
- Order tracking and support queries
- App features (Mood Food, Nutrition Mode, Voice Search, Group Order, Promo codes)
- General food-related questions

Rules:
- Keep responses short, friendly, and helpful (2-4 sentences max)
- Use emojis occasionally 🍕
- If asked about order status, guide user to "My Orders"
- Never make up order details or personal data`;

const chatbotController = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "Groq API key not configured",
      });
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(-10),
      { role: "user", content: message.trim() },
    ];

    // ✅ Debug log (very useful)
    console.log("Using model:", GROQ_MODEL);

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq API error:", err);

      return res.status(500).json({
        success: false,
        message: "AI service temporarily unavailable",
      });
    }

    const data = await response.json();

    const reply =
      data?.choices?.[0]?.message?.content?.trim() ||
      "Sorry, I couldn't understand that.";

    return res.json({
      success: true,
      reply,
    });

  } catch (error) {
    console.error("Chatbot error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

export default chatbotController;