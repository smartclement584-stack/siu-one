import { Router } from "express";
import { readJSON } from "../db.js";
import { requireAuth, requireRole, requireCourseAccess } from "../middleware/auth.js";
import { canAccessCourse } from "../access.js";
import {
  findClassSession,
  createClassSession,
  cancelClassSession,
  isCancelled,
} from "../classSessions.js";
import { TRIMESTERS, WEEKS, clean, isIsoDate, isTime } from "../academics.js";

const router = Router();

function toResponse(session, course, records) {
  return {
    ...session,
    courseName: course.name,
    department: course.department,
    level: course.level,
    attendanceRecorded: records.some((r) => r.classSessionId === session.id),
  };
}

// Staff see sessions of their own courses; admin sees all. Optional ?courseId=
router.get("/", requireAuth, requireRole("staff", "admin"), (req, res) => {
  const courses = readJSON("courses");
  const records = readJSON("attendanceSessions");
  const courseId = req.query.courseId ? Number(req.query.courseId) : null;

  const sessions = readJSON("classSessions").flatMap((session) => {
    if (isCancelled(session)) return [];
    if (courseId !== null && session.courseId !== courseId) return [];
    const course = courses.find((c) => c.id === session.courseId);
    if (!course || !canAccessCourse(req.user, course)) return [];
    return [toResponse(session, course, records)];
  });
  sessions.sort((a, b) => b.sessionDate.localeCompare(a.sessionDate) || b.id - a.id);
  res.json(sessions);
});

const courseFromBody = (req) => {
  const course = readJSON("courses").find((c) => c.id === Number(req.body?.courseId));
  return course ? { course } : { status: 400, error: "Select a valid course." };
};

router.post(
  "/",
  requireAuth,
  requireRole("staff", "admin"),
  requireCourseAccess(courseFromBody),
  (req, res) => {
    const { course } = req;
    if (!course.active) {
      return res.status(400).json({ error: "This course is deactivated." });
    }

    const details = {
      courseId: course.id,
      trimester: clean(req.body.trimester),
      week: clean(req.body.week),
      sessionDate: clean(req.body.sessionDate),
      startTime: clean(req.body.startTime),
    };
    if (!TRIMESTERS.includes(details.trimester)) {
      return res.status(400).json({ error: "Select a valid trimester." });
    }
    if (!WEEKS.includes(details.week)) {
      return res.status(400).json({ error: "Select a valid week." });
    }
    if (!isIsoDate(details.sessionDate)) {
      return res.status(400).json({ error: "Invalid session date." });
    }
    if (details.startTime && !isTime(details.startTime)) {
      return res.status(400).json({ error: "Start time must be HH:MM." });
    }
    if (findClassSession(details)) {
      return res.status(409).json({
        error: "This course already has a class session for that trimester, week and date.",
      });
    }

    const session = createClassSession(details, req.user);
    res.status(201).json(toResponse(session, course, []));
  }
);

const courseFromSession = (req) => {
  const session = readJSON("classSessions").find((s) => s.id === Number(req.params.id));
  const course =
    session &&
    !isCancelled(session) &&
    readJSON("courses").find((c) => c.id === session.courseId);
  if (!course) return { status: 404, error: "Class session not found." };
  req.classSession = session;
  return { course };
};

// Cancel a scheduled session. Once attendance exists it is history and stays.
router.delete(
  "/:id",
  requireAuth,
  requireRole("staff", "admin"),
  requireCourseAccess(courseFromSession),
  (req, res) => {
    const { id } = req.classSession;
    if (readJSON("attendanceSessions").some((r) => r.classSessionId === id)) {
      return res.status(409).json({
        error: "Attendance has been recorded for this session, so it cannot be cancelled.",
      });
    }
    cancelClassSession(id, req.user);
    res.status(204).end();
  }
);

export default router;
