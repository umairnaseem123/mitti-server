const Settings = require("../models/Settings");

// GET settings (creates default if none exist)
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE settings (admin only)
const updateSettings = async (req, res) => {
  try {
    const { taxPercentage, codExtraCharge, deliveryCharge } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    if (taxPercentage !== undefined) settings.taxPercentage = taxPercentage;
    if (codExtraCharge !== undefined) settings.codExtraCharge = codExtraCharge;
    if (deliveryCharge !== undefined) settings.deliveryCharge = deliveryCharge;

    const updatedSettings = await settings.save();
    res.status(200).json(updatedSettings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getSettings, updateSettings };
