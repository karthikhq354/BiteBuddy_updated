import express from "express";
import {
  validatePromo, createPromo, listPromos,
  togglePromo, deletePromo,
} from "../controllers/promoController.js";
import promoModel from "../models/promoModel.js";

const promoRouter = express.Router();

promoRouter.post("/validate", validatePromo);
promoRouter.post("/add",      createPromo);
promoRouter.post("/create",   createPromo);
promoRouter.get("/list",      listPromos);
promoRouter.post("/toggle",   togglePromo);
promoRouter.post("/delete",   deletePromo);

promoRouter.put("/update/:id", async (req, res) => {
  try {
    const updated = await promoModel.findByIdAndUpdate(
      req.params.id, req.body, { new: true }
    );
    res.json({ success: true, data: updated });
  } catch (e) {
    res.json({ success: false, message: "Error updating promo" });
  }
});

promoRouter.delete("/delete/:id", async (req, res) => {
  try {
    await promoModel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (e) {
    res.json({ success: false, message: "Error" });
  }
});

export default promoRouter;