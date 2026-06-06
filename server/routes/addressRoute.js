import express from "express";
import authMiddleware from "../middleware/auth.js";
import { getAddresses, addAddress, deleteAddress, setDefaultAddress } from "../controllers/addressController.js";

const addressRouter = express.Router();

addressRouter.post("/list",       authMiddleware, getAddresses);
addressRouter.post("/add",        authMiddleware, addAddress);
addressRouter.post("/delete",     authMiddleware, deleteAddress);
addressRouter.post("/setdefault", authMiddleware, setDefaultAddress);

export default addressRouter;