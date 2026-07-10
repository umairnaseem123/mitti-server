const express = require("express");
const router = express.Router();
const {
  getSettings,
  updateSettings,
} = require("../controllers/settingsController");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

// Public route (frontend needs tax/COD charge to calculate checkout total)
router.get("/", getSettings);

// Admin-only route (edit tax % and COD charge)
router.put("/", protect, admin, updateSettings);

module.exports = router;
