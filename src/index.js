require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { clerkMiddleware } = require("@clerk/express");

const userRoutes = require("./routes/userRoutes");
const emergencyRoutes = require("./routes/emergencyRoutes");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Make io accessible globally
global.io = io;

// Middleware
app.use(clerkMiddleware());
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/emergencies", emergencyRoutes);

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("reportEmergency", (data) => {
    console.log("New emergency reported:", data);

    io.emit("newEmergency", data);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Emergency Response Platform API" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
