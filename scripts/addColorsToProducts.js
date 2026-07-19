// Run this once to add color options (name + hex) to every existing
// product in the database, based on its category.
//
// HOW TO RUN:
//   1. Place this file in your server folder (e.g. server/scripts/addColorsToProducts.js)
//   2. Make sure your .env has the same Mongo connection string your
//      server already uses (check server/config/db.js or server.js for
//      the exact env var name — it's usually MONGO_URI or MONGODB_URI).
//   3. From the server folder run:  node scripts/addColorsToProducts.js
//
// Edit the colorPalettes object below to change which colors get
// assigned to which category. Add more categories if you have them.

require("dotenv").config();
const dns = require("dns");
// Force a public DNS resolver for this script's MongoDB SRV lookup.
// Some ISPs/routers intermittently fail to resolve "_mongodb._tcp.*" SRV
// records even though normal DNS (and your main app) works fine.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");
const Product = require("../models/Product"); // adjust path if this file lives elsewhere

// IMPORTANT: these must be plain strings, and should match names already
// defined in COLOR_SWATCHES inside ProductDetailClient.js so the frontend
// can look up the correct hex automatically. Add/rename as needed.
const colorPalettes = {
  Candles: ["Pink", "White", "Beige"],
  Concrete: ["Grey", "Rust", "Black"],
};

async function run() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error(
      "No Mongo connection string found in .env (checked MONGO_URI and MONGODB_URI). Add the correct variable name used by your server.",
    );
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to database.");

  const products = await Product.find({});
  console.log(`Found ${products.length} product(s).`);

  for (const product of products) {
    const palette = colorPalettes[product.category] || [];
    if (palette.length === 0) {
      console.log(
        `Skipping "${product.name}" — no palette defined for category "${product.category}".`,
      );
      continue;
    }
    product.colors = palette;
    await product.save();
    console.log(`Updated "${product.name}" -> ${palette.join(", ")}`);
  }

  console.log("Done.");
  process.exit(0);
}

run().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
