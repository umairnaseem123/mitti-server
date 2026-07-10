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
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      enum: ["Concrete", "Candles"],
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    reviews: [reviewSchema],
    faqs: [faqSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
