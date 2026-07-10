// cleanupOrders.js
// Run this once to delete all test orders from the database.
// Usage: node cleanupOrders.js

const mongoose = require("mongoose");

const MONGO_URI = "mongodb://localhost:27017/mitti-db";

async function cleanup() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB...");

    const db = mongoose.connection.db;
    const result = await db.collection("orders").deleteMany({});

    console.log(`Deleted ${result.deletedCount} orders successfully.`);
  } catch (err) {
    console.error("Error while cleaning up orders:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected. Done.");
    process.exit(0);
  }
}

cleanup();
