import mongoose from "mongoose";

const promoSchema = new mongoose.Schema({
  code:          { type: String, required: true, unique: true, uppercase: true },
  discountType:  { type: String, enum: ["percent", "flat"], required: true },
  discountValue: { type: Number, required: true },
  minOrder:      { type: Number, default: 0 },
  maxUses:       { type: Number, default: 1 },
  usedCount:     { type: Number, default: 0 },
  usedBy:        [{ type: String }],
  targetUserId:  { type: String, default: null },
  trigger:       { type: String, default: "manual" },
  expiresAt:     { type: Date, required: true },
  active:        { type: Boolean, default: true },
}, { timestamps: true });

const promoAutoModel = mongoose.models.promoAuto || mongoose.model("promoAuto", promoSchema);
export default promoAutoModel;
