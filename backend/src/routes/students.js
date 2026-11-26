import { Router } from "express";
import { readJSON } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, requireRole("delegate", "admin"), (req, res) => {
  const students = readJSON("students").map(({ passwordHash, ...rest }) => rest);
  res.json(students);
});

export default router;
