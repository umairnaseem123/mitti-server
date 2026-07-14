const Coupon = require("../models/Coupon");

// GET all coupons (admin only)
const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE coupon (admin only)
const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, expiresAt } =
      req.body;

    if (!code || !discountType || discountValue === undefined) {
      return res
        .status(400)
        .json({ message: "Code, discount type, and value are required." });
    }

    if (discountType === "percentage" && discountValue > 100) {
      return res
        .status(400)
        .json({ message: "Percentage discount cannot exceed 100." });
    }

    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      discountType,
      discountValue,
      minOrderAmount: minOrderAmount || 0,
      expiresAt: expiresAt || null,
    });

    res.status(201).json(coupon);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "A coupon with this code already exists." });
    }
    res.status(400).json({ message: error.message });
  }
};

// UPDATE coupon active status (admin only)
const updateCoupon = async (req, res) => {
  try {
    const { isActive } = req.body;
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found." });
    }
    if (isActive !== undefined) coupon.isActive = isActive;
    const updated = await coupon.save();
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE coupon (admin only)
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found." });
    }
    res.status(200).json({ message: "Coupon deleted." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// VALIDATE coupon (public — used at checkout)
const validateCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Please enter a coupon code." });
    }

    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code." });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ message: "This coupon is no longer active." });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ message: "This coupon has expired." });
    }

    if (coupon.minOrderAmount > 0 && (subtotal || 0) < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `This coupon requires a minimum order of Rs. ${coupon.minOrderAmount}.`,
      });
    }

    const discountAmount =
      coupon.discountType === "percentage"
        ? ((subtotal || 0) * coupon.discountValue) / 100
        : coupon.discountValue;

    res.status(200).json({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: Math.min(discountAmount, subtotal || 0),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
};
