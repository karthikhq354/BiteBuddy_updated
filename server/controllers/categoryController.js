import categoryModel from "../models/categoryModel.js";
import fs from "fs";

const DEFAULT_CATEGORIES = [
  "Salad", "Rolls", "Deserts", "Sandwich", "Cake",
  "Pure Veg", "Pasta", "Noodles",
  "Biryani",      // ← add here
  "Burgers",      // ← add here
  "Pizza",        // ← add here
];

const listCategories = async (req, res) => {
  try {
    let categories = await categoryModel.find({ active: true }).sort({ order: 1, name: 1 });
    if (categories.length === 0) {
      const docs = DEFAULT_CATEGORIES.map((name, i) => ({ name, order: i, active: true }));
      await categoryModel.insertMany(docs);
      categories = await categoryModel.find({ active: true }).sort({ order: 1 });
    }
    res.json({ success: true, data: categories });
  } catch (error) {
    res.json({ success: false, message: "Error fetching categories" });
  }
};

const listAllCategories = async (req, res) => {
  try {
    const categories = await categoryModel.find().sort({ order: 1, name: 1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.json({ success: false, message: "Error" });
  }
};

const addCategory = async (req, res) => {
  try {
    const { name, order } = req.body;
    const image = req.file ? req.file.filename : "";
    const exists = await categoryModel.findOne({ name: name.trim() });
    if (exists) return res.json({ success: false, message: "Category already exists" });
    const category = await categoryModel.create({ name: name.trim(), image, order: order || 0, active: true });
    res.json({ success: true, data: category, message: "Category added" });
  } catch (error) {
    res.json({ success: false, message: "Error adding category" });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, order, active } = req.body;
    const updateData = { name: name.trim(), order, active };
    if (req.file) updateData.image = req.file.filename;
    const updated = await categoryModel.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.json({ success: false, message: "Category not found" });
    res.json({ success: true, data: updated, message: "Category updated" });
  } catch (error) {
    res.json({ success: false, message: "Error updating category" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await categoryModel.findById(req.params.id);
    if (!category) return res.json({ success: false, message: "Category not found" });
    if (category.image) fs.unlink(`uploads/${category.image}`, () => {});
    await categoryModel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    res.json({ success: false, message: "Error deleting category" });
  }
};

export { listCategories, listAllCategories, addCategory, updateCategory, deleteCategory };