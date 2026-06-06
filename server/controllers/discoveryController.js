import foodModel from "../models/foodModel.js";

const searchFood = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json({ success: false, message: "Query required" });
    const keywords = query.toLowerCase().split(" ").filter(Boolean);
    const regexes  = keywords.map((k) => new RegExp(k, "i"));
    const foods = await foodModel.find({
      $or: [{ name: { $in: regexes } }, { category: { $in: regexes } }, { description: { $in: regexes } }],
    }).limit(12);
    res.json({ success: true, query, data: foods });
  } catch (error) { res.json({ success: false, message: "Search error" }); }
};

const getSurpriseFood = async (req, res) => {
  try {
    const count = await foodModel.countDocuments();
    const food  = await foodModel.findOne().skip(Math.floor(Math.random() * count));
    res.json({ success: true, data: food });
  } catch (error) { res.json({ success: false, message: "Error getting surprise food" }); }
};

const DAILY_CUISINE = {
  0: { day: "Sunday",    cuisine: "Deserts",  tagline: "Sweet Sunday treats 🍰" },
  1: { day: "Monday",    cuisine: "Salad",    tagline: "Fresh start to the week 🥗" },
  2: { day: "Tuesday",   cuisine: "Rolls",    tagline: "Roll into Tuesday 🌯" },
  3: { day: "Wednesday", cuisine: "Pasta",    tagline: "Midweek Italian vibes 🍝" },
  4: { day: "Thursday",  cuisine: "Noodles",  tagline: "Noodle Thursday 🍜" },
  5: { day: "Friday",    cuisine: "Sandwich", tagline: "TGIF Sandwich day 🥪" },
  6: { day: "Saturday",  cuisine: "Cake",     tagline: "Weekend cake time 🎂" },
};

const getDailyCuisine = async (req, res) => {
  try {
    const todayData = DAILY_CUISINE[new Date().getDay()];
    const foods = await foodModel.find({ category: todayData.cuisine }).limit(6);
    res.json({ success: true, ...todayData, data: foods });
  } catch (error) { res.json({ success: false, message: "Error fetching daily cuisine" }); }
};

export { searchFood, getSurpriseFood, getDailyCuisine };
