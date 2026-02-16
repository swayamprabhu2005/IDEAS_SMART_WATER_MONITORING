const express = require("express");
const Reading = require("../models/Reading");
const kmeans = require("../utils/kmeans");

const router = express.Router();

// ESP32 sends real data here
router.post("/data", async (req, res) => {
    try {
        const { pH, turbidity } = req.body;

        // FIXED VALIDATION
        if (pH === undefined || turbidity === undefined) {
            return res.status(400).json({ message: "Invalid sensor data" });
        }

        console.log("New Reading:", pH, turbidity);

        const newReading = new Reading({ pH, turbidity });
        await newReading.save();

        const recent = await Reading.find()
            .sort({ timestamp: -1 })
            .limit(20);

        const clustered = kmeans(recent);

        for (let item of clustered) {
            await Reading.findByIdAndUpdate(item._id, {
                cluster: item.cluster
            });
        }

        res.json({ message: "Data stored and clustered successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});


// Frontend fetches data here
router.get("/readings", async (req, res) => {
    try {
        const readings = await Reading.find()
            .sort({ timestamp: 1 })
            .limit(50);

        res.json(readings);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
