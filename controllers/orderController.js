const Order = require("../models/Order");

// CREATE order (customer checkout)
const createOrder = async (req, res) => {
  try {
    const { customer, items, totalAmount, paymentMethod, transactionId } =
      req.body;
    const order = await Order.create({
      customer,
      items,
      totalAmount,
      paymentMethod,
      transactionId: transactionId || null,
    });
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET all orders (admin only)
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET single order
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE order status (admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// TRACK order (public — customer provides order ID + phone number,
// both must match before any order details are returned. This prevents
// someone from viewing another customer's order just by guessing an ID.)
const trackOrder = async (req, res) => {
  try {
    const { orderId, phone } = req.body;

    if (!orderId || !phone) {
      return res
        .status(400)
        .json({ message: "Order ID and phone number are required." });
    }

    let order;
    try {
      order = await Order.findById(orderId.trim());
    } catch (err) {
      // Malformed ObjectId — treat the same as "not found" rather than
      // leaking a stack trace or a different error shape.
      order = null;
    }

    if (!order) {
      return res.status(404).json({ message: "No order found with that ID." });
    }

    const normalizedInput = phone.trim().replace(/[\s-]/g, "");
    const normalizedStored = order.customer.phone.trim().replace(/[\s-]/g, "");

    if (normalizedInput !== normalizedStored) {
      return res
        .status(404)
        .json({ message: "No order found with that ID and phone number." });
    }

    res.status(200).json({
      _id: order._id,
      customer: { name: order.customer.name },
      items: order.items,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      createdAt: order.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  trackOrder,
};
