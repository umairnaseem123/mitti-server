const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    taxPercentage: {
      type: Number,
      default: 0,
    },
    codExtraCharge: {
      type: Number,
      default: 0,
    },
    deliveryCharge: {
      type: Number,
      default: 300,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Settings", settingsSchema);
