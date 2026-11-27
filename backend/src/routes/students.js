import { Router } from "express";
import { readJSON } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { canAccessStudent } from "../access.js";

const router = Router();

// Admin: everyone. Delegate: their class. Staff: classes of their own courses.
router.get("/", requireAuth, requireRole("delegate", "staff", "admin"), (req, res) => {
  const students = readJSON("students")
    .filter((student) => canAccessStudent(req.user, student))
    .map(({ passwordHash, ...rest }) => rest);
  res.json(students);
});

export default router;
