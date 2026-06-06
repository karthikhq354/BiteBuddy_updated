import express from "express";
import { getDashboard, getCustomers } from "../controllers/adminController.js";

const adminRouter = express.Router();
adminRouter.get("/dashboard", getDashboard);
adminRouter.get("/customers", getCustomers);

export default adminRouter;