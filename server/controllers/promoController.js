import promoModel from "../models/promoModel.js";

// ── VALIDATE PROMO CODE (called from Cart page) ───────────
// POST /api/promo/validate
// Body: { code, cartAmount }
// Returns the discount amount if valid, or an error message if not
const validatePromo = async (req, res) => {
  try {
    const { code, cartAmount } = req.body;

    if (!code || !cartAmount) {
      return res.json({ success: false, message: "Code and cart amount are required" });
    }

    // Find the promo — stored uppercase so normalise input too
    const promo = await promoModel.findOne({ code: code.toUpperCase().trim() });

    // ── Validation checks ─────────────────────────────────

    if (!promo) {
      return res.json({ success: false, message: "Invalid promo code" });
    }

    if (!promo.isActive) {
      return res.json({ success: false, message: "This promo code is inactive" });
    }

    // Check expiry
    if (promo.expiresAt && new Date() > new Date(promo.expiresAt)) {
      return res.json({ success: false, message: "This promo code has expired" });
    }

    // Check usage limit
    if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
      return res.json({ success: false, message: "This promo code has reached its usage limit" });
    }

    // Check minimum order amount
    if (cartAmount < promo.minOrderAmount) {
      return res.json({
        success: false,
        message: `Minimum order amount of ₹${promo.minOrderAmount} required for this code`,
      });
    }

    // ── Calculate discount amount ─────────────────────────
    let discountAmount = 0;

    if (promo.discountType === "percentage") {
      // e.g. 20% of ₹500 = ₹100
      discountAmount = Math.round((cartAmount * promo.discountValue) / 100);
    } else {
      // flat discount — but never more than the cart amount itself
      discountAmount = Math.min(promo.discountValue, cartAmount);
    }

    res.json({
      success: true,
      message: `Promo applied! You save ₹${discountAmount}`,
      discountAmount,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      code: promo.code,
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error validating promo code" });
  }
};


// ── APPLY PROMO (called from orderController after payment success) ──
// Increments usedCount so we can track usage limits accurately.
// This is called internally, not directly from a route.
const applyPromoUsage = async (code) => {
  await promoModel.findOneAndUpdate(
    { code: code.toUpperCase() },
    { $inc: { usedCount: 1 } }
  );
};


// ── ADMIN: CREATE PROMO CODE ──────────────────────────────
// POST /api/promo/create
// Body: { code, discountType, discountValue, minOrderAmount, maxUses, expiresAt }
const createPromo = async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, maxUses, expiresAt } = req.body;

    // Check if code already exists
    const existing = await promoModel.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
      return res.json({ success: false, message: "Promo code already exists" });
    }

    const promo = new promoModel({
      code,
      discountType,
      discountValue,
      minOrderAmount: minOrderAmount || 0,
      maxUses: maxUses || null,
      expiresAt: expiresAt || null,
    });

    await promo.save();
    res.json({ success: true, message: "Promo code created", data: promo });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error creating promo code" });
  }
};


// ── ADMIN: LIST ALL PROMO CODES ───────────────────────────
// GET /api/promo/list
const listPromos = async (req, res) => {
  try {
    const promos = await promoModel.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: promos });
  } catch (error) {
    res.json({ success: false, message: "Error fetching promo codes" });
  }
};


// ── ADMIN: TOGGLE ACTIVE STATUS ───────────────────────────
// POST /api/promo/toggle
// Body: { id }
const togglePromo = async (req, res) => {
  try {
    const promo = await promoModel.findById(req.body.id);
    if (!promo) return res.json({ success: false, message: "Promo not found" });

    promo.isActive = !promo.isActive;
    await promo.save();
    res.json({
      success: true,
      message: `Promo ${promo.isActive ? "activated" : "deactivated"}`,
      data: promo,
    });
  } catch (error) {
    res.json({ success: false, message: "Error toggling promo" });
  }
};


// ── ADMIN: DELETE PROMO CODE ─────────────────────────────
// POST /api/promo/delete
// Body: { id }
const deletePromo = async (req, res) => {
  try {
    await promoModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Promo code deleted" });
  } catch (error) {
    res.json({ success: false, message: "Error deleting promo" });
  }
};


export { validatePromo, applyPromoUsage, createPromo, listPromos, togglePromo, deletePromo };