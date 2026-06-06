import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  label:     { type: String, default: "Home" },
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email:     { type: String, required: true },
  street:    { type: String, required: true },
  city:      { type: String, required: true },
  state:     { type: String, required: true },
  pincode:   { type: String, required: true },
  country:   { type: String, required: true },
  phone:     { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema({
  name:           { type: String, required: true },
  email:          { type: String, required: true, unique: true },
  password:       { type: String, required: true },
  cartData:       { type: Object, default: {} },
  savedAddresses: { type: [addressSchema], default: [] },
  dietPreferences: {
    dietType:    { type: [String] },
    maxCalories: { type: Number },
    minProtein:  { type: Number },
    allergies:   { type: [String] },
  },
}, { minimize: false });

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;
