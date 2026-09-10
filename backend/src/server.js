const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const projectRoutes = require("./routes/projectRoutes");

const taskRoutes = require("./routes/taskRoutes");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");

const commentRoutes = require("./routes/commentRoutes");

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/comments", commentRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "NOVA API is running 🚀",
  });
});

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`NOVA server running on port ${PORT}`);
});