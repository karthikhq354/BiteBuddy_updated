import mongoose from "mongoose";

const groupOrderSchema = new mongoose.Schema({
  groupCode:   { type: String, required: true, unique: true },
  hostUserId:  { type: String, required: true },
  participants: [{
    userId:   { type: String, required: true },
    name:     { type: String },
    items:    { type: Array, default: [] },
    subtotal: { type: Number, default: 0 },
  }],
  status:      { type: String, enum: ["open", "locked", "paid"], default: "open" },
  totalAmount: { type: Number, default: 0 },
  address:     { type: Object },
  createdAt:   { type: Date, default: Date.now, expires: 3600 },
});

const groupOrderModel = mongoose.models.groupOrder || mongoose.model("groupOrder", groupOrderSchema);
export default groupOrderModel;
