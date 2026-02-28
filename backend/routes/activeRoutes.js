const express = require("express");
const router = express.Router();   // ✅ MUST EXIST
const ActiveUser = require("../models/ActiveUser");

router.post("/mark-active", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    await ActiveUser.findOneAndUpdate(
      { email },
      { lastActive: new Date() },
      { upsert: true }
    );

    res.json({ message: "User marked active" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;   // ✅ MUST EXIST