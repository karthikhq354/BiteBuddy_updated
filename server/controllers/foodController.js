import foodModel from "../models/foodModel.js";
import fs from "fs";

// ── ADD FOOD ITEM ─────────────────────────────────────────
const addFood = async (req, res) => {
  if (!req.file) {
    return res.json({ success: false, message: "No image file uploaded" });
  }

  let image_filename = `${req.file.filename}`;
  const food = new foodModel({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    image: image_filename,
  });

  try {
    await food.save();
    res.json({ success: true, message: "Food Added" });
  } catch (error) {
    console.log(error);
    if (req.file && req.file.filename) {
      fs.unlink(`uploads/${req.file.filename}`, (err) => {
        if (err) console.log("Error deleting file:", err);
      });
    }
    res.json({ success: false, message: "Error adding food item" });
  }
};

// ── LIST ALL FOOD ITEMS ───────────────────────────────────
const listFood = async (req, res) => {
  try {
    const foods = await foodModel.find({});
    res.json({ success: true, data: foods });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// ── REMOVE FOOD ITEM ──────────────────────────────────────
const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.body.id);
    fs.unlink(`uploads/${food.image}`, () => {});
    await foodModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Food Removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// ── EDIT FOOD ITEM ────────────────────────────────────────
// POST /api/food/edit
// Body (multipart/form-data):
//   id          — the food item's _id (required)
//   name        — updated name (optional)
//   description — updated description (optional)
//   price       — updated price (optional)
//   category    — updated category (optional)
//   image       — new image file (optional — if not provided, old image is kept)
//
// Flow:
//  1. Find the existing food item
//  2. Build an update object from only the fields that were sent
//  3. If a new image was uploaded, delete the old image file and use the new filename
//  4. Save the update
const editFood = async (req, res) => {
  try {
    const { id, name, description, price, category } = req.body;

    if (!id) {
      return res.json({ success: false, message: "Food ID is required" });
    }

    // Find the existing record first so we can access the old image filename
    const existingFood = await foodModel.findById(id);
    if (!existingFood) {
      return res.json({ success: false, message: "Food item not found" });
    }

    // Build update object — only include fields that were actually sent
    const updateData = {};
    if (name)        updateData.name        = name;
    if (description) updateData.description = description;
    if (price)       updateData.price       = Number(price);
    if (category)    updateData.category    = category;

    // If a new image was uploaded, swap it out and delete the old one
    if (req.file) {
      updateData.image = req.file.filename;

      // Delete old image file from disk (non-blocking)
      fs.unlink(`uploads/${existingFood.image}`, (err) => {
        if (err) console.log("Could not delete old image:", err);
      });
    }

    if (Object.keys(updateData).length === 0) {
      return res.json({ success: false, message: "No fields provided to update" });
    }

    const updatedFood = await foodModel.findByIdAndUpdate(id, updateData, { new: true });
    res.json({ success: true, message: "Food Updated", data: updatedFood });

  } catch (error) {
    console.log(error);
    // If DB update fails but a new image was already uploaded, clean it up
    if (req.file) {
      fs.unlink(`uploads/${req.file.filename}`, () => {});
    }
    res.json({ success: false, message: "Error updating food item" });
  }
};

export { addFood, listFood, removeFood, editFood };