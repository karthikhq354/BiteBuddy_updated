import mongoose from "mongoose";

// Stores aggregated interaction data per user per food item.
// This is the core data structure the recommendation algorithm reads from.
const interactionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,          // indexed for fast per-user lookups
    },
    foodId: {
      type: String,
      required: true,
    },
    foodName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    // orderCount  — how many times this user has ordered this item.
    // Each time an order is placed containing this item, this increments by 1.
    orderCount: {
      type: Number,
      default: 0,
    },
    // totalQuantity — cumulative units ordered across all orders.
    // e.g. ordered "Paneer Roll x2" twice → totalQuantity = 4
    totalQuantity: {
      type: Number,
      default: 0,
    },
    // lastOrderedAt — used to apply a recency boost in scoring.
    // Items ordered recently rank higher than items ordered long ago.
    lastOrderedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { minimize: false }
);

// Compound unique index: one document per (user, food item) pair
interactionSchema.index({ userId: 1, foodId: 1 }, { unique: true });

const interactionModel =
  mongoose.models.interaction ||
  mongoose.model("interaction", interactionSchema);

export default interactionModel;