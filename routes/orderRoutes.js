const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

// Public route (customer places order, no login required)
router.post("/", createOrder);

// Admin-only routes
router.get("/", protect, admin, getOrders);
router.get("/:id", protect, admin, getOrderById);
router.put("/:id", protect, admin, updateOrderStatus);

module.exports = router;
