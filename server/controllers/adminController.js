import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";

const getDashboard = async (req, res) => {
  try {
    const [orders, users, foods] = await Promise.all([
      orderModel.find({ payment: true }),
      userModel.find(),
      foodModel.find(),
    ]);

    const totalRevenue    = orders.reduce((s, o) => s + o.amount, 0);
    const pendingOrders   = await orderModel.countDocuments({ status: { $in: ["Food Processing", "Order Placed"] } });
    const today           = new Date(); today.setHours(0, 0, 0, 0);
    const todayOrders     = orders.filter((o) => new Date(o.date) >= today).length;

    const revenueData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      const rev = orders.filter((o) => new Date(o.date) >= d && new Date(o.date) < next).reduce((s, o) => s + o.amount, 0);
      revenueData.push({ day: d.toLocaleDateString("en-IN", { weekday: "short" }), revenue: rev });
    }

    const foodCount = {}; const foodRevenue = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        foodCount[item.name]   = (foodCount[item.name]   || 0) + (item.quantity || 1);
        foodRevenue[item.name] = (foodRevenue[item.name] || 0) + item.price * (item.quantity || 1);
      });
    });
    const topFoods = Object.entries(foodCount).sort((a, b) => b[1] - a[1]).slice(0, 6)
      .map(([name, totalOrders]) => ({ name, totalOrders, totalRevenue: foodRevenue[name] || 0,
        category: foods.find((f) => f.name === name)?.category || "—" }));

    const catCount = {};
    orders.forEach((o) => o.items.forEach((item) => {
      const cat = foods.find((f) => f.name === item.name)?.category || "Other";
      catCount[cat] = (catCount[cat] || 0) + 1;
    }));
    const categoryData = Object.entries(catCount).map(([name, value]) => ({ name, value }));

    const statusList = ["Food Processing", "Out for Delivery", "Delivered"];
    const statusBreakdown = await Promise.all(
      statusList.map(async (status) => ({ status: status.split(" ")[0], count: await orderModel.countDocuments({ status }) }))
    );

    res.json({ success: true,
      stats: { totalOrders: orders.length, totalRevenue, totalCustomers: users.length,
        totalFoods: foods.length, pendingOrders, todayOrders, statusBreakdown },
      revenueData, topFoods, categoryData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error loading dashboard" });
  }
};

const getCustomers = async (req, res) => {
  try {
    const users  = await userModel.find().select("-password");
    const orders = await orderModel.find({ payment: true });
    const customers = users.map((user) => {
      const userOrders = orders.filter((o) => o.userId === user._id.toString());
      const totalSpent = userOrders.reduce((s, o) => s + o.amount, 0);
      const lastOrder  = userOrders.sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.date;
      return { _id: user._id, name: user.name, email: user.email, totalOrders: userOrders.length, totalSpent, lastOrder };
    });
    customers.sort((a, b) => b.totalSpent - a.totalSpent);
    res.json({ success: true, data: customers });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error loading customers" });
  }
};

export { getDashboard, getCustomers };