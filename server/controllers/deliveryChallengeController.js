import orderModel from "../models/orderModel.js";
import promoAutoModel from "../models/promoAutoModel.js";

const checkDeliveryDelay = async (req, res) => {
  try {
    const { orderId, actualDeliveryTime } = req.body;
    const order = await orderModel.findById(orderId);
    if (!order) return res.json({ success: false, message: "Order not found" });
    if (!order.estimatedDeliveryTime) return res.json({ success: false, message: "No estimated delivery time" });

    const delayMins = Math.round((new Date(actualDeliveryTime) - new Date(order.estimatedDeliveryTime)) / 60000);
    await orderModel.findByIdAndUpdate(orderId, { actualDeliveryTime, deliveryDelayMinutes: delayMins, status: "Delivered" });

    if (delayMins > 10) {
      const code = `SORRY${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const coupon = await promoAutoModel.create({
        code, discountType: "percent", discountValue: delayMins > 30 ? 20 : 10,
        minOrder: 0, maxUses: 1, targetUserId: order.userId, trigger: "DELAY_COMPENSATION",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      return res.json({ success: true, delayed: true, delayMins, couponGenerated: true,
        coupon: { code: coupon.code, discountValue: coupon.discountValue } });
    }
    res.json({ success: true, delayed: false, delayMins, message: "Delivered on time!" });
  } catch (error) { res.json({ success: false, message: "Error checking delivery delay" }); }
};

const generateCoupon = async (req, res) => {
  try {
    const { userId, discountValue = 10, discountType = "percent", reason = "manual" } = req.body;
    const code = `GIFT${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const coupon = await promoAutoModel.create({
      code, discountType, discountValue, minOrder: 0, maxUses: 1,
      targetUserId: userId || null, trigger: reason,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    res.json({ success: true, coupon });
  } catch (error) { res.json({ success: false, message: "Error generating coupon" }); }
};

export { checkDeliveryDelay, generateCoupon };
