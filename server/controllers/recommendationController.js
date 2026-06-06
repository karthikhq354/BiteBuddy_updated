import {
  getRecommendations,
  trackOrderInteractions,
} from "../algorithms/recommendationEngine.js";

// ── GET RECOMMENDATIONS ────────────────────────────────────
// Route: GET /api/recommendations
// Auth:  required (authMiddleware injects req.body.userId)
//
// Returns up to 8 personalised food items for the logged-in user.
// If the user has no order history, falls back to globally popular items.
//
// Response:
//   { success: true, data: [...foodDocuments], isPersonalised: boolean }
const getRecommendationsHandler = async (req, res) => {
  try {
    const userId = req.body.userId; // injected by authMiddleware
    const limit  = parseInt(req.query.limit) || 8;

    // Clamp limit to a safe range so clients can't request thousands of items
    const safeLimit = Math.min(Math.max(limit, 1), 20);

    const recommendations = await getRecommendations(userId, safeLimit);

    // Tell the client whether results are personalised or cold-start
    // so the frontend can show "Recommended for you" vs "Popular items"
    const isPersonalised = recommendations.length > 0;

    res.json({
      success: true,
      isPersonalised,
      count: recommendations.length,
      data: recommendations,
    });
  } catch (error) {
    console.error("Recommendation error:", error);
    res.json({ success: false, message: "Could not fetch recommendations" });
  }
};


// ── TRACK INTERACTION (internal helper exposed as route) ───
// Route: POST /api/recommendations/track
// Auth:  required
// Body:  { items: [{ _id, name, category, quantity }] }
//
// In production this is called automatically from placeOrder,
// but this route is also exposed for manual testing or future use
// (e.g. tracking "add to cart" events separately).
const trackInteractionHandler = async (req, res) => {
  try {
    const userId = req.body.userId;
    const items  = req.body.items;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.json({ success: false, message: "No items provided" });
    }

    await trackOrderInteractions(userId, items);
    res.json({ success: true, message: "Interaction tracked" });
  } catch (error) {
    console.error("Track interaction error:", error);
    res.json({ success: false, message: "Could not track interaction" });
  }
};


export { getRecommendationsHandler, trackInteractionHandler };