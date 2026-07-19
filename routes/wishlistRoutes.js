const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const WishlistEntry = require("../models/WishlistEntry");
const { protect } = require("../middleware/authMiddleware");

// POST /api/wishlist
// Called from the frontend when a customer adds a product to their wishlist
// for the first time (name + phone collected via a popup). Saves the entry
// for admin follow-up. Note: this does NOT touch product.wishlistCount -
// that's already handled by the existing PUT /api/products/:id/wishlist route.
router.post("/", async (req, res) => {
  try {
    const { productId, name, phone } = req.body;

    if (!productId || !name || !phone) {
      return res
        .status(400)
        .json({ message: "productId, name and phone are required." });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const entry = await WishlistEntry.create({
      product: productId,
      name,
      phone,
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error("Error creating wishlist entry:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// GET /api/wishlist
// Admin-only: list all wishlist contact entries (name, phone, product) so
// the admin can follow up with interested customers.
router.get("/", protect, async (req, res) => {
  try {
    const entries = await WishlistEntry.find()
      .populate("product", "name price images")
      .sort({ createdAt: -1 });

    res.json(entries);
  } catch (error) {
    console.error("Error fetching wishlist entries:", error);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
