import { Router } from "express";
import { readJSON, writeJSON } from "../db.js";
import { requireAuth, requireSelf } from "../middleware/auth.js";
import { visibleCourses } from "../access.js";

const router = Router();

// Responds with the saved goal, or null when the student has none yet.
router.get("/:matricule", requireAuth, requireSelf, (req, res) => {
  const matricule = req.params.matricule.trim().toUpperCase();
  res.json(readJSON("goals").find((g) => g.matricule === matricule) || null);
});

router.put("/:matricule", requireAuth, requireSelf, (req, res) => {
  const matricule = req.params.matricule.trim().toUpperCase();
  const { discipline, target, requiredFinal } = req.body;

  if (!readJSON("students").some((s) => s.matricule === matricule)) {
    return res.status(404).json({ error: "Student not found." });
  }
  if (!visibleCourses(req.user).some((c) => c.name === discipline)) {
    return res.status(400).json({ error: "Unknown discipline." });
  }
  const targetNum = Number(target);
  if (target == null || target === "" || !Number.isFinite(targetNum) || targetNum < 0 || targetNum > 100) {
    return res.status(400).json({ error: "Target must be a number between 0 and 100." });
  }
  // requiredFinal is a number-like value or the literal "Already secured".
  const finalOk =
    requiredFinal === "Already secured" ||
    (requiredFinal !== "" && requiredFinal != null && Number.isFinite(Number(requiredFinal)));
  if (!finalOk) {
    return res.status(400).json({ error: "requiredFinal must be a number or 'Already secured'." });
  }

  const goals = readJSON("goals");
  const goal = {
    matricule,
    discipline,
    target: targetNum,
    requiredFinal,
    updatedAt: new Date().toISOString(),
  };
  const index = goals.findIndex((g) => g.matricule === matricule);
  if (index === -1) goals.push(goal);
  else goals[index] = goal;
  writeJSON("goals", goals);
  res.json(goal);
});

export default router;
