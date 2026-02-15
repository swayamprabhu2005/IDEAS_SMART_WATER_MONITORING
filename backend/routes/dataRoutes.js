const express = require("express");
const Reading = require("../models/Reading");
const kmeans = require("../utils/kmeans");

const router = express.Router();

// ESP32 sends data here
router.post("/data", async (req, res) => {
    const { pH, turbidity } = req.body;

    const newReading = new Reading({ pH, turbidity });
    await newReading.save();

    // Get last 20 readings
    const recent = await Reading.find().sort({ timestamp: -1 }).limit(20);

    // Run KMeans
    const clustered = kmeans(recent);

    // Update cluster values in DB
    for (let item of clustered) {
        await Reading.findByIdAndUpdate(item._id, { cluster: item.cluster });
    }

    res.json({ message: "Data stored and clustered" });
});

// Frontend fetches data here
router.get("/readings", async (req, res) => {
    const readings = await Reading.find().sort({ timestamp: 1 }).limit(50);
    res.json(readings);
});

module.exports = router;
