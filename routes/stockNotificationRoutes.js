const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const StockNotification = require("../models/StockNotification");
const { protect } = require("../middleware/authMiddleware");

// POST /api/stock-notifications
// Called from the product page when a customer asks to be notified once an
// out-of-stock product is available again.
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

    const entry = await StockNotification.create({
      product: productId,
      name,
      phone,
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error("Error creating stock notification:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// GET /api/stock-notifications?status=pending|completed
// Admin-only: list requests. Defaults to pending (not yet notified) so the
// admin can see who to message once restocked. Pass status=completed to see
// the history of requests already handled.
router.get("/", protect, async (req, res) => {
  try {
    const status = req.query.status === "completed" ? "completed" : "pending";
    const filter = { notified: status === "completed" };

    const entries = await StockNotification.find(filter)
      .populate("product", "name price images stock")
      .sort({ createdAt: -1 });

    res.json(entries);
  } catch (error) {
    console.error("Error fetching stock notifications:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// PUT /api/stock-notifications/:id
// Admin-only: mark a request as notified after manually messaging the
// customer (e.g. on WhatsApp) that the product is back in stock.
router.put("/:id", protect, async (req, res) => {
  try {
    const entry = await StockNotification.findByIdAndUpdate(
      req.params.id,
      { notified: true },
      { new: true }
    );

    if (!entry) {
      return res.status(404).json({ message: "Entry not found." });
    }

    res.json(entry);
  } catch (error) {
    console.error("Error updating stock notification:", error);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
