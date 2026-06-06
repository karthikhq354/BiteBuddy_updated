import foodModel from "../models/foodModel.js";

const MOOD_CATEGORY_MAP = {
  happy:     ["Cake", "Deserts", "Rolls", "Sandwich"],
  tired:     ["Noodles", "Pasta", "Rice"],
  stressed:  ["Deserts", "Cake", "Sandwich"],
  sick:      ["Salad", "Sandwich"],
  energetic: ["Salad", "Rolls", "Noodles"],
};

const getMoodRecommendation = async (req, res) => {
  try {
    const mood = req.params.mood.toLowerCase();
    const categories = MOOD_CATEGORY_MAP[mood];
    if (!categories) return res.json({ success: false, message: "Invalid mood" });
    const foods = await foodModel.find({ category: { $in: categories } }).limit(8);
    res.json({ success: true, mood, categories, data: foods });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching mood recommendations" });
  }
};

export { getMoodRecommendation };
