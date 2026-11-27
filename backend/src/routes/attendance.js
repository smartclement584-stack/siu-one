import { Router } from "express";
import { readJSON, writeJSON, nextId } from "../db.js";
import {
  requireAuth,
  requireRole,
  requireSelfOrStaff,
  requireCourseAccess,
} from "../middleware/auth.js";
import {
  accessibleRecords,
  canAccessCourse,
  classRoster,
  findStudent,
  withCourseName,
} from "../access.js";
import { findClassSession, createClassSession, isCancelled } from "../classSessions.js";
import { STATUSES, TRIMESTERS, WEEKS, clean, isIsoDate } from "../academics.js";

const router = Router();

router.get("/sessions", requireAuth, requireRole("delegate", "staff", "admin"), (req, res) => {
  res.json(accessibleRecords(req.user));
});

// Works out which course (and scheduled session) a new attendance record is for.
// Two request shapes:
//   { classSessionId, attendance }                              staff, admin, delegate
//   { trimester, week, discipline, sessionDate, attendance }    delegate and admin only
function attendanceTarget(req) {
  const body = req.body ?? {};
  const courses = readJSON("courses");

  if (body.classSessionId !== undefined) {
    const session = readJSON("classSessions").find((s) => s.id === Number(body.classSessionId));
    const course = session && courses.find((c) => c.id === session.courseId);
    if (!course) return { status: 400, error: "Unknown class session." };
    req.classSession = session;
    return { course };
  }

  if (req.user.role === "staff") {
    return { status: 400, error: "Select one of your scheduled class sessions (classSessionId)." };
  }

  const { trimester, week, discipline, sessionDate } = body;
  if (!trimester || !week || !discipline || !sessionDate) {
    return { status: 400, error: "Trimester, week, discipline and session date are required." };
  }
  const named = courses.filter((c) => c.active && c.name === discipline);
  // Different classes can share a course name; a delegate always means their own.
  const matches =
    req.user.role === "admin" ? named : named.filter((c) => canAccessCourse(req.user, c));
  if (matches.length === 0) return { status: 400, error: "Unknown discipline." };
  if (matches.length > 1) {
    return {
      status: 400,
      error: "Several classes have this course. Send classSessionId instead.",
    };
  }
  return { course: matches[0] };
}

router.post(
  "/sessions",
  requireAuth,
  requireRole("delegate", "staff", "admin"),
  requireCourseAccess(attendanceTarget),
  (req, res) => {
    const { course, classSession } = req;
    const { attendance } = req.body;

    if (!course.active) {
      return res.status(400).json({ error: "This course is deactivated." });
    }
    if (classSession && isCancelled(classSession)) {
      return res.status(409).json({ error: "This class session was cancelled." });
    }

    const details = classSession ?? {
      courseId: course.id,
      trimester: clean(req.body.trimester),
      week: clean(req.body.week),
      sessionDate: clean(req.body.sessionDate),
    };
    if (!classSession) {
      if (!TRIMESTERS.includes(details.trimester) || !WEEKS.includes(details.week)) {
        return res.status(400).json({ error: "Invalid trimester or week." });
      }
      if (!isIsoDate(details.sessionDate)) {
        return res.status(400).json({ error: "Invalid session date." });
      }
    }

    if (!attendance || typeof attendance !== "object" || Array.isArray(attendance)) {
      return res.status(400).json({ error: "Attendance must be an object of matricule: status." });
    }

    const matricules = classRoster(course).map((s) => s.matricule);
    if (matricules.length === 0) {
      return res.status(400).json({ error: "No students are registered in this class yet." });
    }
    const unknown = Object.keys(attendance).filter((m) => !matricules.includes(m));
    if (unknown.length) {
      return res.status(400).json({ error: `Not in this class: ${unknown.join(", ")}.` });
    }
    const unmarked = matricules.filter((m) => !STATUSES.includes(attendance[m]));
    if (unmarked.length) {
      return res.status(400).json({
        error: `Every student must be marked Present, Absent or Late. Missing/invalid: ${unmarked.join(", ")}.`,
      });
    }

    const records = readJSON("attendanceSessions");

    // One record per class session, whoever enters it, so nobody is counted twice.
    // Corrections go through the dispute process.
    const existing = findClassSession(details);
    if (existing && records.some((r) => r.classSessionId === existing.id)) {
      return res.status(409).json({
        error: "Attendance has already been recorded for this class session.",
      });
    }

    // Only create the scheduled session once the whole request is known to be valid.
    const session = existing ?? createClassSession(details, req.user);

    const record = {
      id: nextId(records),
      classSessionId: session.id,
      courseId: course.id,
      trimester: session.trimester,
      week: session.week,
      discipline: course.name,
      sessionDate: session.sessionDate,
      // Only copy the validated keys, in registry order.
      attendance: Object.fromEntries(matricules.map((m) => [m, attendance[m]])),
      // Sensitive change: record who made it and when, inside the record itself.
      createdBy: { id: req.user.matricule, role: req.user.role },
      createdAt: new Date().toISOString(),
    };
    records.push(record);
    writeJSON("attendanceSessions", records);
    res.status(201).json(record);
  }
);

router.get("/student/:matricule", requireAuth, requireSelfOrStaff, (req, res) => {
  const student = findStudent(req.params.matricule);
  if (!student) return res.status(404).json({ error: "Student not found." });
  const { matricule } = student;

  // The student sees all their records; others only the courses within their scope.
  const courses = readJSON("courses");
  const records =
    req.user.role === "student"
      ? readJSON("attendanceSessions").map((r) =>
          withCourseName(r, courses.find((c) => c.id === r.courseId))
        )
      : accessibleRecords(req.user);

  // One entry per record, carrying only this student's status - never classmates'.
  const sessions = records
    .filter((r) => STATUSES.includes(r.attendance?.[matricule]))
    .map((r) => ({
      id: r.id,
      classSessionId: r.classSessionId,
      courseId: r.courseId,
      discipline: r.discipline,
      trimester: r.trimester,
      week: r.week,
      sessionDate: r.sessionDate,
      status: r.attendance[matricule],
    }));

  const counts = { present: 0, absent: 0, late: 0 };
  const byDiscipline = {};
  for (const session of sessions) {
    const key = session.status.toLowerCase();
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
