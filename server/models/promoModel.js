import mongoose from "mongoose";

// Each document = one promo code that admins create
const promoSchema = new mongoose.Schema({

  // The code users type in e.g. "WELCOME20"
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,   // always stored in uppercase so "welcome20" == "WELCOME20"
    trim: true,
  },

  // discountType: "percentage" → deducts X% of subtotal
  //               "flat"       → deducts a fixed ₹ amount
  discountType: {
    type: String,
    enum: ["percentage", "flat"],
    required: true,
  },

  // The actual discount value. e.g. 20 means 20% or ₹20 depending on discountType
  discountValue: {
    type: Number,
    required: true,
    min: 1,
  },

  // Minimum cart subtotal required to use this code
  minOrderAmount: {
    type: Number,
    default: 0,
  },

  // Maximum times this code can be used across ALL users (null = unlimited)
  maxUses: {
    type: Number,
    default: null,
  },

  // How many times this code has been used so far
  usedCount: {
    type: Number,
    default: 0,
  },

  // Whether the code is currently active
  isActive: {
    type: Boolean,
    default: true,
  },

  // Optional expiry date — null means never expires
  expiresAt: {
    type: Date,
    default: null,
  },
});

const promoModel =
  mongoose.models.promo || mongoose.model("promo", promoSchema);

export default promoModel;