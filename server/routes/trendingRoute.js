import express from "express";
import { getTrending, getTopPicks } from "../controllers/trendingController.js";

const trendingRouter = express.Router();

// GET /api/trending?limit=4        — no auth needed
trendingRouter.get("/", getTrending);

// POST /api/trending/top-picks     — auth optional (userId from body if logged in)
trendingRouter.post("/top-picks", getTopPicks);

export default trendingRouter;