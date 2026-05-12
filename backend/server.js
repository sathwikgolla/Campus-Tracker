import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import http from "http";
import morgan from "morgan";
import { Server } from "socket.io";
import connectDB from "./src/config/db.js";
import { setSocketServer } from "./src/config/socket.js";
import { errorHandler, notFound } from "./src/middleware/errorMiddleware.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import analyticsRoutes from "./src/routes/analyticsRoutes.js";
import appointmentRoutes from "./src/routes/appointmentRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import attendanceRoutes from "./src/routes/attendanceRoutes.js";
import broadcastRoutes from "./src/routes/broadcastRoutes.js";
import chatRoutes from "./src/routes/chatRoutes.js";
import departmentRoutes from "./src/routes/departmentRoutes.js";
import eventRoutes from "./src/routes/eventRoutes.js";
import facultyRoutes from "./src/routes/facultyRoutes.js";
import favoriteRoutes from "./src/routes/favoriteRoutes.js";
import forumRoutes from "./src/routes/forumRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import predictionRoutes from "./src/routes/predictionRoutes.js";
import requestRoutes from "./src/routes/requestRoutes.js";
import searchRoutes from "./src/routes/searchRoutes.js";
import statusRoutes from "./src/routes/statusRoutes.js";
import studentRoutes from "./src/routes/studentRoutes.js";
import teacherRoutes from "./src/routes/teacherRoutes.js";
import testEmailRoutes from "./src/routes/testEmailRoutes.js";
import themeRoutes from "./src/routes/themeRoutes.js";
import timetableRoutes from "./src/routes/timetableRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  ...(process.env.CLIENT_URL || "").split(",").map((origin) => origin.trim()).filter(Boolean),
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});
setSocketServer(io);

connectDB();

app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later" },
}));

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "CampusTracker API is healthy" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/slots", teacherRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/broadcasts", broadcastRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/themes", themeRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/forum", forumRoutes);
if (process.env.NODE_ENV !== "production") {
  app.use("/api/test-email", testEmailRoutes);
}

io.on("connection", (socket) => {
  socket.on("joinUser", (userId) => userId && socket.join(`user:${userId}`));
  socket.on("joinRole", (role) => role && socket.join(`role:${role}`));
  socket.on("joinDepartment", (department) => department && socket.join(`department:${department}`));
});

app.use(notFound);
app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`CampusTracker API running on port ${PORT}`);
});
