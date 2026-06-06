import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name:   { type: String, required: true, unique: true },
  image:  { type: String, default: "" },
  order:  { type: Number, default: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

const categoryModel = mongoose.models.category || mongoose.model("category", categorySchema);
export default categoryModel;