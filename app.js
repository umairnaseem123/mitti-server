const express = require("express");
const cors = require("cors");
const path = require("path");
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
// Stripe is disabled — not officially supported for Pakistan-based payouts.
// Re-enable these two lines (and the app.use("/api/payment", ...) below)
// once a local payment gateway (e.g. PayFast) is integrated instead.
// const paymentRoutes = require("./routes/paymentRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const subscriberRoutes = require("./routes/subscriberRoutes");
// const { handleStripeWebhook } = require("./controllers/paymentController");
const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  })
);
// Stripe webhook route disabled along with the rest of the payment flow.
// app.post(
//   "/api/payment/webhook",
//   express.raw({ type: "application/json" }),
//   handleStripeWebhook
// );
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/settings", settingsRoutes);
// app.use("/api/payment", paymentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/subscribers", subscriberRoutes);
app.get("/", (req, res) => {
  res.send("Mitti API is running...");
});
module.exports = app;
