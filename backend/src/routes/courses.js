import { Router } from "express";
import { readJSON, writeJSON, nextId } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { visibleCourses } from "../access.js";
import { isCancelled } from "../classSessions.js";
import { DEPARTMENTS, LEVELS, clean, sameClass } from "../academics.js";

const router = Router();

function toResponse(course, accounts = readJSON("staffAndAdmin")) {
  const lecturer = accounts.find((a) => a.staffId === course.staffId);
  return {
    id: course.id,
    name: course.name,
    department: course.department,
    level: course.level,
    staffId: course.staffId,
    lecturerName: lecturer?.fullName ?? null,
    active: course.active,
  };
}

// Returns an error message, or null when the course is valid.
function validate(course, others) {
  if (!course.name) return "Course name is required.";
  if (course.name.length > 100) return "Course name is too long (100 characters max).";
  if (!DEPARTMENTS.includes(course.department)) return "Select a valid department.";
  if (!LEVELS.includes(course.level)) return "Select a valid level.";
  if (
    course.staffId !== null &&
    !readJSON("staffAndAdmin").some((a) => a.staffId === course.staffId && a.role === "staff")
  ) {
    return "The assigned lecturer must be an existing staff account.";
  }
  const name = course.name.toLowerCase();
  if (others.some((c) => sameClass(c, course) && c.name.toLowerCase() === name)) {
    return "This class already has a course with that name.";
  }
  return null;
}

const staffIdFrom = (value) => clean(value).toUpperCase() || null;

router.get("/", requireAuth, (req, res) => {
  const accounts = readJSON("staffAndAdmin");
  res.json(visibleCourses(req.user).map((c) => toResponse(c, accounts)));
});

router.post("/", requireAuth, requireRole("admin"), (req, res) => {
  const body = req.body ?? {};
  const courses = readJSON("courses");
  const course = {
    id: nextId(courses),
    name: clean(body.name),
    department: clean(body.department),
    level: clean(body.level),
    staffId: staffIdFrom(body.staffId),
    active: true,
    createdBy: { id: req.user.matricule, role: req.user.role },
    createdAt: new Date().toISOString(),
  };
  const error = validate(course, courses);
  if (error) return res.status(400).json({ error });

  courses.push(course);
  writeJSON("courses", courses);
  res.status(201).json(toResponse(course));
});

// Edit, deactivate ({ active: false }) or reactivate. Courses are never deleted,
// because attendance records point at them.
router.patch("/:id", requireAuth, requireRole("admin"), (req, res) => {
  const body = req.body ?? {};
  const courses = readJSON("courses");
  const index = courses.findIndex((c) => c.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Course not found." });

  const current = courses[index];
  const course = { ...current };
  for (const field of ["name", "department", "level"]) {
    if (body[field] !== undefined) course[field] = clean(body[field]);
  }
  if (body.staffId !== undefined) course.staffId = staffIdFrom(body.staffId);
  if (body.active !== undefined) {
    if (typeof body.active !== "boolean") {
      return res.status(400).json({ error: "active must be true or false." });
    }
    course.active = body.active;
  }

  const error = validate(course, courses.filter((c) => c.id !== course.id));
  if (error) return res.status(400).json({ error });

  // Moving a course to another class would hand its attendance history to that class.
  if (
    !sameClass(course, current) &&
    readJSON("classSessions").some((s) => s.courseId === course.id && !isCancelled(s))
  ) {
    return res.status(409).json({
      error: "This course already has class sessions, so its department and level are locked. Deactivate it and create a new course instead.",
    });
  }

  course.updatedBy = { id: req.user.matricule, role: req.user.role };
  course.updatedAt = new Date().toISOString();
  courses[index] = course;
  writeJSON("courses", courses);
  res.json(toResponse(course));
});

export default router;
