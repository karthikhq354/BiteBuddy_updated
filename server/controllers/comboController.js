import foodModel from "../models/foodModel.js";
import orderModel from "../models/orderModel.js";

const getFoodCombo = async (req, res) => {
  try {
    const { foodId } = req.params;
    const food = await foodModel.findById(foodId);
    if (!food) return res.json({ success: false, message: "Food not found" });

    const ordersWithFood = await orderModel.find({ "items._id": foodId, payment: true }).limit(200);
    const coCount = {};
    ordersWithFood.forEach((order) => {
      order.items.forEach((item) => {
        if (item._id?.toString() !== foodId) {
          coCount[item.name] = (coCount[item.name] || 0) + 1;
        }
      });
    });

    const topNames = Object.entries(coCount).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([name]) => name);
    let comboFoods = await foodModel.find({ name: { $in: topNames } });

    if (comboFoods.length === 0 && food.recommendedCombo?.length > 0) {
      comboFoods = await foodModel.find({ _id: { $in: food.recommendedCombo } });
    }

    if (comboFoods.length === 0) {
      comboFoods = await foodModel.find({ category: food.category, _id: { $ne: food._id } }).limit(3);
    }

    res.json({ success: true, food, combo: comboFoods });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching combo" });
  }
};

export { getFoodCombo };
