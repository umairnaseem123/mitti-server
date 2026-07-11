const Subscriber = require("../models/Subscriber");

// POST /api/subscribers — public, anyone can subscribe
const subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email address." });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await Subscriber.findOne({ email: normalizedEmail });
    if (existing) {
      // Not an error — just let them know they're already on the list
      return res
        .status(200)
        .json({ message: "You're already subscribed!" });
    }
    await Subscriber.create({ email: normalizedEmail });
    res.status(201).json({ message: "Subscribed successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/subscribers — admin only, view the email list
const getSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    res.status(200).json(subscribers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/subscribers/:id — admin only, remove an email from the list
const deleteSubscriber = async (req, res) => {
  try {
    const deleted = await Subscriber.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Subscriber not found" });
    }
    res.status(200).json({ message: "Subscriber removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { subscribe, getSubscribers, deleteSubscriber };
