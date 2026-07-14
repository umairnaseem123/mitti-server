const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  trackOrder,
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

// Public routes (no login required)
router.post("/", createOrder);
router.post("/track", trackOrder);

// Admin-only routes
router.get("/", protect, admin, getOrders);
router.get("/:id", protect, admin, getOrderById);
router.put("/:id", protect, admin, updateOrderStatus);

module.exports = router;
