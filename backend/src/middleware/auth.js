/*
 * ROLE / PERMISSION MATRIX  (charter OBJ02 - pending SIU approval)
 *
 * Roles and the charter user types they cover:
 *   student   Students
 *   delegate  Class Delegates
 *   staff     Lecturers, Supervisors
 *   admin     Administration, Student Board
 *
 * Y = allowed, - = denied.
 * own    = the caller's own record, or (staff) courses assigned to them
 * class  = the caller's department + level
 * Anything not listed is DENIED (deny by default).
 *
 * Capability                              student   delegate  staff      admin
 * ------------------------------------------------------------------------------
 * Self-register an account                  Y(1)       -         -          -
 * Log in, read own profile (/auth/me)       Y          Y         Y          Y
 * Read announcements and events             Y          Y         Y          Y
 * Create / edit / delete announcements      -          -         -          Y
 * Create / edit / delete calendar events    -          -         -          Y
 * Read courses                              class(2)   class(2)  own        Y
 * Create / edit / deactivate courses        -          -         -          Y
 * List staff accounts                       -          -         -          Y
 * View class sessions                       -          -         own        Y
 * Schedule class sessions                   -          -(3)      own        Y
 * Cancel a session with no attendance yet   -          -         own        Y
 * List students                             -          class     own(4)     Y
 * Read attendance session records           -          class     own        Y
 * Record attendance                         -          class     own        Y
 * Read a student's attendance summary       own        class     own(4)     Y
 * Read / save an academic goal              own        -         -          -
 * Report an attendance dispute              own        -         -          -
 * View own disputes                         own        -         -          -
 * View / approve / reject disputes          -          class(5)  own        Y
 *
 * (1) Registration only ever creates students. Delegate, staff and admin
 *     accounts come from the seed; no API can create or promote them.
 * (2) Active courses only.
 * (3) A delegate cannot schedule directly. Saving attendance for a meeting that
 *     was not scheduled creates its class session automatically.
 * (4) Students in a class that takes one of the lecturer's courses. The summary
 *     only includes the lecturer's own courses.
 * (5) Includes records the delegate entered themself. Flag for OBJ02 review.
 */
import jwt from "jsonwebtoken";
import { canAccessCourse, canAccessStudent, findStudent } from "../access.js";

// Accounts stored in staffAndAdmin.json.
export const STAFF_ROLES = ["staff", "admin"];

const secret =() => process.env.JWT_SECRET || "dev-only-insecure-secret";

// `matricule` is the account ID for every role (matricule, delegateId or staffId).
export function signToken({ matricule, role }) {
  return jwt.sign({ matricule, role }, secret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || "8h",
  });
}

// Verifies the Bearer token and attaches req.user = { matricule, role }.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Authentication required." });
  }
  try {
    const { matricule, role } = jwt.verify(token, secret());
    req.user = { matricule, role };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token." });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "You do not have access to this resource." });
    }
    next();
  };
}

const isOwnRecord = (req) =>
  req.user.role === "student" &&
  req.user.matricule === String(req.params.matricule || "").trim().toUpperCase();

// The student themself, or a staff-side account whose scope includes that student.
export function requireSelfOrStaff(req, res, next) {
  if (isOwnRecord(req) || canAccessStudent(req.user, findStudent(req.params.matricule))) {
    return next();
  }
  res.status(403).json({ error: "You can only access your own records." });
}

// Same idea for course-level actions. `resolve(req)` finds the course the request
// targets and returns { course } or { status, error }. Callers outside that course's
// scope are refused; the course is passed on as req.course.
export function requireCourseAccess(resolve) {
  return (req, res, next) => {
    const { course, status, error } = resolve(req);
    if (error) return res.status(status).json({ error });
    if (!canAccessCourse(req.user, course)) {
      return res.status(403).json({ error: "You do not have access to this course." });
    }
    req.course = course;
    next();
  };
}

// Private to the student: no other role, whatever its privileges.
export function requireSelf(req, res, next) {
  if (isOwnRecord(req)) return next();
  res.status(403).json({ error: "You can only access your own records." });
}
