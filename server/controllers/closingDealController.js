import foodModel from "../models/foodModel.js";

const getClosingDiscountFoods = async (req, res) => {
  try {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const foods = await foodModel.find({ closingTime: { $exists: true, $ne: null } });
    const discounted = foods.filter((food) => {
      if (!food.closingTime) return false;
      const [h, m] = food.closingTime.split(":").map(Number);
      const closingMinutes = h * 60 + m;
      return currentTime >= closingMinutes - 90 && currentTime < closingMinutes;
    }).map((food) => {
      const discountPct = food.discountPercentage || 20;
      const [h, m] = food.closingTime.split(":").map(Number);
      const minsLeft = (h * 60 + m) - currentTime;
      return { ...food._doc, isClosingDiscount: true, discountPercentage: discountPct,
        discountedPrice: Math.round(food.price * (1 - discountPct / 100)), minsUntilClose: minsLeft };
    });
    res.json({ success: true, data: discounted, count: discounted.length });
  } catch (error) { res.json({ success: false, message: "Error fetching closing deals" }); }
};

export { getClosingDiscountFoods };
