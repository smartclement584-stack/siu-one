import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/auth.js";
import studentRoutes from "./src/routes/students.js";
import attendanceRoutes from "./src/routes/attendance.js";
import announcementRoutes from "./src/routes/announcements.js";
import eventRoutes from "./src/routes/events.js";
import goalRoutes from "./src/routes/goals.js";
import courseRoutes from "./src/routes/courses.js";
import staffRoutes from "./src/routes/staff.js";
import classSessionRoutes from "./src/routes/classSessions.js";
import disputeRoutes from "./src/routes/disputes.js";

if (!process.env.JWT_SECRET) {
  console.warn("[warn] JWT_SECRET not set - using an insecure dev default. Copy .env.example to .env.");
}

const app = express();
const PORT = process.env.PORT || 4000;

// Comma-separated list. Defaults: Vite dev server and the built-app preview.
const origins = (process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:4173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(cors({ origin: origins }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/class-sessions", classSessionRoutes);
app.use("/api/disputes", disputeRoutes);

app.use("/api", (req, res) => res.status(404).json({ error: "Not found." }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") return res.status(400).json({ error: "Invalid JSON body." });
  console.error(err);
  res.status(500).json({ error: "Internal server error." });
});

// Express passes startup failures (such as a busy port) to this callback.
app.listen(PORT, (error) => {
  if (error) throw error;
  console.log(`SIU One API listening on http://localhost:${PORT}`);
});
