const express = require("express");
// const connectDb = require("./src/config/dbConnect");
// const errorHandler = require("./src/middleware/errorHandler");
const authRoute = require('./src/routes/auth.route');
const dotenv = require("dotenv").config();
const cors = require("cors");

// connectDb();
const app = express();

const port = process.env.PORT || 5000;
app.use(
  cors({
    credentials: true,
    origin: "*",
  })
);
app.use(express.json());
app.use("/api/auth", authRoute);
// app.use("/api", authRoutes);


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});