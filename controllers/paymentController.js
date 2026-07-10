const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Product = require("../models/Product");
const Settings = require("../models/Settings");
const Order = require("../models/Order");

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// CREATE Stripe checkout session
const createCheckoutSession = async (req, res) => {
  try {
    const { items, orderId } = req.body;
    // items = [{ productId, qty }, ...]
    // IMPORTANT: prices are never trusted from the client. We look up the
    // real price for each product from the database.

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items provided" });
    }

    if (!orderId) {
      return res
        .status(400)
        .json({ message: "orderId is required to start a payment" });
    }

    const productIds = items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== items.length) {
      return res
        .status(400)
        .json({ message: "One or more products could not be found" });
    }

    let subtotal = 0;

    const lineItems = items.map((item) => {
      const product = products.find(
        (p) => p._id.toString() === item.productId
      );
      const qty = Number(item.qty) || 1;
      subtotal += product.price * qty;

      return {
        price_data: {
          currency: "pkr",
          product_data: {
            name: product.name,
          },
          unit_amount: Math.round(product.price * 100), // Stripe uses smallest currency unit
        },
        quantity: qty,
      };
    });

    // Delivery charge and tax both come from the admin-editable Settings
    // document, so this stays in sync with whatever the checkout page shows.
    const settings = (await Settings.findOne()) || {};
    const deliveryCharge = settings.deliveryCharge ?? 300;
    const taxPercentage = settings.taxPercentage || 0;

    lineItems.push({
      price_data: {
        currency: "pkr",
        product_data: { name: "Delivery Charge" },
        unit_amount: Math.round(deliveryCharge * 100),
      },
      quantity: 1,
    });

    if (taxPercentage > 0) {
      const taxAmount = Math.round(subtotal * (taxPercentage / 100));
      lineItems.push({
        price_data: {
          currency: "pkr",
          product_data: { name: `Tax (${taxPercentage}%)` },
          unit_amount: taxAmount * 100,
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      // Store our own order's _id on the Stripe session. When Stripe
      // notifies us via webhook that payment succeeded, this is how we
      // know WHICH order in our database to mark as paid.
      metadata: {
        orderId: orderId,
      },
      success_url: `${FRONTEND_URL}/order-confirmation?success=true&method=card`,
      cancel_url: `${FRONTEND_URL}/checkout?canceled=true`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// STRIPE WEBHOOK — Stripe calls this endpoint automatically whenever a
// payment event happens (success, failure, etc). This is the ONLY
// reliable way to know a payment actually went through, since the
// success_url redirect only affects the customer's browser and is never
// seen by our server.
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // req.body must be the RAW (unparsed) request body here — see app.js
    // for why. constructEvent verifies the signature so we know this
    // request genuinely came from Stripe and wasn't spoofed.
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      try {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: "paid",
        });
        console.log(`Order ${orderId} marked as paid.`);
      } catch (err) {
        console.error(
          `Failed to update order ${orderId} after payment:`,
          err.message
        );
      }
    } else {
      console.warn("Stripe webhook received with no orderId in metadata.");
    }
  }

  // Always acknowledge receipt with 200, or Stripe will keep retrying
  // this same event indefinitely.
  res.status(200).json({ received: true });
};

module.exports = { createCheckoutSession, handleStripeWebhook };
