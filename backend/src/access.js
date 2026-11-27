// Who may see or touch which data. Every rule here is deny-by-default:
//   admin     everything
//   staff     courses assigned to them, and those courses' classes
//   delegate  their own class (department + level)
//   student   their own class's active courses (own records are checked separately)
import { readJSON } from "./db.js";
import { sameClass } from "./academics.js";

export const findStudent = (matricule) => {
  const id = String(matricule || "").trim().toUpperCase();
  return readJSON("students").find((s) => s.matricule === id);
};

const findDelegate = (user) =>
  readJSON("delegates").find((d) => d.delegateId === user.matricule);

// May the caller act on this course and its records? Students never may.
// Deactivated courses still count, so their history stays reachable.
export function canAccessCourse(user, course) {
  if (user.role === "admin") return true;
  if (!course) return false;
  if (user.role === "staff") return course.staffId === user.matricule;
  if (user.role === "delegate") return sameClass(findDelegate(user), course);
  return false;
}

// The course list each role is allowed to read.
export function visibleCourses(user) {
  const courses = readJSON("courses");
  if (user.role === "student") {
    const student = findStudent(user.matricule);
    return courses.filter((c) => c.active && sameClass(student, c));
  }
  const own = courses.filter((c) => canAccessCourse(user, c));
  // Delegates only pick courses to record, so deactivated ones are hidden.
  return user.role === "delegate" ? own.filter((c) => c.active) : own;
}

export function canAccessStudent(user, student) {
  if (user.role === "admin") return true;
  if (!student) return false;
  if (user.role === "delegate") return sameClass(findDelegate(user), student);
  if (user.role === "staff") {
    return readJSON("courses").some(
      (c) => c.staffId === user.matricule && sameClass(c, student)
    );
  }
  return false;
}

// Attendance records the caller may act on, each with its course's current name.
export function accessibleRecords(user) {
  const courses = readJSON("courses");
  return readJSON("attendanceSessions").flatMap((record) => {
    const course = courses.find((c) => c.id === record.courseId);
    if (!canAccessCourse(user, course)) return [];
    return [withCourseName(record, course)];
  });
}

// A renamed course shows its new name everywhere, including old records.
export const withCourseName = (record, course) => ({
  ...record,
  discipline: course?.name ?? record.discipline,
});

export const classRoster = (course) =>
  readJSON("students").filter((s) => sameClass(s, course));
