import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String, required: true },
  price:       { type: Number, required: true },
  image:       { type: String, required: true },
  category:    { type: String, required: true },
  recommendedCombo: [{ type: mongoose.Schema.Types.ObjectId, ref: "food" }],
  closingTime:        { type: String },
  discountPercentage: { type: Number, default: 20 },
  calories:  { type: Number },
  protein:   { type: Number },
  carbs:     { type: Number },
  fat:       { type: Number },
  dietType:  { type: String, enum: ["veg", "vegan", "non-veg", "high-protein", "low-calorie"] },
  allergens: [{ type: String }],
});

const foodModel = mongoose.models.food || mongoose.model("food", foodSchema);
export default foodModel;
