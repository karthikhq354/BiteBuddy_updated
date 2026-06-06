import foodModel from "../models/foodModel.js";
import userModel from "../models/userModel.js";

const getNutritionRecommendation = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.userId);
    if (!user) return res.json({ success: false, message: "User not found" });
    const prefs = user.dietPreferences || {};
    const query = {};
    if (prefs.dietType?.length)   query.dietType = { $in: prefs.dietType };
    if (prefs.maxCalories)        query.calories = { $lte: prefs.maxCalories };
    if (prefs.minProtein)         query.protein  = { $gte: prefs.minProtein };
    if (prefs.allergies?.length)  query.allergens = { $nin: prefs.allergies };
    const foods = await foodModel.find(query).limit(10);
    res.json({ success: true, preferences: prefs, data: foods });
  } catch (error) { res.json({ success: false, message: "Error fetching nutrition recommendations" }); }
};

const saveNutritionPreferences = async (req, res) => {
  try {
    const { userId, dietType, maxCalories, minProtein, allergies } = req.body;
    await userModel.findByIdAndUpdate(userId, { dietPreferences: { dietType, maxCalories, minProtein, allergies } });
    res.json({ success: true, message: "Preferences saved" });
  } catch (error) { res.json({ success: false, message: "Error saving preferences" }); }
};

export { getNutritionRecommendation, saveNutritionPreferences };
