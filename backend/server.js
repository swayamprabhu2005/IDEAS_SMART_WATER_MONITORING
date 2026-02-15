const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const dataRoutes = require("./routes/dataRoutes");

const app = express();

connectDB();  // 🔥 Connect DB here

app.use(cors());
app.use(express.json());

app.use("/api", dataRoutes);

app.listen(5000, () => {
    console.log("🚀 Server running on port 5000");
});
