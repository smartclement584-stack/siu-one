import { Router } from "express";
import { readJSON, writeJSON, nextId } from "../db.js";
import { requireAuth, requireRole, requireSelfOrStaff } from "../middleware/auth.js";

const router = Router();
const STATUSES = ["Present", "Absent", "Late"];

router.get("/sessions", requireAuth, requireRole("delegate", "admin"), (req, res) => {
  res.json(readJSON("attendanceSessions"));
});

router.post("/sessions", requireAuth, requireRole("delegate", "admin"), (req, res) => {
  const { trimester, week, discipline, sessionDate, attendance } = req.body;

  if (!trimester || !week || !discipline || !sessionDate) {
    return res.status(400).json({ error: "Trimester, week, discipline and session date are required." });
  }
  if (!readJSON("courses").some((c) => c.name === discipline)) {
    return res.status(400).json({ error: "Unknown discipline." });
  }
  if (Number.isNaN(Date.parse(sessionDate))) {
    return res.status(400).json({ error: "Invalid session date." });
  }
  if (!attendance || typeof attendance !== "object" || Array.isArray(attendance)) {
    return res.status(400).json({ error: "Attendance must be an object of matricule: status." });
  }

  const matricules = readJSON("students").map((s) => s.matricule);
  const unknown = Object.keys(attendance).filter((m) => !matricules.includes(m));
  if (unknown.length) {
    return res.status(400).json({ error: `Unknown matricule(s): ${unknown.join(", ")}.` });
  }
  const unmarked = matricules.filter((m) => !STATUSES.includes(attendance[m]));
  if (unmarked.length) {
    return res.status(400).json({
      error: `Every student must be marked Present, Absent or Late. Missing/invalid: ${unmarked.join(", ")}.`,
    });
  }

  // Only copy the validated keys, in registry order.
  const cleanAttendance = Object.fromEntries(matricules.map((m) => [m, attendance[m]]));

  const sessions = readJSON("attendanceSessions");
  const session = {
    id: nextId(sessions),
    trimester,
    week,
    discipline,
    sessionDate,
    attendance: cleanAttendance,
    // Sensitive change: record who made it and when, inside the record itself.
    createdBy: { id: req.user.matricule, role: req.user.role },
    createdAt: new Date().toISOString(),
  };
  sessions.push(session);
  writeJSON("attendanceSessions", sessions);
  res.status(201).json(session);
});

router.get("/student/:matricule", requireAuth, requireSelfOrStaff, (req, res) => {
  const matricule = req.params.matricule.trim().toUpperCase();
  if (!readJSON("students").some((s) => s.matricule === matricule)) {
    return res.status(404).json({ error: "Student not found." });
  }

  const sessions = readJSON("attendanceSessions").filter((s) =>
    STATUSES.includes(s.attendance?.[matricule])
  );

  const counts = { present: 0, absent: 0, late: 0 };
  const byDiscipline = {};
  for (const session of sessions) {
    const status = session.attendance[matricule];
    const key = status.toLowerCase();
    counts[key] += 1;
    byDiscipline[session.discipline] ??= { total: 0, present: 0, late: 0, absent: 0 };
    byDiscipline[session.discipline].total += 1;
    byDiscipline[session.discipline][key] += 1;
  }

  const total = sessions.length;
  res.json({
    matricule,
    totalSessions: total,
    presentCount: counts.present,
    absentCount: counts.absent,
    lateCount: counts.late,
    // Late counts as attended for the percentage; null when there is no data yet.
    attendancePercentage: total ? Math.round(((counts.present + counts.late) / total) * 100) : null,
    attendanceByDiscipline: byDiscipline,
    sessions,
  });
});

export default router;
