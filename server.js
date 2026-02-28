const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./backend/config/db");
const dataRoutes = require("./backend/routes/dataRoutes");
const activeRoutes = require("./backend/routes/activeRoutes");

require("./backend/scheduler.js");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

app.use("/api", dataRoutes);
app.use("/api", activeRoutes);

app.use(express.static(path.join(__dirname, "./frontend")));

app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on http://localhost:5000");
});