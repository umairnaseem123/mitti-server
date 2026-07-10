const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  addFaq,
} = require("../controllers/productController");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

// Public routes (anyone can view products, search works via ?search=name&category=Concrete)
router.get("/", getProducts);
router.get("/:id", getProductById);

// Public route - customers can add a review
router.post("/:id/reviews", addReview);

// Admin-only routes
router.post("/", protect, admin, createProduct);
router.put("/:id", protect, admin, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);
router.post("/:id/faqs", protect, admin, addFaq);

module.exports = router;
