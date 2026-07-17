const Product = require("../models/Product");
const WishlistEntry = require("../models/WishlistEntry");
const sendNewProductEmail = require("../utils/sendProductEmail");

// GET all products (supports search + category filter)
const getProducts = async (req, res) => {
  try {
    const { search, category } = req.query;
    let filter = {};

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    if (category) {
      filter.category = category;
    }

    const products = await Product.find(filter);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET a handful of real, high-rated reviews pulled across every product â€”
// used for the "What Our Customers Say" section on the homepage.
// This route MUST be registered before "/:id" in productRoutes.js, or
// Express will try to treat "reviews" as a product id and 404/error.
const getFeaturedReviews = async (req, res) => {
  try {
    const results = await Product.aggregate([
      { $unwind: "$reviews" },
      { $match: { "reviews.rating": { $gte: 4 } } },
      { $sort: { "reviews.createdAt": -1 } },
      { $limit: 9 },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          productName: "$name",
          customerName: "$reviews.customerName",
          rating: "$reviews.rating",
          comment: "$reviews.comment",
          createdAt: "$reviews.createdAt",
        },
      },
    ]);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET single product
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE product
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      images,
      category,
      stock,
      faqs,
    } = req.body;
    const product = new Product({
      name,
      description,
      price,
      // Only store originalPrice if it was actually provided and is a
      // real discount (higher than the current price). Otherwise leave
      // it null so no "before" price / badge shows on the frontend.
      originalPrice:
        originalPrice && Number(originalPrice) > Number(price)
          ? Number(originalPrice)
          : null,
      images,
      category,
      stock,
      faqs: faqs || [],
    });
    const savedProduct = await product.save();

    // Fire-and-forget: don't wait for the email to finish before responding
    sendNewProductEmail(savedProduct);

    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// UPDATE product
const updateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Same guard as createProduct: don't save a discount price that isn't
    // actually higher than the current price.
    if (
      updateData.originalPrice &&
      Number(updateData.originalPrice) <= Number(updateData.price)
    ) {
      updateData.originalPrice = null;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true },
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE product
const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD review to product (public - customers can review)
const addReview = async (req, res) => {
  try {
    const { customerName, rating, comment } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.reviews.push({ customerName, rating, comment });
    await product.save();

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ADD FAQ to product (admin only)
const addFaq = async (req, res) => {
  try {
    const { question, answer } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.faqs.push({ question, answer });
    await product.save();

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// TOGGLE wishlist count (public) - now also saves name/phone when adding,
// so admin can see who wishlisted a product and follow up.
const toggleWishlistCount = async (req, res) => {
  try {
    const { action, name, phone } = req.body; // "add" or "remove"
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (action === "remove") {
      product.wishlistCount = Math.max(0, (product.wishlistCount || 0) - 1);
      // Best-effort: remove the matching entry for this phone, if we have one
      if (phone) {
        await WishlistEntry.findOneAndDelete({
          product: product._id,
          phone,
        });
      }
    } else {
      product.wishlistCount = (product.wishlistCount || 0) + 1;
      // Save who wishlisted it, if name/phone were provided
      if (name && phone) {
        await WishlistEntry.create({
          product: product._id,
          name,
          phone,
        });
      }
    }

    await product.save();
    res.status(200).json({ wishlistCount: product.wishlistCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET all wishlist entries (name + phone) for a specific product (admin only)
const getWishlistEntries = async (req, res) => {
  try {
    const entries = await WishlistEntry.find({
      product: req.params.id,
    }).sort({ createdAt: -1 });
    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};
