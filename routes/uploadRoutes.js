const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

// POST /api/upload  (admin only)
// Accepts a single file under field name "image"
router.post("/", protect, admin, (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Errors thrown by Multer itself (file too large, too many files, etc.)
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ message: "Image is too large. Max file size is 10MB." });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      // Errors thrown from fileFilter (e.g. wrong file type)
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Build the public URL for the uploaded file
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.status(201).json({ imageUrl });
  });
});

module.exports = router;
