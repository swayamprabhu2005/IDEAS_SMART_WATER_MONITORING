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

app.listen(5000, () => {
    console.log("🚀 Server running on port: http://localhost:5000");
});
