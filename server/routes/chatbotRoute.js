import express from "express";
import chatbotController from "../controllers/chatbotController.js";

const chatbotRouter = express.Router();

// POST /api/chatbot
// Body: { message: string, history: [{role, content}] }
chatbotRouter.post("/", chatbotController);

export default chatbotRouter;