// server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");

dotenv.config();

const app = express();

// DB Connection
connectDB();

// Middleware
app.use(cors());
app.use(express.json()); // for JSON requests
app.use(express.urlencoded({ extended: true })); // for form data

// Routes
app.use("/api/auth", authRoutes);

// Global Error Handler
app.use(errorMiddleware);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`)
);
