const mongoose = require("mongoose");

const stockNotificationSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    // Set to true once the admin has manually messaged this customer after
    // marking the product back in stock.
    notified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StockNotification", stockNotificationSchema);
