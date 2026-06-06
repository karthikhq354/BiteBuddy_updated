import orderModel from "../models/orderModel.js";
import foodModel  from "../models/foodModel.js";

// ─────────────────────────────────────────────────────────────
// TRENDING NOW — most ordered items in last 7 days
// Score = order count in last 7 days × 0.7 + all-time count × 0.3
// ─────────────────────────────────────────────────────────────
const getTrending = async (req, res) => {
  try {
    const limit    = parseInt(req.query.limit) || 4;
    const since    = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [recentOrders, allOrders] = await Promise.all([
      orderModel.find({ payment: true, date: { $gte: since } }),
      orderModel.find({ payment: true }),
    ]);

    const recentCount  = {};
    const allTimeCount = {};

    recentOrders.forEach((o) => o.items.forEach((item) => {
      recentCount[item.name] = (recentCount[item.name] || 0) + (item.quantity || 1);
    }));

    allOrders.forEach((o) => o.items.forEach((item) => {
      allTimeCount[item.name] = (allTimeCount[item.name] || 0) + (item.quantity || 1);
    }));

    const maxRecent   = Math.max(1, ...Object.values(recentCount));
    const maxAllTime  = Math.max(1, ...Object.values(allTimeCount));

    const allFoods = await foodModel.find({});

    const scored = allFoods.map((food) => ({
      food,
      score: ((recentCount[food.name] || 0) / maxRecent) * 0.7 +
             ((allTimeCount[food.name] || 0) / maxAllTime) * 0.3,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

    // If no order data fallback to first N foods
    const data = scored.length > 0 && scored[0].score > 0
      ? scored.map((s) => s.food)
      : allFoods.slice(0, limit);

    res.json({ success: true, data, algorithm: "trending-7d" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching trending" });
  }
};

// ─────────────────────────────────────────────────────────────
// TOP PICKS — personalised for logged-in user
// If user has orders: recommend based on favourite categories
// If no orders / not logged in: return highest-variety picks
// (different categories, not repeating trending items)
// ─────────────────────────────────────────────────────────────
const getTopPicks = async (req, res) => {
  try {
    const userId = req.body?.userId || null;
    const limit  = parseInt(req.query.limit) || 4;

    // Get trending names to avoid repeating them
    const since        = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentOrders = await orderModel.find({ payment: true, date: { $gte: since } });
    const trendingNames = new Set();
    const recentCount  = {};

    recentOrders.forEach((o) => o.items.forEach((item) => {
      recentCount[item.name] = (recentCount[item.name] || 0) + 1;
    }));

    Object.entries(recentCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .forEach(([name]) => trendingNames.add(name));

    const allFoods = await foodModel.find({ name: { $nin: [...trendingNames] } });

    // Personalised: user has orders
    if (userId) {
      const userOrders = await orderModel.find({ userId, payment: true });
      if (userOrders.length > 0) {
        const catCount = {};
        userOrders.forEach((o) => o.items.forEach((item) => {
          catCount[item.category] = (catCount[item.category] || 0) + 1;
        }));

        // Sort foods by user's preferred categories
        const sorted = allFoods.sort((a, b) => {
          const aScore = catCount[a.category] || 0;
          const bScore = catCount[b.category] || 0;
          return bScore - aScore;
        });

        return res.json({
          success: true,
          data: sorted.slice(0, limit),
          algorithm: "personalised",
          isPersonalised: true,
        });
      }
    }

    // Fallback: pick from different categories for variety
    const used = new Set();
    const picks = [];
    for (const food of allFoods) {
      if (!used.has(food.category)) {
        picks.push(food);
        used.add(food.category);
        if (picks.length >= limit) break;
      }
    }

    // Fill remaining slots if needed
    if (picks.length < limit) {
      allFoods.forEach((f) => {
        if (picks.length < limit && !picks.find((p) => p._id.equals(f._id))) {
          picks.push(f);
        }
      });
    }

    res.json({ success: true, data: picks, algorithm: "variety", isPersonalised: false });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching top picks" });
  }
};

export { getTrending, getTopPicks };