import { Router } from "express";
import { readJSON } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// Lecturer / supervisor accounts, so an admin can assign courses to them.
router.get("/", requireAuth, requireRole("admin"), (req, res) => {
  const staff = readJSON("staffAndAdmin")
    .filter((a) => a.role === "staff")
    .map(({ staffId, fullName, userType, department }) => ({
      staffId,
      fullName,
      userType,
      department,
    }));
  res.json(staff);
});

export default router;
