const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true },
);

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    // Optional "before discount" price. When set and higher than `price`,
    // the frontend shows it struck through next to the current price with
    // a "% OFF" badge. Leave blank/0 for products with no discount.
    originalPrice: {
      type: Number,
      default: null,
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      enum: ["Concrete", "Candles"],
      required: true,
    },
    // Plain color names (e.g. "Grey", "Pink"). The frontend already has
    // its own name -> hex swatch mapping (COLOR_SWATCHES in
    // ProductDetailClient.js), so this just needs to be simple strings
    // that match names in that list.
    colors: {
      type: [String],
      default: [],
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    wishlistCount: {
      type: Number,
      default: 0,
    },
    reviews: [reviewSchema],
    faqs: [faqSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);

