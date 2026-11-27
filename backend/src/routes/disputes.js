import { Router } from "express";
import { readJSON, writeJSON, nextId } from "../db.js";
import { requireAuth, requireRole, requireCourseAccess } from "../middleware/auth.js";
import { canAccessCourse, findStudent } from "../access.js";
import { STATUSES, clean } from "../academics.js";

const router = Router();
const MAX_TEXT = 500;
const REVIEWERS = ["delegate", "staff", "admin"];

function toResponse(dispute, records, courses, students) {
  const record = records.find((r) => r.id === dispute.attendanceSessionId);
  const course = courses.find((c) => c.id === record?.courseId);
  return {
    ...dispute,
    studentName: students.find((s) => s.matricule === dispute.matricule)?.fullName ?? null,
    discipline: course?.name ?? record?.discipline ?? null,
    trimester: record?.trimester ?? null,
    week: record?.week ?? null,
    sessionDate: record?.sessionDate ?? null,
  };
}

const respond = (dispute) =>
  toResponse(dispute, readJSON("attendanceSessions"), readJSON("courses"), readJSON("students"));

// Students: their own disputes (all statuses).
// Reviewers: disputes on records within their scope; open ones unless ?status= says otherwise.
router.get("/", requireAuth, requireRole("student", ...REVIEWERS), (req, res) => {
  const records = readJSON("attendanceSessions");
  const courses = readJSON("courses");
  const students = readJSON("students");
  const isStudent = req.user.role === "student";

  const wanted = clean(req.query.status) || (isStudent ? "all" : "open");
  if (!["all", "open", "approved", "rejected"].includes(wanted)) {
    return res.status(400).json({ error: "status must be open, approved, rejected or all." });
  }

  const disputes = readJSON("disputes").filter((d) => {
    if (wanted !== "all" && d.status !== wanted) return false;
    if (isStudent) return d.matricule === req.user.matricule;
    const record = records.find((r) => r.id === d.attendanceSessionId);
    return canAccessCourse(req.user, courses.find((c) => c.id === record?.courseId));
  });

  res.json(disputes.map((d) => toResponse(d, records, courses, students)).reverse());
});

// A student disputes one of their own attendance records. The matricule always comes
// from the token, so nobody can file in another student's name.
router.post("/", requireAuth, requireRole("student"), (req, res) => {
  const body = req.body ?? {};
  const student = findStudent(req.user.matricule);
  if (!student) return res.status(404).json({ error: "Student not found." });
  const { matricule } = student;

  const record = readJSON("attendanceSessions").find(
    (r) => r.id === Number(body.attendanceSessionId)
  );
  const currentStatus = record?.attendance?.[matricule];
  // Same answer for "no such record" and "not yours".
  if (!currentStatus) return res.status(404).json({ error: "Attendance record not found." });

  const requestedStatus = clean(body.requestedStatus);
  const reason = clean(body.reason);
  if (!STATUSES.includes(requestedStatus)) {
    return res.status(400).json({ error: "Choose Present, Absent or Late as the correct status." });
  }
  if (requestedStatus === currentStatus) {
    return res.status(400).json({ error: `You are already marked ${currentStatus} for this session.` });
  }
  if (!reason) return res.status(400).json({ error: "Please give a short reason." });
  if (reason.length > MAX_TEXT) {
    return res.status(400).json({ error: `Keep the reason under ${MAX_TEXT} characters.` });
  }

  const disputes = readJSON("disputes");
  // One dispute per record: a reviewer's decision stands.
  if (disputes.some((d) => d.attendanceSessionId === record.id && d.matricule === matricule)) {
    return res.status(409).json({ error: "You have already disputed this record." });
  }

  const dispute = {
    id: nextId(disputes),
    attendanceSessionId: record.id,
    matricule,
    currentStatus,
    requestedStatus,
    reason,
    status: "open",
    createdBy: { id: matricule, role: req.user.role },
    createdAt: new Date().toISOString(),
    resolvedBy: null,
    resolvedAt: null,
    resolutionNote: null,
  };
  disputes.push(dispute);
  writeJSON("disputes", disputes);
  res.status(201).json(respond(dispute));
});

const courseOfDispute = (req) => {
  const dispute = readJSON("disputes").find((d) => d.id === Number(req.params.id));
  const record =
    dispute && readJSON("attendanceSessions").find((r) => r.id === dispute.attendanceSessionId);
  const course = record && readJSON("courses").find((c) => c.id === record.courseId);
  if (!course) return { status: 404, error: "Dispute not found." };
  return { course };
};

// Approve (corrects the attendance record) or reject (needs a short note).
router.patch(
  "/:id",
  requireAuth,
  requireRole(...REVIEWERS),
  requireCourseAccess(courseOfDispute),
  (req, res) => {
    const status = clean(req.body?.status);
    const note = clean(req.body?.resolutionNote);

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "status must be 'approved' or 'rejected'." });
    }
    if (status === "rejected" && !note) {
      return res.status(400).json({ error: "Add a short note explaining the rejection." });
    }
    if (note.length > MAX_TEXT) {
      return res.status(400).json({ error: `Keep the note under ${MAX_TEXT} characters.` });
    }

    const disputes = readJSON("disputes");
    const dispute = disputes.find((d) => d.id === Number(req.params.id));
    if (dispute.status !== "open") {
      return res.status(409).json({ error: `This dispute was already ${dispute.status}.` });
    }

    const resolvedBy = { id: req.user.matricule, role: req.user.role };
    const resolvedAt = new Date().toISOString();

    if (status === "approved") {
      const records = readJSON("attendanceSessions");
      const record = records.find((r) => r.id === dispute.attendanceSessionId);
      const from = record.attendance[dispute.matricule];
      record.attendance[dispute.matricule] = dispute.requestedStatus;
      // Sensitive change: the record keeps its own history of who corrected what.
      record.corrections = [
        ...(record.corrections ?? []),
        {
          matricule: dispute.matricule,
          from,
          to: dispute.requestedStatus,
          disputeId: dispute.id,
          by: resolvedBy,
          at: resolvedAt,
        },
      ];
      writeJSON("attendanceSessions", records);
    }

    Object.assign(dispute, { status, resolvedBy, resolvedAt, resolutionNote: note || null });
    writeJSON("disputes", disputes);
    res.json(respond(dispute));
  }
);

export default router;
