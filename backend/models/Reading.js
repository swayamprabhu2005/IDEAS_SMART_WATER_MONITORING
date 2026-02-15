const mongoose = require("mongoose");

const readingSchema = new mongoose.Schema({
    pH: Number,
    turbidity: Number,
    timestamp: { type: Date, default: Date.now },
    cluster: Number
});

module.exports = mongoose.model("Reading", readingSchema);
