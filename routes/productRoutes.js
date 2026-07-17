const express = require("express");
const router = express.Router();
const {
  getProducts,
  getFeaturedReviews,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  addFaq,
  toggleWishlistCount,
  getWishlistEntries,
} = require("../controllers/productController");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");
// Public routes (anyone can view products, search works via ?search=name&category=Concrete)
router.get("/", getProducts);
// IMPORTANT: this must come before "/:id" â€” otherwise Express treats
// "reviews" as a product id and this route never gets hit.
router.get("/reviews/featured", getFeaturedReviews);
router.get("/:id", getProductById);
// Public route - customers can add a review
router.post("/:id/reviews", addReview);
router.put("/:id/wishlist", toggleWishlistCount);
// Admin-only routes
router.post("/", protect, admin, createProduct);
router.put("/:id", protect, admin, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);
router.post("/:id/faqs", protect, admin, addFaq);
router.get("/:id/wishlist-entries", protect, admin, getWishlistEntries);
module.exports = router;
