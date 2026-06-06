import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { ConnectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import "dotenv/config";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import promoRouter from "./routes/promoRoute.js";
import addressRouter from "./routes/addressRoute.js";
import featuresRouter from "./routes/featuresRoute.js";
import categoryRouter from "./routes/categoryRoute.js";
import adminRouter from "./routes/adminRoute.js";
import chatbotRouter from './routes/chatbotRoute.js';


const app = express();
const port = process.env.PORT || 4000;
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL || "http://localhost:5173", methods: ["GET", "POST"] },
});

export { io };
io.on("connection", (socket) => {
  socket.on("joinRoom", (userId) => socket.join(`user_${userId}`));
  socket.on("disconnect", () => {});
});

app.use(express.json());
app.use(cors());
ConnectDB();

app.use("/api/food",     foodRouter);
app.use("/images",       express.static("uploads"));
app.use("/api/user",     userRouter);
app.use("/api/cart",     cartRouter);
app.use("/api/order",    orderRouter);
app.use("/api/promo",    promoRouter);
app.use("/api/address",  addressRouter);
app.use("/api/features", featuresRouter);
app.use("/api/category", categoryRouter);
app.use("/api/admin",    adminRouter);
app.use('/api/chatbot', chatbotRouter);

app.get("/", (req, res) => res.send("API Working"));
httpServer.listen(port, () => console.log(`Server started on http://localhost:${port}`));