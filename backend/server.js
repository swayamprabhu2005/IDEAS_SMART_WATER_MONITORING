const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const dataRoutes = require("./routes/dataRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api", dataRoutes);

app.use(express.static(path.join(__dirname, "../frontend")));

app.listen(5000, "0.0.0.0", () => {
    console.log("🚀 Server running on http://0.0.0.0:5000");
});

