import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  getRecommendationsHandler,
  trackInteractionHandler,
} from "../controllers/recommendationController.js";

const recommendationRouter = express.Router();

// GET /api/recommendations
// Returns personalised food suggestions for the logged-in user.
// Optional query param: ?limit=8
recommendationRouter.get("/", authMiddleware, getRecommendationsHandler);

// POST /api/recommendations/track
// Manually record an interaction (also called automatically on order placement)
recommendationRouter.post("/track", authMiddleware, trackInteractionHandler);

export default recommendationRouter;