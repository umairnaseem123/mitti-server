const express = require("express");
const router = express.Router();
const {
  subscribe,
  getSubscribers,
  deleteSubscriber,
} = require("../controllers/subscriberController");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

// Public — anyone can subscribe
router.post("/", subscribe);

// Admin only — view collected emails
router.get("/", protect, admin, getSubscribers);

// Admin only — remove an email from the list
router.delete("/:id", protect, admin, deleteSubscriber);

module.exports = router;
